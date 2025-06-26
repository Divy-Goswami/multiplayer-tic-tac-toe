import React, { useState, useEffect } from 'react';
import audioManager from '../utils/audioManager';

const GameLobby = ({ 
  playerName, 
  selectedGridSize, 
  onGridSizeChange, 
  onStartGame, 
  lobbyData, 
  isHost 
}) => {
  const [showStartButton, setShowStartButton] = useState(false);
  const [syncStatus, setSyncStatus] = useState('waiting'); // waiting, synced, mismatch
  
  const gridOptions = [
    { 
      size: 3, 
      label: '3×3', 
      description: 'Classic - Get 3 in a row',
      winCondition: 3,
      difficulty: 'Easy'
    },
    { 
      size: 5, 
      label: '5×5', 
      description: 'Challenge - Get 4 in a row',
      winCondition: 4,
      difficulty: 'Medium'
    },
    { 
      size: 7, 
      label: '7×7', 
      description: 'Expert - Get 4 in a row',
      winCondition: 4,
      difficulty: 'Hard'
    }
  ];

  useEffect(() => {
    if (lobbyData && lobbyData.players) {
      const players = Object.values(lobbyData.players);
      if (players.length === 2) {
        const [player1, player2] = players;
        const bothHaveSelection = player1.gridSize && player2.gridSize;
        const gridsMatch = player1.gridSize === player2.gridSize;
        
        if (bothHaveSelection) {
          if (gridsMatch) {
            setSyncStatus('synced');
            setShowStartButton(true);
            audioManager.play('notification');
          } else {
            setSyncStatus('mismatch');
            setShowStartButton(false);
            audioManager.play('error');
          }
        } else {
          setSyncStatus('waiting');
          setShowStartButton(false);
        }
      }
    }
  }, [lobbyData]);

  const handleGridSelect = (size) => {
    audioManager.play('click');
    onGridSizeChange(size);
  };

  const handleStartGame = () => {
    audioManager.play('gameStart');
    onStartGame();
  };

  const getOpponentInfo = () => {
    if (!lobbyData || !lobbyData.players) return null;
    
    const players = Object.values(lobbyData.players);
    const opponent = players.find(player => player.name !== playerName);
    return opponent;
  };

  const getSyncStatusMessage = () => {
    const opponent = getOpponentInfo();
    
    switch (syncStatus) {
      case 'waiting':
        if (!opponent) {
          return "Waiting for opponent to join...";
        }
        if (!selectedGridSize) {
          return "Please select a grid size";
        }
        if (!opponent.gridSize) {
          return `Waiting for ${opponent.name} to select grid size...`;
        }
        return "Synchronizing selections...";
        
      case 'synced':
        return `🎉 Both players selected ${selectedGridSize}×${selectedGridSize}! Ready to start!`;
        
      case 'mismatch':
        const opponentGrid = opponent?.gridSize;
        return `⚠️ Grid size mismatch! You selected ${selectedGridSize}×${selectedGridSize}, ${opponent?.name || 'opponent'} selected ${opponentGrid}×${opponentGrid}`;
        
      default:
        return "";
    }
  };

  const getSyncStatusClass = () => {
    switch (syncStatus) {
      case 'synced': return 'sync-status synced';
      case 'mismatch': return 'sync-status mismatch';
      default: return 'sync-status waiting';
    }
  };

  const opponent = getOpponentInfo();

  return (
    <div className="game-lobby">
      <h2>Game Lobby</h2>
      
      {/* Players Display */}
      <div className="lobby-players">
        <div className="lobby-player you">
          <div className="player-header">
            <span className="player-name">{playerName}</span>
            <span className="player-badge host">You {isHost && '(Host)'}</span>
          </div>
          <div className="player-selection">
            {selectedGridSize ? (
              <div className="selected-grid">
                <span className="grid-label">{selectedGridSize}×{selectedGridSize}</span>
                <span className="selection-status confirmed">✓ Confirmed</span>
              </div>
            ) : (
              <span className="selection-status pending">Selecting...</span>
            )}
          </div>
        </div>

        <div className="vs-indicator">VS</div>

        <div className="lobby-player opponent">
          <div className="player-header">
            <span className="player-name">{opponent?.name || 'Waiting...'}</span>
            {opponent && <span className="player-badge">Opponent</span>}
          </div>
          <div className="player-selection">
            {opponent?.gridSize ? (
              <div className="selected-grid">
                <span className="grid-label">{opponent.gridSize}×{opponent.gridSize}</span>
                <span className="selection-status confirmed">✓ Confirmed</span>
              </div>
            ) : (
              <span className="selection-status pending">
                {opponent ? 'Selecting...' : 'Not joined'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sync Status Message */}
      <div className={getSyncStatusClass()}>
        <div className="sync-icon">
          {syncStatus === 'synced' && '🎯'}
          {syncStatus === 'mismatch' && '⚠️'}
          {syncStatus === 'waiting' && '⏳'}
        </div>
        <div className="sync-message">{getSyncStatusMessage()}</div>
      </div>

      {/* Grid Size Selection */}
      <div className="lobby-grid-selection">
        <h3>Choose Grid Size</h3>
        <div className="lobby-grid-options">
          {gridOptions.map((option) => (
            <div
              key={option.size}
              className={`lobby-grid-option ${selectedGridSize === option.size ? 'selected' : ''} ${
                syncStatus === 'mismatch' && opponent?.gridSize === option.size ? 'opponent-choice' : ''
              }`}
              onClick={() => handleGridSelect(option.size)}
              onMouseEnter={() => audioManager.play('hover')}
            >
              <div className="grid-option-header">
                <span className="grid-size-label">{option.label}</span>
                <span className={`difficulty-badge ${option.difficulty.toLowerCase()}`}>
                  {option.difficulty}
                </span>
              </div>
              <div className="grid-preview">
                <div 
                  className="mini-grid" 
                  style={{
                    gridTemplateColumns: `repeat(${option.size}, 1fr)`,
                    gridTemplateRows: `repeat(${option.size}, 1fr)`
                  }}
                >
                  {Array(option.size * option.size).fill(null).map((_, index) => (
                    <div key={index} className="mini-cell"></div>
                  ))}
                </div>
              </div>
              <div className="grid-description">{option.description}</div>
              
              {/* Selection indicators */}
              {selectedGridSize === option.size && (
                <div className="selection-indicator your-choice">Your Choice</div>
              )}
              {syncStatus === 'mismatch' && opponent?.gridSize === option.size && (
                <div className="selection-indicator opponent-choice">Opponent's Choice</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      {showStartButton && (
        <div className="start-game-section">
          <button 
            className="start-game-btn"
            onClick={handleStartGame}
            onMouseEnter={() => audioManager.play('hover')}
          >
            <span className="btn-icon">🚀</span>
            Start Game
          </button>
          <p className="start-game-note">
            Both players have agreed on {selectedGridSize}×{selectedGridSize} grid
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="lobby-help">
        <p>
          💡 Both players must select the same grid size to start the game. 
          You can change your selection at any time before starting.
        </p>
      </div>
    </div>
  );
};

export default GameLobby;
