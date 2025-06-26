import React from 'react';
import audioManager from '../utils/audioManager';

const GameBoard = ({ board, onMove, isYourTurn, gameFinished, winningLine, gridSize = 3 }) => {
  const handleCellClick = (index) => {
    if (!board[index] && isYourTurn && !gameFinished) {
      onMove(index);
    }
  };

  const getCellClass = (index) => {
    let className = 'cell';
    
    if (board[index]) {
      className += ` filled ${board[index].toLowerCase()}`;
    }
    
    if (!board[index] && isYourTurn && !gameFinished) {
      className += ' clickable';
    }
    
    if (winningLine && winningLine.includes(index)) {
      className += ' winning';
    }
    
    return className;
  };

  return (
    <div className="game-board">
      <div 
        className={`board grid-${gridSize}x${gridSize}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`
        }}
      >
        {board.map((cell, index) => (
          <div
            key={index}
            className={getCellClass(index)}
            onClick={() => {
              if (!board[index] && isYourTurn && !gameFinished) {
                audioManager.play('click');
                handleCellClick(index);
              }
            }}
            onMouseEnter={() => {
              if (!board[index] && isYourTurn && !gameFinished) {
                audioManager.play('hover');
              }
            }}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
