import { useRef, useEffect, useCallback } from 'react';

const useCarSounds = () => {
  const audioContextRef = useRef(null);
  const engineOscillatorRef = useRef(null);
  const thrusterOscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const thrusterGainRef = useRef(null);
  const isPlayingRef = useRef(false);
  const masterVolumeRef = useRef(0.3);

  // Initialize Audio Context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      thrusterGainRef.current = audioContextRef.current.createGain();
      
      gainNodeRef.current.connect(audioContextRef.current.destination);
      thrusterGainRef.current.connect(audioContextRef.current.destination);
      
      // Set initial volumes
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      thrusterGainRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    } catch (error) {
      console.log('Web Audio API not supported:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Resume audio context on user interaction (required by browsers)
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Start engine sound
  const startEngine = useCallback(() => {
    if (!audioContextRef.current || isPlayingRef.current) return;
    
    try {
      resumeAudioContext();
      
      // Create engine oscillator (low frequency rumble)
      engineOscillatorRef.current = audioContextRef.current.createOscillator();
      const engineFilter = audioContextRef.current.createBiquadFilter();
      
      engineOscillatorRef.current.type = 'sawtooth';
      engineOscillatorRef.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
      
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(200, audioContextRef.current.currentTime);
      
      engineOscillatorRef.current.connect(engineFilter);
      engineFilter.connect(gainNodeRef.current);
      
      engineOscillatorRef.current.start();
      isPlayingRef.current = true;
      
      // Fade in engine sound
      gainNodeRef.current.gain.setTargetAtTime(
        masterVolumeRef.current * 0.3, 
        audioContextRef.current.currentTime, 
        0.1
      );
    } catch (error) {
      console.log('Error starting engine sound:', error);
    }
  }, [resumeAudioContext]);

  // Stop engine sound
  const stopEngine = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    
    try {
      // Fade out
      gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      thrusterGainRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
      
      setTimeout(() => {
        if (engineOscillatorRef.current) {
          engineOscillatorRef.current.stop();
          engineOscillatorRef.current = null;
        }
        if (thrusterOscillatorRef.current) {
          thrusterOscillatorRef.current.stop();
          thrusterOscillatorRef.current = null;
        }
        isPlayingRef.current = false;
      }, 200);
    } catch (error) {
      console.log('Error stopping engine sound:', error);
    }
  }, []);

  // Update engine sound based on movement
  const updateEngineSound = useCallback((velocity, isFlying) => {
    if (!audioContextRef.current || !engineOscillatorRef.current) return;
    
    try {
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
      const verticalSpeed = Math.abs(velocity.y);
      
      // Engine frequency based on horizontal speed
      const baseFreq = 80;
      const maxFreq = 200;
      const targetFreq = baseFreq + (speed * 30);
      const clampedFreq = Math.min(maxFreq, Math.max(baseFreq, targetFreq));
      
      engineOscillatorRef.current.frequency.setTargetAtTime(
        clampedFreq, 
        audioContextRef.current.currentTime, 
        0.1
      );
      
      // Engine volume based on movement
      const baseVolume = masterVolumeRef.current * 0.3;
      const speedVolume = Math.min(0.8, baseVolume + (speed * 0.1));
      
      gainNodeRef.current.gain.setTargetAtTime(
        speedVolume, 
        audioContextRef.current.currentTime, 
        0.1
      );
      
      // Handle thruster sounds when flying
      if (isFlying && verticalSpeed > 0.1) {
        if (!thrusterOscillatorRef.current) {
          // Create thruster sound
          thrusterOscillatorRef.current = audioContextRef.current.createOscillator();
          const thrusterFilter = audioContextRef.current.createBiquadFilter();
          
          thrusterOscillatorRef.current.type = 'white'; // Use white noise if available, fallback to square
          if (thrusterOscillatorRef.current.type !== 'white') {
            thrusterOscillatorRef.current.type = 'square';
          }
          thrusterOscillatorRef.current.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
          
          thrusterFilter.type = 'bandpass';
          thrusterFilter.frequency.setValueAtTime(300, audioContextRef.current.currentTime);
          thrusterFilter.Q.setValueAtTime(2, audioContextRef.current.currentTime);
          
          thrusterOscillatorRef.current.connect(thrusterFilter);
          thrusterFilter.connect(thrusterGainRef.current);
          
          thrusterOscillatorRef.current.start();
        }
        
        // Thruster volume based on vertical speed
        const thrusterVolume = Math.min(0.4, masterVolumeRef.current * 0.2 + (verticalSpeed * 0.3));
        thrusterGainRef.current.gain.setTargetAtTime(
          thrusterVolume, 
          audioContextRef.current.currentTime, 
          0.05
        );
      } else {
        // Fade out thruster sound
        if (thrusterOscillatorRef.current) {
          thrusterGainRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.1);
        }
      }
    } catch (error) {
      console.log('Error updating engine sound:', error);
    }
  }, []);

  // Play connection sound effect
  const playConnectionSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      resumeAudioContext();
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Rising tone for connection
      oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContextRef.current.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.setTargetAtTime(masterVolumeRef.current * 0.5, audioContextRef.current.currentTime, 0.01);
      gainNode.gain.setTargetAtTime(0, audioContextRef.current.currentTime + 0.15, 0.05);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.log('Error playing connection sound:', error);
    }
  }, [resumeAudioContext]);

  // Play disconnection sound effect
  const playDisconnectionSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Falling tone for disconnection
      oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.setTargetAtTime(masterVolumeRef.current * 0.4, audioContextRef.current.currentTime, 0.01);
      gainNode.gain.setTargetAtTime(0, audioContextRef.current.currentTime + 0.25, 0.05);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.4);
    } catch (error) {
      console.log('Error playing disconnection sound:', error);
    }
  }, []);

  // Play crash sound effect
  const playCrashSound = useCallback((intensity = 1) => {
    if (!audioContextRef.current) return;
    
    try {
      resumeAudioContext();
      
      // Create crash impact sound (metallic clang)
      const oscillator1 = audioContextRef.current.createOscillator();
      const oscillator2 = audioContextRef.current.createOscillator();
      const noiseBuffer = audioContextRef.current.createBuffer(1, audioContextRef.current.sampleRate * 0.1, audioContextRef.current.sampleRate);
      const noiseSource = audioContextRef.current.createBufferSource();
      
      // Generate white noise for crash texture
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noiseSource.buffer = noiseBuffer;
      
      const gainNode1 = audioContextRef.current.createGain();
      const gainNode2 = audioContextRef.current.createGain();
      const noiseGain = audioContextRef.current.createGain();
      const filter = audioContextRef.current.createBiquadFilter();
      
      // Metal impact frequencies
      oscillator1.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(200, audioContextRef.current.currentTime + 0.2);
      oscillator2.frequency.setValueAtTime(1200, audioContextRef.current.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(300, audioContextRef.current.currentTime + 0.15);
      
      // Filter for metallic sound
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      filter.Q.setValueAtTime(5, audioContextRef.current.currentTime);
      
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      noiseSource.connect(filter);
      filter.connect(noiseGain);
      
      gainNode1.connect(audioContextRef.current.destination);
      gainNode2.connect(audioContextRef.current.destination);
      noiseGain.connect(audioContextRef.current.destination);
      
      const volume = masterVolumeRef.current * 0.6 * intensity;
      
      // Impact envelope
      gainNode1.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode1.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.01);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);
      
      gainNode2.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode2.gain.setTargetAtTime(volume * 0.7, audioContextRef.current.currentTime, 0.005);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);
      
      noiseGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      noiseGain.gain.setTargetAtTime(volume * 0.3, audioContextRef.current.currentTime, 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
      
      oscillator1.start();
      oscillator2.start();
      noiseSource.start();
      
      oscillator1.stop(audioContextRef.current.currentTime + 0.4);
      oscillator2.stop(audioContextRef.current.currentTime + 0.3);
      noiseSource.stop(audioContextRef.current.currentTime + 0.2);
      
    } catch (error) {
      console.log('Error playing crash sound:', error);
    }
  }, [resumeAudioContext]);

  // Play scraping sound for minor collisions
  const playScrapingSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      const filter = audioContextRef.current.createBiquadFilter();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioContextRef.current.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, audioContextRef.current.currentTime);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.setTargetAtTime(masterVolumeRef.current * 0.3, audioContextRef.current.currentTime, 0.05);
      gainNode.gain.setTargetAtTime(0, audioContextRef.current.currentTime + 0.15, 0.05);
      
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 0.3);
    } catch (error) {
      console.log('Error playing scraping sound:', error);
    }
  }, []);

  // Set master volume
  const setVolume = useCallback((volume) => {
    masterVolumeRef.current = Math.max(0, Math.min(1, volume));
  }, []);

  return {
    startEngine,
    stopEngine,
    updateEngineSound,
    playConnectionSound,
    playDisconnectionSound,
    playCrashSound,
    playScrapingSound,
    setVolume,
    resumeAudioContext
  };
};

export default useCarSounds; 