import React, { useState, useEffect } from 'react';
import audioManager from '../utils/audioManager';

const SoundControls = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Initialize audio manager state
    setIsMuted(audioManager.isMuted);
    setVolume(audioManager.volume);
  }, []);

  const handleToggleMute = () => {
    const newMutedState = audioManager.toggleMute();
    setIsMuted(newMutedState);
    
    // Play feedback sound if unmuting
    if (!newMutedState) {
      setTimeout(() => audioManager.play('notification'), 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioManager.setVolume(newVolume);
    
    // Play sample sound for volume feedback
    if (!isMuted) {
      audioManager.play('click');
    }
  };

  return (
    <div className="sound-controls">
      <div className="sound-button-container">
        <button
          className={`sound-toggle ${isMuted ? 'muted' : 'unmuted'}`}
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          onMouseEnter={() => !isMuted && audioManager.play('hover')}
        >
          {isMuted ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
        
        <div 
          className={`volume-slider-container ${showVolumeSlider ? 'show' : ''}`}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            disabled={isMuted}
          />
          <span className="volume-indicator">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default SoundControls;
