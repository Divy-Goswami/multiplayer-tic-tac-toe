import React from 'react';

const GameStatus = ({ gameData, yourSymbol, socketId, gameState }) => {
  const getOpponentName = () => {
    const players = Object.values(gameData.players);
    const opponent = players.find(player => player.id !== socketId);
    return opponent ? opponent.name : 'Unknown';
  };

  const getYourName = () => {
    const players = Object.values(gameData.players);
    const you = players.find(player => player.id === socketId);
    return you ? you.name : 'You';
  };

  const getGameStatusMessage = () => {
    if (gameState === 'finished') {
      if (gameData.winner === 'tie') {
        return "It's a tie!";
      } else if (gameData.winner === yourSymbol) {
        return "You won! 🎉";
      } else {
        return "You lost! 😢";
      }
    } else {
      if (gameData.currentPlayer === socketId) {
        return "Your turn";
      } else {
        return `${getOpponentName()}'s turn`;
      }
    }
  };

  return (
    <div className="game-status">
      <div className="player-info">
        <div className={`player ${socketId === gameData.currentPlayer ? 'active' : ''}`}>
          <span className="player-name">{getYourName()}</span>
          <span className={`symbol ${yourSymbol.toLowerCase()}`}>{yourSymbol}</span>
        </div>
        <div className="vs">VS</div>
        <div className={`player ${socketId !== gameData.currentPlayer ? 'active' : ''}`}>
          <span className="player-name">{getOpponentName()}</span>
          <span className={`symbol ${yourSymbol === 'X' ? 'o' : 'x'}`}>
            {yourSymbol === 'X' ? 'O' : 'X'}
          </span>
        </div>
      </div>
      <div className={`status-message ${gameState}`}>
        {getGameStatusMessage()}
      </div>
    </div>
  );
};

export default GameStatus;
