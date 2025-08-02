import React from 'react';
import { Text } from '@react-three/drei';

const PlayerNameTag = ({ position, name, color }) => {
  return (
    <Text
      position={[position.x, position.y + 2, position.z]}
      fontSize={0.5}
      color={color}
      anchorX="center"
      anchorY="middle"
      billboard
    >
      {name}
    </Text>
  );
};

export default PlayerNameTag; 