class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.7;
    this.backgroundMusic = null;
    this.isBackgroundMusicPlaying = false;
    
    // Initialize audio context for better browser support
    this.audioContext = null;
    this.initAudioContext();
    
    // Load all sound effects
    this.loadSounds();
  }

  initAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.log('Web Audio API is not supported in this browser');
    }
  }

  loadSounds() {
    // Define all sound effects with web-compatible audio URLs
    const soundConfig = {
      // Game interaction sounds
      click: this.createToneSound(800, 0.1, 'sine'),
      hover: this.createToneSound(600, 0.05, 'sine'),
      place: this.createToneSound([440, 880], 0.2, 'triangle'),
      
      // Game state sounds
      gameStart: this.createSequenceSound([
        { freq: 523.25, duration: 0.15 }, // C5
        { freq: 659.25, duration: 0.15 }, // E5
        { freq: 783.99, duration: 0.3 }   // G5
      ]),
      
      // Victory sounds
      victory: this.createVictorySound(),
      defeat: this.createDefeatSound(),
      tie: this.createTieSound(),
      
      // Background ambience
      tension: this.createTensionLoop(),
      
      // UI feedback
      matchFound: this.createMatchFoundSound(),
      countdown: this.createToneSound(1000, 0.1, 'square'),
      error: this.createErrorSound(),
      notification: this.createNotificationSound()
    };

    this.sounds = soundConfig;
  }

  createToneSound(frequency, duration, waveType = 'sine') {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        if (Array.isArray(frequency)) {
          // Chord sound
          frequency.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            osc.type = waveType;
            gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + duration);
          });
        } else {
          oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
          oscillator.type = waveType;
          gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration);
        }
      } catch (e) {
        console.log('Error playing sound:', e);
      }
    };
  }

  createSequenceSound(notes) {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      let currentTime = this.audioContext.currentTime;
      
      notes.forEach(note => {
        try {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(note.freq, currentTime);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(this.volume * 0.4, currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);
          
          oscillator.start(currentTime);
          oscillator.stop(currentTime + note.duration);
          
          currentTime += note.duration * 0.8; // Slight overlap
        } catch (e) {
          console.log('Error in sequence sound:', e);
        }
      });
    };
  }

  createVictorySound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Triumphant ascending melody
      const melody = [
        { freq: 523.25, duration: 0.2 }, // C5
        { freq: 659.25, duration: 0.2 }, // E5
        { freq: 783.99, duration: 0.2 }, // G5
        { freq: 1046.5, duration: 0.4 }, // C6
        { freq: 783.99, duration: 0.2 }, // G5
        { freq: 1046.5, duration: 0.6 }  // C6 (sustained)
      ];
      
      this.createSequenceSound(melody)();
      
      // Add sparkle effect
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.createToneSound([1318.5, 1568, 1975.5], 0.3, 'triangle')();
          }, i * 100);
        }
      }, 800);
    };
  }

  createDefeatSound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Descending sad melody
      const melody = [
        { freq: 523.25, duration: 0.3 }, // C5
        { freq: 466.16, duration: 0.3 }, // Bb4
        { freq: 415.30, duration: 0.3 }, // Ab4
        { freq: 349.23, duration: 0.6 }, // F4
        { freq: 293.66, duration: 0.8 }  // D4 (sustained)
      ];
      
      this.createSequenceSound(melody)();
    };
  }

  createTieSound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Neutral/questioning melody
      const melody = [
        { freq: 440, duration: 0.3 },     // A4
        { freq: 523.25, duration: 0.3 }, // C5
        { freq: 440, duration: 0.3 },    // A4
        { freq: 523.25, duration: 0.3 }, // C5
        { freq: 466.16, duration: 0.6 }  // Bb4
      ];
      
      this.createSequenceSound(melody)();
    };
  }

  createTensionLoop() {
    return () => {
      if (this.isMuted || !this.audioContext || this.isBackgroundMusicPlaying) return;
      
      const playTensionNote = () => {
        if (this.isBackgroundMusicPlaying) {
          try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Low frequency rumble with filter
            oscillator.frequency.setValueAtTime(80 + Math.random() * 40, this.audioContext.currentTime);
            oscillator.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, this.audioContext.currentTime + 1);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 3);
            
            // Schedule next tension note
            setTimeout(playTensionNote, 2000 + Math.random() * 3000);
          } catch (e) {
            console.log('Error in tension loop:', e);
          }
        }
      };
      
      playTensionNote();
    };
  }

  createMatchFoundSound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Exciting match found sound
      const chords = [
        [523.25, 659.25, 783.99], // C major
        [587.33, 739.99, 880.00], // D major
        [659.25, 830.61, 987.77]  // E major
      ];
      
      chords.forEach((chord, index) => {
        setTimeout(() => {
          this.createToneSound(chord, 0.4, 'triangle')();
        }, index * 150);
      });
    };
  }

  createErrorSound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Harsh error sound
      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Error playing error sound:', e);
      }
    };
  }

  createNotificationSound() {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      // Pleasant notification chime
      const notes = [659.25, 783.99]; // E5, G5
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.createToneSound(freq, 0.3, 'sine')();
        }, index * 100);
      });
    };
  }

  // Public methods
  play(soundName) {
    if (this.sounds[soundName] && !this.isMuted) {
      try {
        // Resume audio context if needed (browser requirement)
        if (this.audioContext && this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        this.sounds[soundName]();
      } catch (e) {
        console.log('Error playing sound:', soundName, e);
      }
    }
  }

  startBackgroundMusic() {
    if (!this.isBackgroundMusicPlaying) {
      this.isBackgroundMusicPlaying = true;
      this.play('tension');
    }
  }

  stopBackgroundMusic() {
    this.isBackgroundMusicPlaying = false;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    }
  }

  // Initialize audio on first user interaction (required by browsers)
  initializeAudio() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// Export singleton instance
export default new AudioManager();
