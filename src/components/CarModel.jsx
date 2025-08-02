import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const CarModel = ({ 
  position = { x: 0, y: 1, z: 0 }, 
  rotation = { x: 0, y: 0, z: 0 }, 
  color = '#ff4444', 
  isLocal = false,
  targetPosition,
  targetRotation 
}) => {
  const carRef = useRef();

  // Smooth interpolation for remote players
  useFrame(() => {
    if (!isLocal && carRef.current && targetPosition && targetRotation) {
      // Smooth position interpolation
      carRef.current.position.x += (targetPosition.x - carRef.current.position.x) * 0.1;
      carRef.current.position.y += (targetPosition.y - carRef.current.position.y) * 0.1;
      carRef.current.position.z += (targetPosition.z - carRef.current.position.z) * 0.1;
      
      // Smooth rotation interpolation
      carRef.current.rotation.x += (targetRotation.x - carRef.current.rotation.x) * 0.1;
      carRef.current.rotation.y += (targetRotation.y - carRef.current.rotation.y) * 0.1;
      carRef.current.rotation.z += (targetRotation.z - carRef.current.rotation.z) * 0.1;
    }
  });

  // Update position and rotation for local player immediately
  useEffect(() => {
    if (isLocal && carRef.current) {
      carRef.current.position.set(position.x, position.y, position.z);
      carRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }, [position, rotation, isLocal]);

  return (
    <group 
      ref={carRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      castShadow
      receiveShadow
    >
      {/* Main Car Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 4.5]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Car Roof/Cabin */}
      <mesh position={[0, 0.7, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.9, 2.5]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      {/* Front Windshield */}
      <mesh position={[0, 0.9, 0.8]} rotation={[0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.1, 1.2]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent={true}
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Rear Windshield */}
      <mesh position={[0, 0.9, -1.4]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.1, 1]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent={true}
          opacity={0.7}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Wheels - Improved Design */}
      <mesh position={[-1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[-1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
      </mesh>
      <mesh position={[1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Wheel Rims - Enhanced */}
      <mesh position={[-1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.42]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.42]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.42]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.42]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Tire Tread Pattern */}
      <mesh position={[-1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[1, -0.5, 1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[-1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[1, -0.5, -1.6]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <torusGeometry args={[0.4, 0.05, 8, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.1} roughness={0.95} />
      </mesh>
      
      {/* Front Headlights */}
      <mesh position={[-0.6, 0.2, 2.3]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.6, 0.2, 2.3]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Rear Lights */}
      <mesh position={[-0.6, 0.2, -2.3]} castShadow>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.6, 0.2, -2.3]} castShadow>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Flying Thrusters */}
      <mesh position={[-0.8, -0.3, -0.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#4169E1" 
          emissive="#4169E1" 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.8, -0.3, -0.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial 
          color="#4169E1" 
          emissive="#4169E1" 
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Thruster Glow Effect */}
      <mesh position={[-0.8, -0.7, -0.5]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#00BFFF" 
          emissive="#00BFFF" 
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.6}
        />
      </mesh>
      <mesh position={[0.8, -0.7, -0.5]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#00BFFF" 
          emissive="#00BFFF" 
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.6}
        />
      </mesh>
      
      {/* Side Mirrors */}
      <mesh position={[-1.2, 0.8, 0.5]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 0.8, 0.5]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

export default CarModel; 