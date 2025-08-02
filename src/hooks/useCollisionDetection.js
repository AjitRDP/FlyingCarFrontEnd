import { useRef, useCallback } from 'react';

const useCollisionDetection = ({ playCrashSound, playScrapingSound }) => {
  const lastCollisionTime = useRef({});
  const collisionCooldown = 1000; // 1 second cooldown between collisions

  // Calculate distance between two positions
  const getDistance = useCallback((pos1, pos2) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, []);

  // Calculate collision force based on velocities
  const calculateCollisionForce = useCallback((vel1, vel2) => {
    const relativeVelocity = Math.sqrt(
      Math.pow(vel1.x - vel2.x, 2) + 
      Math.pow(vel1.y - vel2.y, 2) + 
      Math.pow(vel1.z - vel2.z, 2)
    );
    return Math.min(relativeVelocity, 5); // Cap at 5 units
  }, []);

  // Check for collisions between local player and other players
  const checkCollisions = useCallback((localPlayer, otherPlayers, onCollision) => {
    if (!localPlayer.position || !localPlayer.velocity) return;

    const carSize = 2.5; // Approximate car collision radius
    const now = Date.now();

    Object.values(otherPlayers).forEach(otherPlayer => {
      if (!otherPlayer.position) return;

      const distance = getDistance(localPlayer.position, otherPlayer.position);
      
      // Check if cars are colliding
      if (distance < carSize) {
        const playerId = otherPlayer.id;
        
        // Check cooldown to prevent spam
        if (!lastCollisionTime.current[playerId] || 
            now - lastCollisionTime.current[playerId] > collisionCooldown) {
          
          lastCollisionTime.current[playerId] = now;

          // Calculate collision direction (from other car to local car)
          const dx = localPlayer.position.x - otherPlayer.position.x;
          const dy = localPlayer.position.y - otherPlayer.position.y;
          const dz = localPlayer.position.z - otherPlayer.position.z;
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

          const collisionDirection = {
            x: dx / length,
            y: dy / length,
            z: dz / length
          };

          // Calculate collision force
          const otherVelocity = otherPlayer.velocity || { x: 0, y: 0, z: 0 };
          const force = calculateCollisionForce(localPlayer.velocity, otherVelocity);
          
          // Determine crash type based on force
          const isMajorCrash = force > 2;
          const crashIntensity = Math.min(force / 3, 1);

          // Play appropriate sound
          if (isMajorCrash) {
            playCrashSound(crashIntensity);
          } else {
            playScrapingSound();
          }

          // Apply collision physics
          const bounceForce = Math.max(force * 0.3, 1.5);
          const knockback = {
            x: collisionDirection.x * bounceForce,
            y: Math.abs(collisionDirection.y) * bounceForce * 0.5, // Reduce vertical bouncing
            z: collisionDirection.z * bounceForce
          };

          // Call collision callback with physics data
          if (onCollision) {
            onCollision({
              otherPlayer,
              collisionDirection,
              force,
              knockback,
              isMajorCrash,
              crashIntensity,
              distance
            });
          }

          console.log(`💥 ${isMajorCrash ? 'MAJOR CRASH' : 'Minor collision'} with ${otherPlayer.name || 'Player'}! Force: ${force.toFixed(2)}`);
        }
      }
    });
  }, [getDistance, calculateCollisionForce, playCrashSound, playScrapingSound]);

  // Create crash particle effect data
  const createCrashEffect = useCallback((position, intensity = 1) => {
    const particleCount = Math.floor(5 + intensity * 10);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: `particle-${Date.now()}-${i}`,
        position: {
          x: position.x + (Math.random() - 0.5) * 2,
          y: position.y + Math.random() * 2,
          z: position.z + (Math.random() - 0.5) * 2
        },
        velocity: {
          x: (Math.random() - 0.5) * intensity * 4,
          y: Math.random() * intensity * 3,
          z: (Math.random() - 0.5) * intensity * 4
        },
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        size: 0.1 + Math.random() * 0.2 * intensity,
        color: Math.random() > 0.5 ? '#ff6b00' : '#ffdd00' // Orange or yellow sparks
      });
    }

    return {
      particles,
      duration: 2000, // 2 seconds
      startTime: Date.now()
    };
  }, []);

  return {
    checkCollisions,
    createCrashEffect,
    getDistance
  };
};

export default useCollisionDetection; 