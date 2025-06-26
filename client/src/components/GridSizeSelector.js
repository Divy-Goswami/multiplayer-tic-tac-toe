import React from 'react';
import audioManager from '../utils/audioManager';

const GridSizeSelector = ({ onGridSizeSelect, selectedSize }) => {
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

  const handleGridSelect = (size) => {
    audioManager.play('click');
    onGridSizeSelect(size);
  };

  return (
    <div className="grid-size-selector">
      <h2>Choose Grid Size</h2>
      <div className="grid-options">
        {gridOptions.map((option) => (
          <div
            key={option.size}
            className={`grid-option ${selectedSize === option.size ? 'selected' : ''}`}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridSizeSelector;
