'use strict';

import React, { Component } from 'react';

import { StyleSheet, Vibration } from 'react-native';

import {
  setFiring,
  setText,
  setHits,
  setCanShoot,
  startGame,
  setScore,
} from './store';

import { connect } from 'react-redux';

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
  ViroFlexView,
  ViroImage,
  ViroSkyBox,
  Viro360Image,
} from 'react-viro';

export default class HelloWorldSceneAR extends Component {
  constructor() {
    super();
    this.state = {
      hasARInitialized: false,
      bulletPosition: [0.02, -0.06, -0.15],
      shotSound: false,
      explosionSound: false,
      update: true,
      currentAnim: '',
      songs: [false, false, false, false, false, false, false],
      battlefield: [false, false],
    };

    this.bullets = [];
    this.targets = [];

    this._onLoadStart = this._onLoadStart.bind(this);
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
      explosionSound: true,
    }));
    this.props.setHits(this.props.hits + 1);
  }

  startGame() {
    this.props.startGame(true);
    setTimeout(() => {
      this.props.setScore(this.props.hits);
      this.props.setHits(0);
      this.props.startGame(false);
    }, 60000);
  }

  renderTarget(num) {
    let posX =
      Math.floor(Math.random() * 6) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posY =
      Math.floor(Math.random() * 4) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
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
        materials={['brass']}
        viroTag={'bullet'}
        highAccuracyEvents={true}
        onCollision={this.hitTarget}
      />
    );
  }

  fire({ position, rotation, forward }) {
    if (this.props.firing && this.props.canShoot) {
      const velocity = forward.map((vector) => 20 * vector);
      this.setState({
        ...this.state,
        shotSound: true,
        currentAnim: 'recoil',
      });
      this.props.setCanShoot(false);
      this.props.setFiring(false);
      this.bullets.push(this.renderBullet(velocity));
      setTimeout(() => {
        this.setState({
          ...this.state,
          currentAnim: '',
          shotSound: false,
        });
        this.props.setCanShoot(true);
      }, 1000);
    } else if (!this.targets.length) {
      for (let i = 0; i < 10; i++) {
        this.targets.push(this.renderTarget(i));
      }
    } else {
      // this.props.setFiring(false);
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
        {/* <ViroSkyBox
          source={{
            nx: require('./res/sb_space_left.png'),
            px: require('./res/sb_space_right.png'),
            ny: require('./res/sb_space_bottom.png'),
            py: require('./res/sb_space_top.png'),
            nz: require('./res/sb_space_back.png'),
            pz: require('./res/sb_space_front.png'),
          }}
        /> */}
        <Viro360Image
          source={require('./res/building.jpg')}
          rotation={[0, 30, 0]}
        />
        <ViroSound
          source={require('./audio/pistolShot.mp3')}
          loop={false}
          paused={!this.state.shotSound}
          volume={0.6}
          onFinish={this.stopShotSound}
        />
        <ViroSound
          source={require('./audio/explosion.mp3')}
          loop={false}
          paused={!this.state.explosionSound}
          volume={0.5}
          onFinish={this.stopExplosionSound}
          interruptible={true}
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
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song5.mp3')}
          loop={false}
          paused={!this.state.songs[4]}
          volume={0.35}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song6.mp3')}
          loop={false}
          paused={!this.state.songs[5]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song7.mp3')}
          loop={false}
          paused={!this.state.songs[6]}
          volume={0.2}
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
        {/* <ViroText
          text={
            this.props.gameStarted
              ? `Hits: ${this.props.hits}`
              : `Shoot to Start!\nScore: ${this.props.score}`
          }
          scale={[0.5, 0.5, 0.5]}
          position={[0, 0, -1]}
          style={styles.helloWorldTextStyle}
          transformBehaviors={['billboard']}
        /> */}
        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -0.1, -0.1]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
        />
        <ViroSpotLight
          innerAngle={5}
          outterAngle={90}
          direction={[0.1, -0.1, 0]}
          position={[0, 1, -0.2]}
          color="#ffffff"
          // intensity={10000}
        />
        <ViroARCamera>
          {/* <ViroText
            text={'O'}
            position={[0.485, -0.465, -2]}
            style={{ color: 'white', fontSize: 7 }}
          /> */}
          <ViroNode>
            <Viro3DObject
              source={require('./res/gun.vrx')}
              type="VRX"
              scale={[0.0003, 0.0003, 0.0003]}
              position={[0.02, -0.1, -0.2]}
              rotation={[0, 90, 355]}
              animation={{
                name: this.state.currentAnim,
                run: true,
              }}
              onClick={() => {
                this.props.setFiring(true);
              }}
            />
            {/* <Viro3DObject
              source={require('./res/ColtGun.vrx')}
              type="VRX"
              scale={[0.00017, 0.00017, 0.00017]}
              position={[0.02, -0.1, -0.2]}
              rotation={[0, 273, 355]}
              animation={{
                name: this.state.currentAnim,
                run: true,
              }}
              onClick={() => {
                this.props.setFiring(true);
              }}
            /> */}
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
        {this.props.gameStarted ? (
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
      </ViroARScene>
    );
  }
}

ViroAnimations.registerAnimations({
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
    fontSize: 20,
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
    diffuseTexture: require('./res/black.jpeg'),
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

const mapState = (state) => ({
  state: state,
  text: state.text,
  firing: state.firing,
  hits: state.hits,
  canShoot: state.canShoot,
  gameStarted: state.gameStarted,
  score: state.score,
});

const mapDispatch = (dispatch) => ({
  setFiring: (firing) => dispatch(setFiring(firing)),
  setText: (text) => dispatch(setText(text)),
  setHits: (hits) => dispatch(setHits(hits)),
  setCanShoot: (canShoot) => dispatch(setCanShoot(canShoot)),
  startGame: (gameStarted) => dispatch(startGame(gameStarted)),
  setScore: (score) => dispatch(setScore(score)),
});

module.exports = connect(mapState, mapDispatch)(HelloWorldSceneAR);
