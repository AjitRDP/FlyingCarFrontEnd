// src/FlyingCar.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import CarModel from './components/CarModel';
import PlayerNameTag from './components/PlayerNameTag';
import CameraController from './components/CameraController';
import CrashParticles from './components/CrashParticles';
import useWebSocket from './hooks/useWebSocket';
import useCarSounds from './hooks/useCarSounds';
import useCollisionDetection from './hooks/useCollisionDetection';
import { BACKEND_CONFIG } from './config/backend';

const FlyingCar = ({ roomId, volume = 0.3, audioEnabled = false, onConnectionStatusChange }) => {
  const [keysPressed, setKeysPressed] = useState({});
  const [position, setPosition] = useState({ x: 0, y: 1, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [crashEffects, setCrashEffects] = useState([]);
  const [knockbackForce, setKnockbackForce] = useState({ x: 0, y: 0, z: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousPlayerCount = useRef(0);
  
  const {
    isConnected,
    isReconnecting,
    playerId,
    playerColor,
    playerName,
    otherPlayers,
    sendPositionUpdate,
    addMessageHandler,
    removeMessageHandler
  } = useWebSocket(BACKEND_CONFIG.getWebSocketUrl(roomId));

  const {
    startEngine,
    stopEngine,
    updateEngineSound,
    playConnectionSound,
    playDisconnectionSound,
    playCrashSound,
    playScrapingSound,
    setVolume,
    resumeAudioContext
  } = useCarSounds();

  const { checkCollisions, createCrashEffect } = useCollisionDetection({
    playCrashSound,
    playScrapingSound
  });

  // Update volume when prop changes
  useEffect(() => {
    setVolume(volume);
  }, [volume, setVolume]);

  // Start/stop engine when player connects/disconnects
  useEffect(() => {
    if (playerId && audioEnabled) {
      startEngine();
      playConnectionSound();
      console.log('🚗 Engine started for player:', playerId);
      
      return () => {
        stopEngine();
        console.log('🚗 Engine stopped for player:', playerId);
      };
    }
  }, [playerId, audioEnabled, startEngine, stopEngine, playConnectionSound]);

  // Handle player join/leave sounds
  useEffect(() => {
    const currentPlayerCount = Object.keys(otherPlayers).length;
    
    if (audioEnabled && previousPlayerCount.current !== 0) {
      if (currentPlayerCount > previousPlayerCount.current) {
        // New player joined
        setTimeout(() => playConnectionSound(), 100);
        console.log('🔊 Player joined sound');
      } else if (currentPlayerCount < previousPlayerCount.current) {
        // Player left
        setTimeout(() => playDisconnectionSound(), 100);
        console.log('🔊 Player left sound');
      }
    }
    
    previousPlayerCount.current = currentPlayerCount;
  }, [otherPlayers, audioEnabled, playConnectionSound, playDisconnectionSound]);

  // Notify parent component about connection status changes
  useEffect(() => {
    if (onConnectionStatusChange) {
      onConnectionStatusChange({ isConnected, isReconnecting, playerId });
    }
  }, [isConnected, isReconnecting, onConnectionStatusChange, playerId]);

  // Handle position restoration on reconnection
  useEffect(() => {
    const handleReconnected = (message) => {
      if (message.data.position) {
        console.log(`🔄 Restoring position for reconnected player:`, message.data.position);
        setPosition({
          x: message.data.position.x || 0,
          y: message.data.position.y || 1,
          z: message.data.position.z || 0
        });
      }
      if (message.data.rotation) {
        console.log(`🔄 Restoring rotation for reconnected player:`, message.data.rotation);
        setRotation({
          x: message.data.rotation.x || 0,
          y: message.data.rotation.y || 0,
          z: message.data.rotation.z || 0
        });
      }
    };

    // Register message handler for reconnection
    addMessageHandler('reconnected', handleReconnected);

    // Cleanup
    return () => {
      removeMessageHandler('reconnected');
    };
  }, [addMessageHandler, removeMessageHandler]);

  // Handle keyboard input
  useEffect(() => {
    const down = (e) => setKeysPressed((prev) => ({ ...prev, [e.code]: true }));
    const up = (e) => setKeysPressed((prev) => ({ ...prev, [e.code]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Handle collision callback
  const handleCollision = useCallback((collisionData) => {
    const { knockback, crashIntensity, isMajorCrash } = collisionData;
    
    // Apply knockback force
    setKnockbackForce(knockback);
    
    // Create crash effect
    const crashEffect = createCrashEffect(position, crashIntensity);
    setCrashEffects(prev => [...prev, crashEffect]);
    
    // Gradually reduce knockback force
    setTimeout(() => {
      setKnockbackForce({ x: 0, y: 0, z: 0 });
    }, 200);

    console.log(`💥 Collision handled! Knockback: ${knockback.x.toFixed(2)}, ${knockback.y.toFixed(2)}, ${knockback.z.toFixed(2)}`);
  }, [position, createCrashEffect]);

  // Clean up old crash effects
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCrashEffects(prev => 
        prev.filter(effect => now - effect.startTime < effect.duration)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!playerId) return;

    const speed = 8;
    const flySpeed = 5;
    const rotationSpeed = 2;
    const drag = 0.95;

    // Update velocity based on input
    let newVelocity = { ...velocity };
    let newRotation = { ...rotation };

    // Check if any movement keys are pressed
    const isMoving = keysPressed['ArrowUp'] || keysPressed['KeyW'] || 
                    keysPressed['ArrowDown'] || keysPressed['KeyS'] ||
                    keysPressed['ArrowLeft'] || keysPressed['ArrowRight'];
    
    const isFlying = keysPressed['Space'] || keysPressed['ShiftLeft'] || keysPressed['ShiftRight'];

    // Movement controls
    if (keysPressed['ArrowUp'] || keysPressed['KeyW']) {
      newVelocity.z -= Math.cos(rotation.y) * speed * delta;
      newVelocity.x -= Math.sin(rotation.y) * speed * delta;
    }
    if (keysPressed['ArrowDown'] || keysPressed['KeyS']) {
      newVelocity.z += Math.cos(rotation.y) * speed * delta;
      newVelocity.x += Math.sin(rotation.y) * speed * delta;
    }
    if (keysPressed['ArrowLeft']) {
      newRotation.y += rotationSpeed * delta;
    }
    if (keysPressed['ArrowRight']) {
      newRotation.y -= rotationSpeed * delta;
    }
    
    // Vertical movement
    if (keysPressed['Space']) {
      newVelocity.y += flySpeed * delta;
    }
    if (keysPressed['ShiftLeft'] || keysPressed['ShiftRight']) {
      newVelocity.y -= flySpeed * delta;
    }

    // Apply knockback force from collisions
    if (knockbackForce.x !== 0 || knockbackForce.y !== 0 || knockbackForce.z !== 0) {
      newVelocity.x += knockbackForce.x * delta * 10;
      newVelocity.y += knockbackForce.y * delta * 10;
      newVelocity.z += knockbackForce.z * delta * 10;
    }

    // Apply drag
    newVelocity.x *= drag;
    newVelocity.y *= drag;
    newVelocity.z *= drag;

    // Update position
    const newPosition = {
      x: position.x + newVelocity.x,
      y: Math.max(0.5, position.y + newVelocity.y), // Prevent going below ground
      z: position.z + newVelocity.z
    };

    // Add slight banking when turning
    if (keysPressed['ArrowLeft']) {
      newRotation.z = Math.min(0.3, newRotation.z + 2 * delta);
    } else if (keysPressed['ArrowRight']) {
      newRotation.z = Math.max(-0.3, newRotation.z - 2 * delta);
    } else {
      newRotation.z *= 0.9; // Return to level
    }

    setVelocity(newVelocity);
    setPosition(newPosition);
    setRotation(newRotation);

    // Check for collisions
    checkCollisions(
      { position: newPosition, velocity: newVelocity },
      otherPlayers,
      handleCollision
    );

    // Update engine sound based on movement
    if (audioEnabled && playerId) {
      updateEngineSound(newVelocity, isFlying);
    }

    // Send position updates to server every 33ms (30fps)
    const now = Date.now();
    if (now - lastUpdateTime.current > 33 && isConnected) {
      sendPositionUpdate(newPosition, newRotation);
      lastUpdateTime.current = now;
    }
  });

  return (
    <>
      {/* Camera Controller */}
      <CameraController targetPosition={position} targetRotation={rotation} />
      
      {/* Crash Particle Effects */}
      <CrashParticles effects={crashEffects} />
      
      {/* Local Player Car */}
      {playerId && (
        <>
          <CarModel
            position={position}
            rotation={rotation}
            color={playerColor}
            isLocal={true}
          />
          <PlayerNameTag
            position={position}
            name={playerName}
            color={playerColor}
          />
        </>
      )}
      
      {/* Other Players' Cars */}
      {Object.values(otherPlayers).map((player) => (
        <React.Fragment key={player.id}>
          <CarModel
            position={player.position}
            rotation={player.rotation}
            color={player.color}
            isLocal={false}
            targetPosition={player.position}
            targetRotation={player.rotation}
          />
          <PlayerNameTag
            position={player.position}
            name={player.name}
            color={player.color}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default FlyingCar;
