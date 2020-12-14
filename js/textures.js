import { ViroMaterials } from 'react-viro';

export default function () {
  ViroMaterials.createMaterials({
    black: {
      diffuseTexture: require('./res/blackSphere.jpg'),
    },
    metallic: {
      diffuseTexture: require('./res/metallic.jpg'),
    },
    brass: {
      diffuseTexture: require('./res/brass.jpeg'),
    },
    rough: {
      diffuseTexture: require('./res/spheretex1.jpg'),
    },
    desert: {
      diffuseTexture: require('./res/desert.jpg'),
    },
    trippy: {
      diffuseTexture: require('./res/spheretex2.jpg'),
    },
    gold: {
      diffuseTexture: require('./res/gold.jpg'),
    },
    blueMetal: {
      diffuseTexture: require('./res/bluemetal.jpg'),
    },
    redMetal: {
      diffuseTexture: require('./res/redmetal3.jpg'),
    },
    shiny: {
      diffuseTexture: require('./res/shiny.jpg'),
    },
    pink: {
      diffuseTexture: require('./res/pink1.jpg'),
    },
    neon2: {
      diffuseTexture: require('./res/neon2.png'),
    },
    silver: {
      diffuseTexture: require('./res/silver.jpg'),
    },
    greenMetal: {
      diffuseTexture: require('./res/greenMetal.jpg'),
    },
    diamondPlate: {
      diffuseTexture: require('./res/diamondPlate.jpg'),
    },
  });
}
