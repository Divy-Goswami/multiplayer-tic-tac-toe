import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import GameBoard from './components/GameBoard';
import PlayerInput from './components/PlayerInput';
import GameStatus from './components/GameStatus';

const socket = io('http://localhost:5000');

function App() {
  const [gameState, setGameState] = useState('waiting-for-name'); // waiting-for-name, waiting-for-opponent, playing, finished
  const [playerName, setPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [yourSymbol, setYourSymbol] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('waiting-for-opponent', () => {
      setGameState('waiting-for-opponent');
      setMessage('Waiting for an opponent...');
    });

    socket.on('game-start', (data) => {
      setGameState('playing');
      setGameData(data);
      setYourSymbol(data.yourSymbol[socket.id]);
      setMessage('');
      setError('');
    });

    socket.on('game-update', (data) => {
      setGameData(prevData => ({
        ...prevData,
        ...data
      }));
      
      if (data.status === 'finished') {
        setGameState('finished');
      }
    });

    socket.on('game-restart', (data) => {
      setGameData(prevData => ({
        ...prevData,
        ...data
      }));
      setGameState('playing');
      setMessage('');
    });

    socket.on('waiting-for-opponent-restart', () => {
      setMessage('Waiting for opponent to confirm restart...');
    });

    socket.on('opponent-left', () => {
      setMessage('Your opponent left the game.');
      setGameState('waiting-for-name');
      setGameData(null);
    });

    socket.on('opponent-disconnected', () => {
      setMessage('Your opponent disconnected.');
      setGameState('waiting-for-name');
      setGameData(null);
    });

    socket.on('error', (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      socket.off('waiting-for-opponent');
      socket.off('game-start');
      socket.off('game-update');
      socket.off('game-restart');
      socket.off('waiting-for-opponent-restart');
      socket.off('opponent-left');
      socket.off('opponent-disconnected');
      socket.off('error');
    };
  }, []);

  const handleJoinQueue = (name) => {
    setPlayerName(name);
    socket.emit('join-queue', name);
  };

  const handleMove = (position) => {
    if (gameData && gameData.gameId) {
      socket.emit('make-move', {
        gameId: gameData.gameId,
        position: position
      });
    }
  };

  const handlePlayAgain = () => {
    socket.emit('play-again');
  };

  const handleLeaveGame = () => {
    socket.emit('leave-game');
    setGameState('waiting-for-name');
    setGameData(null);
    setPlayerName('');
    setMessage('');
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multiplayer Tic-Tac-Toe</h1>
        
        {gameState === 'waiting-for-name' && (
          <PlayerInput onJoinQueue={handleJoinQueue} />
        )}
        
        {gameState === 'waiting-for-opponent' && (
          <div className="waiting-state">
            <h2>Welcome, {playerName}!</h2>
            <p>{message}</p>
            <div className="spinner"></div>
          </div>
        )}
        
        {(gameState === 'playing' || gameState === 'finished') && gameData && (
          <div className="game-container">
            <GameStatus 
              gameData={gameData}
              yourSymbol={yourSymbol}
              socketId={socket.id}
              gameState={gameState}
            />
            
            <GameBoard 
              board={gameData.board}
              onMove={handleMove}
              isYourTurn={gameData.currentPlayer === socket.id}
              gameFinished={gameState === 'finished'}
              winningLine={gameData.winningLine}
            />
            
            {gameState === 'finished' && (
              <div className="game-controls">
                <button onClick={handlePlayAgain} className="play-again-btn">
                  Play Again
                </button>
                <button onClick={handleLeaveGame} className="leave-game-btn">
                  Leave Game
                </button>
              </div>
            )}
            
            {gameState === 'playing' && (
              <button onClick={handleLeaveGame} className="leave-game-btn">
                Leave Game
              </button>
            )}
          </div>
        )}
        
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
      </header>
    </div>
  );
}

export default App;
