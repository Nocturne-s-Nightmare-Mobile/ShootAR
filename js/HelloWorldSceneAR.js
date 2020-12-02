"use strict";

import React, { Component } from "react";

import { StyleSheet, Vibration, View, Text } from 'react-native';

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
  ViroParticleEmitter,
} from 'react-viro';


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
      update: true,
      canShoot: true,
      currentAnim: "",
      songs: [false, false, false, false, false, false, false],
      battlefield: [false, false],
      gameStarted: false,
      score: 0,
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
    this.pickRandomSong = this.pickRandomSong.bind(this);
    this.stopSong = this.stopSong.bind(this);
    this.stopBattlefield = this.stopBattlefield.bind(this);
    this.nextBattlefield = this.nextBattlefield.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  componentDidMount() {
    this.pickRandomSong();
    this.nextBattlefield();
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

  hitTarget(tag) {
    Vibration.vibrate(50);
    this.targets[+tag] = this.renderTarget(+tag);
    this.setState((prevState) => ({
      ...this.state,
      hits: prevState.hits + 1,
      explosionSound: true,
    }));
  }

  startGame() {
    this.setState({ ...this.state, gameStarted: true });
    setTimeout(() => {
      this.setState((prevState) => ({
        ...this.state,
        score: prevState.hits,
        hits: 0,
        gameStarted: false,
      }));
    }, 60000);
  }

  renderTarget(num) {
    let posX =
      Math.floor(Math.random() * 6) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posY = Math.floor(Math.random() * 4);
    let posZ = Math.floor(Math.random() * 5 * -1 - 3);
    let randomPosition = [posX, posY, posZ];
    const textures = [
      'metallic',
      'brass',
      'neon',
      'desert',
      'trippy',
      'gold',
      'blueMetal',
      'redMetal',
      'shiny',
      'pink',
      'rough',
    ];
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
    this.setState((prevState) => ({
      ...this.state,
      update: !prevState.update,
    }));
    return (
      <ViroSphere
        key={num}
        position={randomPosition}
        radius={0.2}
        materials={targets[num]}
        physicsBody={{
          type: "Static",
          mass: 0,
          useGravity: false,
          velocity: [0, 0, 0],
        }}
        viroTag={`${num}`}
        transformBehaviors={["billboard"]}
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
          type: "Dynamic",
          mass: 10,
          useGravity: false,
          velocity: velocity,
        }}
        materials={['brass']}
        viroTag={'bullet'}
        highAccuracyEvents={true}
        onCollision={this.hitTarget}
      />
      // <Viro3DObject
      //   key={this.bullets.length}
      //   source={require('./res/Bullet.vrx')}
      //   type="VRX"
      //   highAccuracyEvents={true}
      //   position={[0.026, -0.07, -0.2]}
      //   scale={[0.02, 0.02, 0.02]}
      //   rotation={[0, 90, 0]}
      //   // resources={[
      //   //   require('./res/Bullet_AO.png'),
      //   //   require('./res/Bullet_BaseColor.png'),
      //   //   require('./res/Bullet_Height.png'),
      //   //   require('./res/Bullet_Metallic.png'),
      //   //   require('./res/Bullet_Normal.png'),
      //   //   require('./res/Bullet_Roughness.png'),
      //   // ]}
      //   physicsBody={{
      //     type: 'Dynamic',
      //     mass: 10,
      //     useGravity: false,
      //     velocity: velocity,
      //   }}
      //   viroTag={'bullet'}
      //   highAccuracyEvents={true}
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
        currentAnim: "recoil",
      });
      this.bullets.push(this.renderBullet(velocity));
      setTimeout(() => {
        this.setState({
          ...this.state,
          canShoot: true,
          currentAnim: "",
          shotSound: false,
        });
      }, 1000);
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

  stopSong() {
    this.pickRandomSong();
  }

  pickRandomSong() {
    const random = Math.floor(Math.random() * 7);
    const newSongs = [...this.state.songs];
    if (newSongs[random]) {
      this.pickRandomSong();
    } else {
      newSongs[random] = true;
      this.setState({ songs: [...newSongs] });
    }
  }

  stopBattlefield() {
    this.setState({ battlefield: [false, false] });
    this.nextBattlefield();
  }

  nextBattlefield() {
    const random = Math.floor(Math.random() * 2);
    const newBattlefield = [...this.state.battlefield];
    newBattlefield[random] = true;
    this.setState({ battlefield: [...newBattlefield] });
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
          volume={0.6}
          onFinish={this.stopShotSound}
        />
        <ViroSound
          source={require("./audio/explosion.mp3")}
          loop={false}
          paused={!this.state.explosionSound}
          volume={0.5}
          onFinish={this.stopExplosionSound}
        />
        <ViroSound
          source={require("./audio/song.mp3")}
          loop={false}
          paused={!this.state.songs[0]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song2.m4a")}
          loop={false}
          paused={!this.state.songs[1]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song3.m4a")}
          loop={false}
          paused={!this.state.songs[2]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song4.mp3")}
          loop={false}
          paused={!this.state.songs[3]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song5.mp3")}
          loop={false}
          paused={!this.state.songs[4]}
          volume={0.35}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song6.mp3")}
          loop={false}
          paused={!this.state.songs[5]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/song7.mp3")}
          loop={false}
          paused={!this.state.songs[6]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require("./audio/battlefield.mp3")}
          loop={true}
          paused={!this.state.battlefield[0]}
          volume={0.2}
          onFinish={this.stopBattlefield}
        />
        <ViroSound
          source={require("./audio/battlefield2.mp3")}
          loop={true}
          paused={!this.state.battlefield[1]}
          volume={0.1}
          onFinish={this.stopBattlefield}
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
          <ViroSound
            source={require('./audio/explosion.mp3')}
            loop={false}
            paused={!this.state.explosionSound}
            volume={0.5}
            onFinish={this.stopExplosionSound}
          />
          <ViroSound
            source={require('./audio/song.mp3')}
            loop={false}
            paused={!this.state.songs[0]}
            volume={0.25}
            onFinish={this.stopSong}
          />
          <ViroSound
            source={require('./audio/song2.m4a')}
            loop={false}
            paused={!this.state.songs[1]}
            volume={0.25}
            onFinish={this.stopSong}
          />
          <ViroSound
            source={require('./audio/song3.m4a')}
            loop={false}
            paused={!this.state.songs[2]}
            volume={0.25}
            onFinish={this.stopSong}
          />
          <ViroSound
            source={require('./audio/song4.mp3')}
            loop={false}
            paused={!this.state.songs[3]}
            volume={2}
            onFinish={this.stopSong}
          />
          <ViroSound
            source={require('./audio/song5.mp3')}
            loop={false}
            paused={!this.state.songs[4]}
            volume={0.3}
            onFinish={this.stopSong}
          />
          <ViroSound
            source={require('./audio/battlefield.mp3')}
            loop={true}
            paused={!this.state.battlefield[0]}
            volume={0.2}
            onFinish={this.stopBattlefield}
          />
          <ViroSound
            source={require('./audio/battlefield2.mp3')}
            loop={true}
            paused={!this.state.battlefield[1]}
            volume={0.1}
            onFinish={this.stopBattlefield}
          />
          <ViroText
            text={
              this.state.gameStarted
                ? `Hits: ${this.state.hits}`
                : `Shoot to Start!\nScore: ${this.state.score}`
            }
            scale={[0.5, 0.5, 0.5]}
            position={[0, 0, -1]}
            style={styles.helloWorldTextStyle}
            transformBehaviors={['billboard']}
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
            <ViroNode>
              <Viro3DObject
                source={require('./res/gun.vrx')}
                type="VRX"
                scale={[0.0003, 0.0003, 0.0003]}
                position={[0.02, -0.1, -0.2]}
                rotation={[0, 90, -5]}
                animation={{
                  name: this.state.currentAnim,
                  run: true,
                }}
                onClick={() => {
                  this.setState({
                    ...this.state,
                    firing: true,
                  });
                }}
              />
              {/* <ViroParticleEmitter
              position={[0.03, -0.09, -0.45]}
              duration={2000}
              visible={true}
              delay={0}
              run={true}
              loop={true}
              fixedToEmitter={true}
              image={{
                source: require('./res/fireParticle.jpg'),
                height: 0.01,
                width: 0.01,
                bloomThreshold: 0.1,
              }}
              spawnBehavior={{
                particleLifetime: [100, 100],
                emissionRatePerSecond: [150, 200],
                spawnVolume: {
                  shape: 'box',
                  params: [0, 0, 0],
                  spawnOnSurface: false,
                },
                maxParticles: 500,
              }}
              particleAppearance={{
                opacity: {
                  initialRange: [0, 1],
                  factor: 'Distance',
                  interpolation: [
                    { endValue: 0.5, interval: [0, 500] },
                    { endValue: 1.0, interval: [0, 500] },
                  ],
                },

                rotation: {
                  initialRange: [0, 360],
                  factor: 'Distance',
                  interpolation: [{ endValue: 1080, interval: [0, 500] }],
                },

                scale: {
                  initialRange: [
                    [1, 1, 1],
                    [4, 4, 4],
                  ],
                  factor: 'Distance',
                  interpolation: [
                    { endValue: [3, 3, 3], interval: [0, 400] },
                    { endValue: [0, 0, 0], interval: [400, 500] },
                  ],
                },
              }}
              particlePhysics={{
                velocity: {
                  initialRange: [
                    [2, 1, -5],
                    [-2, -1, -5],
                  ],
                },
              }}
            /> */}
            </ViroNode>
            {this.bullets}
          </ViroARCamera>
          {this.state.gameStarted ? (
            <>{this.targets}</>
          ) : (
            <ViroBox
              position={[0, 1, -3]}
              height={0.5}
              width={0.5}
              length={0.5}
              materials={['bullseye']}
              physicsBody={{
                type: 'Dynamic',
                mass: 0.1,
                useGravity: false,
              }}
              viroTag={'Start'}
              onCollision={this.startGame}
            />
          )}
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
      </>
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
    easing: "easeOut",
    duration: 150,
  },
  recoilDown: {
    properties: { positionX: 0.02, positionY: -0.1, positionZ: -0.2 },
    easing: "easeIn",
    duration: 150,
  },
  recoil: [["recoilUp", "recoilDown"]],
});

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 15,
    color: 'white',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});

ViroMaterials.createMaterials({
  bullseye: {
    diffuseTexture: require('./res/bullseye2.jpg'),
  },
  black: {
    diffuseTexture: require("./res/black.jpeg"),
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
  neon: {
    diffuseTexture: require('./res/neon.jpeg'),
  },
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
});

module.exports = HelloWorldSceneAR;
