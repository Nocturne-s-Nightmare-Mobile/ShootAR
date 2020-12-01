'use strict';

import React, { Component } from 'react';

import { StyleSheet, Vibration } from 'react-native';

import {
  ViroARScene,
  ViroNode,
  ViroText,
  ViroConstants,
  ViroBox,
  ViroMaterials,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARCamera,
  ViroSphere,
  ViroButton,
  ViroSound,
  ViroAnimations,
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {
  constructor() {
    super();
    this.state = {
      hasARInitialized: false,
      text: 'Initializing AR...',
      firing: false,
      bulletPosition: [0.02, -0.06, -0.15],
      hits: 0,
      shotSound: false,
      explosionSound: false,
      update: true,
      canShoot: true,
      currentAnim: '',
    };

    this.bullets = [];
    this.targets = [];

    this._onLoadStart = this._onLoadStart.bind(this);
    this._onButtonTap = this._onButtonTap.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this.fire = this.fire.bind(this);
    this.hitTarget = this.hitTarget.bind(this);
    this.stopShotSound = this.stopShotSound.bind(this);
    this.stopExplosionSound = this.stopExplosionSound.bind(this);
  }

  _onLoadStart() {
    console.log('OBJ loading has started');
  }
  _onLoadEnd() {
    console.log('OBJ loading has finished');
  }
  _onError(event) {
    console.log('OBJ loading failed with error: ' + event.nativeEvent.error);
  }

  hitTarget(tag) {
    Vibration.vibrate(50);
    this.targets[+tag] = this.renderTarget(+tag);
    this.setState((prevState) => ({
      ...this.state,
      hits: prevState.hits + 1,
      explosionSound: true,
    }));
  }

  renderTarget(num) {
    let posX =
      Math.floor(Math.random() * 6) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posY = Math.floor(Math.random() * 4 + 1);
    let posZ = Math.floor(Math.random() * 7 * -1 - 3);
    let randomPosition = [posX, posY, posZ];
    this.setState((prevState) => ({
      ...this.state,
      update: !prevState.update,
    }));
    return (
      // <ViroSphere
      //   key={num}
      //   position={randomPosition}
      //   radius={0.06}
      //   rotation={[0, 90, 0]}
      //   materials={['bullseye']}
      //   physicsBody={{
      //     type: 'Static',
      //     mass: 0,
      //     useGravity: false,
      //     velocity: [0, 0, 0],
      //   }}
      //   viroTag={`${num}`}
      //   transformBehaviors={['billboard']}
      // />

      <ViroBox
        key={num}
        position={randomPosition}
        height={0.3}
        width={0.3}
        length={0.3}
        materials={['bullseye']}
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
  }

  renderBullet(velocity) {
    return (
      <ViroSphere
        key={this.bullets.length}
        radius={0.006}
        position={[0.021, -0.06, -0.15]}
        physicsBody={{
          type: 'Dynamic',
          mass: 10,
          useGravity: false,
          velocity: velocity,
        }}
        materials={['black']}
        viroTag={'bullet'}
        highAccuracyEvents={true}
        onCollision={this.hitTarget}
      />
      // <ViroBox
      //   key={this.bullets.length}
      //   position={[0.022, -0.06, -0.15]}
      //   height={0.01}
      //   width={0.01}
      //   length={0.01}
      //   physicsBody={{
      //     type: 'Dynamic',
      //     mass: 10,
      //     useGravity: false,
      //     velocity: velocity,
      //   }}
      //   materials={['grid']}
      //   viroTag={'bullet'}
      //   onCollision={this.hitTarget}
      // />
    );
  }

  fire({ position, rotation, forward }) {
    if (this.state.firing && this.state.canShoot) {
      const velocity = forward.map((vector) => 15 * vector);
      this.setState({
        ...this.state,
        firing: false,
        shotSound: true,
        canShoot: false,
        currentAnim: 'recoil',
      });
      this.bullets.push(this.renderBullet(velocity));
      setTimeout(() => {
        this.setState({
          ...this.state,
          canShoot: true,
          currentAnim: '',
          shotSound: false,
        });
      }, 1100);
    } else if (!this.targets.length) {
      for (let i = 0; i < 10; i++) {
        this.targets.push(this.renderTarget(i));
      }
    } else {
      this.setState({ ...this.state, firing: false });
    }
  }

  stopShotSound() {
    this.setState({ shotSound: false });
  }

  stopExplosionSound() {
    this.setState({ explosionSound: false });
  }

  render() {
    return (
      <ViroARScene
        onTrackingUpdated={this.trackingUpdated}
        onCameraTransformUpdate={this.fire}
      >
        <ViroSound
          source={require('./audio/pistolShot.mp3')}
          loop={false}
          paused={!this.state.shotSound}
          volume={0.5}
          onFinish={this.stopShotSound}
        />
        <ViroSound
          source={require('./audio/explosion.mp3')}
          loop={false}
          paused={!this.state.explosionSound}
          volume={0.5}
          onFinish={this.stopExplosionSound}
        />
        <ViroSound
          source={require('./audio/song2.m4a')}
          loop={true}
          paused={false}
          volume={0.5}
        />
        <ViroText
          text={`Hits: ${this.state.hits}`}
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
        />
        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -0.1, -0.1]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
        />
        <ViroARCamera>
          <Viro3DObject
            source={require('./res/gun.vrx')}
            type="VRX"
            highAccuracyEvents={true}
            scale={[0.0003, 0.0003, 0.0003]}
            position={[0.02, -0.1, -0.2]}
            rotation={[0, 90, -5]}
            animation={{
              name: this.state.currentAnim,
              run: true,
              // loop: true,
              // interruptible: true,
            }}
            onClick={() => {
              this.setState({
                ...this.state,
                firing: true,
              });
            }}
          />
          {this.bullets}
        </ViroARCamera>
        {/* <Viro3DObject
          source={require('./res/target.gltf')}
          type="GLTF"
          scale={[1, 1, 1]}
          position={[0, 1, -1]}
        /> */}
        {/* <ViroBox
            position={[0, 1, -3]}
            height={0.5}
            width={0.5}
            length={0.5}
            materials={['grid']}
            physicsBody={{
              type: 'Dynamic',
              mass: 0.1,
              useGravity: false,
            }}
            viroTag={'Box1'}
            onCollision={this._onCollision}
          /> */}
        {this.targets}
        {/* <ViroBox
          position={[5, 4, -5]}
          height={0.5}
          width={0.5}
          length={0.5}
          materials={['grid']}
          physicsBody={{
            type: 'Dynamic',
            mass: 0.1,
            useGravity: false,
          }}
          viroTag={'Box2'}
          onCollision={this._onCollision}
        />
        <ViroBox
          position={[-4, 2, -10]}
          height={0.5}
          width={0.5}
          length={0.5}
          materials={['grid']}
          physicsBody={{
            type: 'Dynamic',
            mass: 0.1,
            useGravity: false,
          }}
          viroTag={'Box3'}
          onCollision={this._onCollision}
        />
        <ViroBox
          position={[-6, 3, -6]}
          height={0.5}
          width={0.5}
          length={0.5}
          materials={['grid']}
          physicsBody={{
            type: 'Dynamic',
            mass: 0.1,
            useGravity: false,
          }}
          viroTag={'Box4'}
          onCollision={this._onCollision}
        />
        <ViroBox
          position={[5, 2, -3]}
          height={0.5}
          width={0.5}
          length={0.5}
          materials={['grid']}
          physicsBody={{
            type: 'Dynamic',
            mass: 0.1,
            useGravity: false,
          }}
          viroTag={'Box5'}
          onCollision={this._onCollision}
        />
        <ViroBox
          position={[2, 1, -4]}
          height={0.5}
          width={0.5}
          length={0.5}
          materials={['grid']}
          physicsBody={{
            type: 'Dynamic',
            mass: 0.1,
            useGravity: false,
          }}
          viroTag={'Box6'}
          onCollision={this._onCollision}
        /> */}
      </ViroARScene>
    );
  }

  _onButtonTap() {
    this.setState({
      ...this.state,
      bulletVelocity: [0, 0, -3],
      firing: true,
    });
  }

  _onTouch() {
    if (state == 1) {
      this.setState({
        ...this.state,
        bulletVelocity: [0, 0, -1],
        firing: true,
      });
    }
  }
}

ViroAnimations.registerAnimations({
  // recoilStart: {
  //   properties: { rotateX: 0, rotateY: 90, rotateZ: -5 },
  //   duration: 333,
  // },
  //            position={[0.02, -0.1, -0.2]}

  recoilUp: {
    properties: { positionX: 0.02, positionY: -0.09, positionZ: -0.15 },
    easing: 'easeOut',
    duration: 150,
  },
  recoilDown: {
    properties: { positionX: 0.02, positionY: -0.1, positionZ: -0.2 },
    easing: 'easeIn',
    duration: 150,
  },
  recoil: [['recoilUp', 'recoilDown']],
});

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 25,
    color: 'white',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

ViroMaterials.createMaterials({
  bullseye: {
    diffuseTexture: require('./res/bullseye.jpg'),
  },
  black: {
    diffuseTexture: require('./res/black.jpeg'),
  },
});

module.exports = HelloWorldSceneAR;
