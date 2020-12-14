import { ViroSphere } from 'react-viro';
import React from 'react';

export default Bullet = (props) => {
  const { velocity, callback } = props;
  return (
    <ViroSphere
      radius={0.006}
      position={[0.021, -0.06, -0.15]}
      physicsBody={{
        type: 'Dynamic',
        mass: 10,
        useGravity: false,
        velocity: velocity,
      }}
      materials={['brass']}
      viroTag={'bullet'}
      highAccuracyEvents={true}
      onCollision={callback}
    />
  );
};
