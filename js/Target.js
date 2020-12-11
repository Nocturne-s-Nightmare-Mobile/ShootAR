import React from 'react';
import { ViroSphere, ViroMaterials } from 'react-viro';

export const Target = (props) => {
  const { num, scene, randomPosition } = props;
  const targets = [
    'bullseyeSphere',
    'bullseyeSphere2',
    'bullseyeSphere3',
    'bullseyeSphere4',
    'bullseyeSphere5',
    'bullseyeSphere6',
    'bullseyeSphere7',
    'bullseyeSphere8',
    'bullseyeSphere9',
    'bullseyeSphere10',
  ];
  const planets = [
    'planet1',
    'planet2',
    'planet3',
    'planet4',
    'planet5',
    'planet6',
    'planet7',
    'planet8',
    'planet9',
    'neon',
  ];
  return (
    <ViroSphere
      key={num}
      position={randomPosition}
      radius={0.2}
      materials={scene === 'building' ? targets[num] : planets[num]}
      physicsBody={{
        type: 'Static',
        mass: 0,
        useGravity: false,
        velocity: [0, 0, 0],
      }}
      viroTag={`${num}`}
      transformBehaviors={['billboard']}
    />
  );
};

ViroMaterials.createMaterials({
  bullseyeSphere: {
    diffuseTexture: require('./res/bullseye6.png'),
  },
  bullseyeSphere2: {
    diffuseTexture: require('./res/bullseye5.png'),
  },
  bullseyeSphere3: {
    diffuseTexture: require('./res/bullseye4.png'),
  },
  bullseyeSphere4: {
    diffuseTexture: require('./res/bullseye7.png'),
  },
  bullseyeSphere5: {
    diffuseTexture: require('./res/bullseye8.png'),
  },
  bullseyeSphere6: {
    diffuseTexture: require('./res/bullseye9.png'),
  },
  bullseyeSphere7: {
    diffuseTexture: require('./res/bullseye10.png'),
  },
  bullseyeSphere8: {
    diffuseTexture: require('./res/bullseye11.png'),
  },
  bullseyeSphere9: {
    diffuseTexture: require('./res/bullseye12.png'),
  },
  bullseyeSphere10: {
    diffuseTexture: require('./res/bullseye13.png'),
  },
  neon: {
    diffuseTexture: require('./res/neon.jpeg'),
  },
  planet1: {
    diffuseTexture: require('./res/planet1.jpg'),
  },
  planet2: {
    diffuseTexture: require('./res/planet2.png'),
  },
  planet3: {
    diffuseTexture: require('./res/planet3.jpg'),
  },
  planet4: {
    diffuseTexture: require('./res/planet4.jpeg'),
  },
  planet5: {
    diffuseTexture: require('./res/planet5.jpeg'),
  },
  planet6: {
    diffuseTexture: require('./res/planet6.jpg'),
  },
  planet7: {
    diffuseTexture: require('./res/planet7.jpg'),
  },
  planet8: {
    diffuseTexture: require('./res/planet8.jpeg'),
  },
  planet9: {
    diffuseTexture: require('./res/planet9.jpg'),
  },
});
