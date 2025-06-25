const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Game state storage
const games = new Map();
const playerQueue = [];

// Game logic
const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }

  if (board.every(cell => cell !== null)) {
    return { winner: 'tie', line: null };
  }

  return null;
};

const createGame = (player1, player2) => {
  const gameId = uuidv4();
  const game = {
    id: gameId,
    players: {
      [player1.id]: { ...player1, symbol: 'X' },
      [player2.id]: { ...player2, symbol: 'O' }
    },
    board: Array(9).fill(null),
    currentPlayer: player1.id,
    status: 'playing',
    winner: null,
    winningLine: null
  };
  
  games.set(gameId, game);
  return game;
};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('join-queue', (playerName) => {
    const player = {
      id: socket.id,
      name: playerName || `Player ${socket.id.substring(0, 4)}`
    };

    // Remove player from queue if already there
    const existingIndex = playerQueue.findIndex(p => p.id === socket.id);
    if (existingIndex !== -1) {
      playerQueue.splice(existingIndex, 1);
    }

    playerQueue.push(player);
    socket.playerInfo = player;

    console.log(`${player.name} joined queue. Queue size: ${playerQueue.length}`);

    // Try to match players
    if (playerQueue.length >= 2) {
      const player1 = playerQueue.shift();
      const player2 = playerQueue.shift();

      const game = createGame(player1, player2);

      // Join both players to the game room
      const player1Socket = io.sockets.sockets.get(player1.id);
      const player2Socket = io.sockets.sockets.get(player2.id);

      if (player1Socket && player2Socket) {
        player1Socket.join(game.id);
        player2Socket.join(game.id);

        player1Socket.gameId = game.id;
        player2Socket.gameId = game.id;

        // Notify both players that game started
        io.to(game.id).emit('game-start', {
          gameId: game.id,
          players: game.players,
          board: game.board,
          currentPlayer: game.currentPlayer,
          yourSymbol: {
            [player1.id]: 'X',
            [player2.id]: 'O'
          }
        });

        console.log(`Game started: ${game.id}`);
      }
    } else {
      socket.emit('waiting-for-opponent');
    }
  });

  socket.on('make-move', (data) => {
    const { gameId, position } = data;
    const game = games.get(gameId);

    if (!game || game.status !== 'playing') {
      socket.emit('error', 'Game not found or not active');
      return;
    }

    if (game.currentPlayer !== socket.id) {
      socket.emit('error', 'Not your turn');
      return;
    }

    if (game.board[position] !== null) {
      socket.emit('error', 'Position already taken');
      return;
    }

    // Make the move
    const playerSymbol = game.players[socket.id].symbol;
    game.board[position] = playerSymbol;

    // Check for winner
    const result = checkWinner(game.board);
    if (result) {
      game.status = 'finished';
      game.winner = result.winner;
      game.winningLine = result.line;
    } else {
      // Switch turns
      const playerIds = Object.keys(game.players);
      game.currentPlayer = playerIds.find(id => id !== socket.id);
    }

    // Broadcast game state to both players
    io.to(gameId).emit('game-update', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner,
      winningLine: game.winningLine
    });

    if (game.status === 'finished') {
      console.log(`Game ${gameId} finished. Winner: ${game.winner}`);
    }
  });

  socket.on('play-again', () => {
    const gameId = socket.gameId;
    const game = games.get(gameId);

    if (!game) return;

    // Mark this player as wanting to play again
    game.players[socket.id].playAgain = true;

    const allPlayersReady = Object.values(game.players).every(player => player.playAgain);

    if (allPlayersReady) {
      // Reset the game
      game.board = Array(9).fill(null);
      game.status = 'playing';
      game.winner = null;
      game.winningLine = null;
      
      // Switch who goes first
      const playerIds = Object.keys(game.players);
      game.currentPlayer = game.currentPlayer === playerIds[0] ? playerIds[1] : playerIds[0];
      
      // Reset play again flags
      Object.values(game.players).forEach(player => {
        player.playAgain = false;
      });

      io.to(gameId).emit('game-restart', {
        board: game.board,
        currentPlayer: game.currentPlayer,
        status: game.status
      });
    } else {
      socket.emit('waiting-for-opponent-restart');
    }
  });

  socket.on('leave-game', () => {
    const gameId = socket.gameId;
    if (gameId) {
      socket.to(gameId).emit('opponent-left');
      games.delete(gameId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Remove from queue
    const queueIndex = playerQueue.findIndex(p => p.id === socket.id);
    if (queueIndex !== -1) {
      playerQueue.splice(queueIndex, 1);
    }

    // Handle game disconnection
    const gameId = socket.gameId;
    if (gameId) {
      socket.to(gameId).emit('opponent-disconnected');
      games.delete(gameId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
