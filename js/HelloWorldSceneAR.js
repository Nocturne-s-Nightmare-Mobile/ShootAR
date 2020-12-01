"use strict";

import React, { Component } from "react";

import { StyleSheet, Vibration } from "react-native";

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
} from "react-viro";

export default class HelloWorldSceneAR extends Component {
  constructor() {
    super();
    this.state = {
      hasARInitialized: false,
      text: "Initializing AR...",
      firing: false,
      bulletPosition: [0.02, -0.06, -0.15],
      hits: 0,
      shotSound: false,
      explosionSound: false,
    };

    this.bullets = [];
    this.targets = [];

    this._onLoadStart = this._onLoadStart.bind(this);
    this._onButtonTap = this._onButtonTap.bind(this);
    this._onTouch = this._onTouch.bind(this);
    this.fire = this.fire.bind(this);
    this._onCollision = this._onCollision.bind(this);
    this.stopShotSound = this.stopShotSound.bind(this);
    this.stopExplosionSound = this.stopExplosionSound.bind(this);
  }

  _onLoadStart() {
    console.log("OBJ loading has started");
  }
  _onLoadEnd() {
    console.log("OBJ loading has finished");
  }
  _onError(event) {
    console.log("OBJ loading failed with error: " + event.nativeEvent.error);
  }

  _onCollision() {
    Vibration.vibrate(50);
    this.targets.pop();
    // this.targets.push(this.renderTarget());
    this.setState((prevState) => ({
      ...this.state,
      hits: prevState.hits + 1,
      explosionSound: true,
    }));
  }

  renderTarget() {
    let posX =
      Math.floor(Math.random() * 6) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posY = Math.floor(Math.random() * 4 + 1);
    let posZ = Math.floor(Math.random() * 7 * -1 - 3);
    let randomPosition = [posX, posY, posZ];
    this.setState({ ...this.state, text: randomPosition.toString() });
    return (
      <ViroBox
        key={this.targets.length}
        position={randomPosition}
        height={0.3}
        width={0.3}
        length={0.3}
        materials={["grid"]}
        physicsBody={{
          type: "Dynamic",
          mass: 0.1,
          useGravity: false,
        }}
        viroTag={"target"}
        onCollision={this._onCollision}
      />
    );
  }

  renderBullet(velocity) {
    return (
      <ViroBox
        key={this.bullets.length}
        position={[0.022, -0.06, -0.15]}
        height={0.01}
        width={0.01}
        length={0.01}
        physicsBody={{
          type: "Dynamic",
          mass: 10,
          useGravity: false,
          velocity: velocity,
        }}
        materials={["grid"]}
      />
    );
  }

  fire({ position, rotation, forward }) {
    if (this.state.firing) {
      const velocity = forward.map((vector) => 15 * vector);
      this.setState({ ...this.state, firing: false, shotSound: true });
      this.bullets.push(this.renderBullet(velocity));
      // ADD SOUND HERE
    } else if (this.targets.length < 1) {
      this.targets.push(this.renderTarget());
      // this.targets.push(this.renderTarget());
      // this.targets.push(this.renderTarget());
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
          source={require("./audio/pistolShot.mp3")}
          loop={false}
          paused={!this.state.shotSound}
          volume={0.5}
          onFinish={this.stopShotSound}
        />
        <ViroSound
          source={require("./audio/explosion.mp3")}
          loop={false}
          paused={!this.state.explosionSound}
          volume={0.5}
          onFinish={this.stopExplosionSound}
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
            source={require("./res/gun.vrx")}
            type="VRX"
            scale={[0.0003, 0.0003, 0.0003]}
            position={[0.02, -0.1, -0.2]}
            rotation={[0, 90, -5]}
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

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 25,
    color: "white",
    textAlignVertical: "center",
    textAlign: "center",
  },
});

ViroMaterials.createMaterials({
  grid: {
    diffuseTexture: require("./res/grid_bg.jpg"),
  },
});

module.exports = HelloWorldSceneAR;
