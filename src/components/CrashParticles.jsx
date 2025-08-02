import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CrashParticles = ({ effects }) => {
  const groupRef = useRef();

  // Filter out expired effects
  const activeEffects = useMemo(() => {
    const now = Date.now();
    return effects.filter(effect => now - effect.startTime < effect.duration);
  }, [effects]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, effectIndex) => {
      const effect = activeEffects[effectIndex];
      if (!effect) return;

      child.children.forEach((particle, particleIndex) => {
        const particleData = effect.particles[particleIndex];
        if (!particleData || particleData.life <= 0) {
          particle.visible = false;
          return;
        }

        // Update particle position
        particleData.position.x += particleData.velocity.x * delta;
        particleData.position.y += particleData.velocity.y * delta;
        particleData.position.z += particleData.velocity.z * delta;

        // Apply gravity
        particleData.velocity.y -= 9.8 * delta;

        // Apply air resistance
        particleData.velocity.x *= 0.95;
        particleData.velocity.z *= 0.95;

        // Update particle life
        particleData.life -= particleData.decay;

        // Update visual properties
        particle.position.set(
          particleData.position.x,
          particleData.position.y,
          particleData.position.z
        );

        particle.scale.setScalar(particleData.size * particleData.life);
        
        // Fade out
        if (particle.material) {
          particle.material.opacity = particleData.life;
        }
      });
    });
  });

  return (
    <group ref={groupRef}>
      {activeEffects.map((effect, effectIndex) => (
        <group key={`effect-${effect.startTime}-${effectIndex}`}>
          {effect.particles.map((particle, particleIndex) => (
            <mesh
              key={particle.id}
              position={[particle.position.x, particle.position.y, particle.position.z]}
              scale={[particle.size, particle.size, particle.size]}
            >
              <sphereGeometry args={[0.1, 8, 6]} />
              <meshBasicMaterial
                color={particle.color}
                transparent
                opacity={particle.life}
                emissive={particle.color}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export default CrashParticles; 