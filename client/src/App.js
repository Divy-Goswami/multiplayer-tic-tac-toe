import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import GameBoard from './components/GameBoard';
import PlayerInput from './components/PlayerInput';
import GameStatus from './components/GameStatus';
import SoundControls from './components/SoundControls';
import audioManager from './utils/audioManager';

const socket = io('http://localhost:5000');

function App() {
  const [gameState, setGameState] = useState('waiting-for-name'); // waiting-for-name, waiting-for-opponent, playing, finished
  const [playerName, setPlayerName] = useState('');
  const [gameData, setGameData] = useState(null);
  const [yourSymbol, setYourSymbol] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize audio on first user interaction
    const initAudio = () => {
      audioManager.initializeAudio();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    socket.on('waiting-for-opponent', () => {
      setGameState('waiting-for-opponent');
      setMessage('Waiting for an opponent...');
      audioManager.play('notification');
    });

    socket.on('game-start', (data) => {
      setGameState('playing');
      setGameData(data);
      setYourSymbol(data.yourSymbol[socket.id]);
      setMessage('');
      setError('');
      
      // Play exciting match found sound and start tension music
      audioManager.play('matchFound');
      setTimeout(() => {
        audioManager.play('gameStart');
        audioManager.startBackgroundMusic();
      }, 1000);
    });

    socket.on('game-update', (data) => {
      const prevGameData = gameData;
      
      setGameData(prevData => ({
        ...prevData,
        ...data
      }));
      
      // Play move sound if board changed
      if (prevGameData && JSON.stringify(prevGameData.board) !== JSON.stringify(data.board)) {
        audioManager.play('place');
      }
      
      if (data.status === 'finished') {
        setGameState('finished');
        audioManager.stopBackgroundMusic();
        
        // Play appropriate ending sound
        setTimeout(() => {
          if (data.winner === 'tie') {
            audioManager.play('tie');
          } else if (data.winner === yourSymbol) {
            audioManager.play('victory');
          } else {
            audioManager.play('defeat');
          }
        }, 500);
      }
    });

    socket.on('game-restart', (data) => {
      setGameData(prevData => ({
        ...prevData,
        ...data
      }));
      setGameState('playing');
      setMessage('');
      
      // Restart background music and play game start sound
      audioManager.play('gameStart');
      audioManager.startBackgroundMusic();
    });

    socket.on('waiting-for-opponent-restart', () => {
      setMessage('Waiting for opponent to confirm restart...');
      audioManager.play('notification');
    });

    socket.on('opponent-left', () => {
      setMessage('Your opponent left the game.');
      setGameState('waiting-for-name');
      setGameData(null);
      audioManager.stopBackgroundMusic();
      audioManager.play('notification');
    });

    socket.on('opponent-disconnected', () => {
      setMessage('Your opponent disconnected.');
      setGameState('waiting-for-name');
      setGameData(null);
      audioManager.stopBackgroundMusic();
      audioManager.play('notification');
    });

    socket.on('error', (errorMessage) => {
      setError(errorMessage);
      audioManager.play('error');
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
      <SoundControls />
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
                <button 
                  onClick={() => { audioManager.play('click'); handlePlayAgain(); }} 
                  className="play-again-btn"
                  onMouseEnter={() => audioManager.play('hover')}
                >
                  Play Again
                </button>
                <button 
                  onClick={() => { audioManager.play('click'); handleLeaveGame(); }} 
                  className="leave-game-btn"
                  onMouseEnter={() => audioManager.play('hover')}
                >
                  Leave Game
                </button>
              </div>
            )}
            
            {gameState === 'playing' && (
              <button 
                onClick={() => { audioManager.play('click'); handleLeaveGame(); }} 
                className="leave-game-btn"
                onMouseEnter={() => audioManager.play('hover')}
              >
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
