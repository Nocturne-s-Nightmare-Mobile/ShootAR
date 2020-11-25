'use strict';

import React, { Component } from 'react';

import { StyleSheet } from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroBox,
  ViroMaterials,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARCamera,
  ViroSphere,
  // applyImpulse,
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {
  constructor() {
    super();
    this.state = {
      text: 'Initializing AR...',
    };

    this._onInitialized = this._onInitialized.bind(this);
    // this.shoot = this.shoot.bind(this);
  }

  // shoot() {
  //   this.applyImpulse({ force: [0, 0, 10], position: [0, 0, -0.1] });
  // }

  render() {
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized}>
        {/* <ViroText
          text={this.state.text}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        />
        <ViroBox
          position={[0, -0.5, -1]}
          scale={[0.3, 0.3, 0.1]}
          materials={['grid']}
        /> */}
        <ViroAmbientLight color={'#ffffff'} intensity={1000} />
        {/* <ViroAmbientLight color="#ffffff" intensity={200} /> */}
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -0.1, -0.2]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
        />
        {/* <Viro3DObject
          source={require('./res/emoji_smile/emoji_smile.vrx')}
          resources={[
            require('./res/emoji_smile/emoji_smile_diffuse.png'),
            require('./res/emoji_smile/emoji_smile_normal.png'),
            require('./res/emoji_smile/emoji_smile_specular.png'),
          ]}
          position={[-0.5, 0.5, -1]}
          scale={[0.2, 0.2, 0.2]}
          type="VRX"
        /> */}
        <ViroARCamera>
          <Viro3DObject
            source={require('./res/gun.vrx')}
            type="VRX"
            scale={[0.0003, 0.0003, 0.0003]}
            position={[0.02, -0.1, -0.2]}
            rotation={[0, 90, -5]}
            onLoadStart={this._onLoadStart}
            onLoadEnd={this._onLoadEnd}
            onError={this._onError}
          />
          <ViroBox
            // position={[0.02, -0.06, -0.15]} position to render in gun
            position={[0, 0, -0.1]}
            height={0.02}
            width={0.02}
            length={0.02}
            physicsBody={{
              type: 'Dynamic',
              mass: 1,
              useGravity: false,
            }}
            onClick={function () {
              this.props.applyImpulse([0, 15, -10], [0, 0, -0.1]);
            }}
          />
        </ViroARCamera>
        <ViroBox
          position={[0, 1, -3]}
          height={0.5}
          width={0.5}
          length={0.5}
          physicsBody={{
            type: 'Kinematic',
            mass: 0,
          }}
          onClick={function () {
            this.prototype.applyImpulse([0, 15, -10], [0, 0, -0.1]);
          }}
        />
      </ViroARScene>
    );
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text: 'I ♥ TACOS!',
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 25,
    color: 'hotpink',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require('./res/grid_bg.jpg'),
  },
});

module.exports = HelloWorldSceneAR;
