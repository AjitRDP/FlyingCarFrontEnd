import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

const CameraController = ({ targetPosition, targetRotation }) => {
  const { camera } = useThree();
  const cameraTarget = useRef(new Vector3());
  const cameraPosition = useRef(new Vector3());

  useFrame(() => {
    if (!targetPosition) return;

    // Calculate camera position behind and above the car
    const offset = new Vector3(0, 5, 8);
    
    // Apply car's Y rotation to the offset
    offset.applyAxisAngle(new Vector3(0, 1, 0), targetRotation.y);
    
    // Set target camera position
    cameraPosition.current.set(
      targetPosition.x + offset.x,
      targetPosition.y + offset.y,
      targetPosition.z + offset.z
    );
    
    // Set camera look-at target (slightly ahead of the car)
    cameraTarget.current.set(
      targetPosition.x,
      targetPosition.y + 1,
      targetPosition.z
    );

    // Smooth camera movement
    camera.position.lerp(cameraPosition.current, 0.05);
    camera.lookAt(cameraTarget.current);
  });

  return null;
};

export default CameraController; 