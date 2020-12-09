'use strict';

import React, { Component } from 'react';

import { StyleSheet, Vibration, Platform } from 'react-native';

import {
  setFiring,
  setText,
  setHits,
  setCanShoot,
  startGame,
  setScore,
  setClip,
  setTimer,
  setSelected,
  guns,
  setBurst,
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

const handgun = require('./res/gun.vrx');
const Ak = require('./res/Ak.vrx');
const HaloBR = require('./res/HaloBR.vrx');

let selected = {
  source: handgun,
  bulletStart: [0.02, -0.06, -0.15],
  recoilAnim: '',
  reloadAnim: '',
  timeout: 1000,
  clip: 12,
  scale: [0.0003, 0.0003, 0.0003],
  position: [0.02, -0.1, -0.2],
  rotation: [0, 90, 355],
  animation: '',
};

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
      magAnim: '',
      songs: [false, false, false, false, false, false, false],
      battlefield: [false, false],
      isReloading: false,
      reloadSound: false,
      scene: 'building',
      bursted: false,
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
    this.reload = this.reload.bind(this);
    this.stopReloadSound = this.stopReloadSound.bind(this);
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
    this.props.setHits(0);
    this.props.startGame(true);
    this.props.setClip(this.props.selected.clip);
    this.props.setTimer(60);
    let x = setInterval(() => {
      this.props.setTimer(this.props.timer - 1);
      if (this.props.timer <= 0) {
        clearInterval(x);
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(x);
      this.props.setScore(this.props.hits);
      this.props.setHits(0);
      this.props.startGame(false);
      this.props.setTimer(60);
      this.targets = [];
      this.bullets = [];
      if (this.state.scene === 'building') {
        this.setState({ scene: 'galaxy' });
      } else {
        this.setState({ scene: 'building' });
      }
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
    this.setState((prevState) => ({
      ...this.state,
      update: !prevState.update,
    }));
    return (
      <ViroSphere
        key={num}
        position={randomPosition}
        radius={0.2}
        materials={
          this.state.scene === 'building' ? targets[num] : planets[num]
        }
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
        //Make This Bullet Start Pos after componetized v
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
    if (this.state.isReloading) {
      this.props.setCanShoot(false);
      this.props.setFiring(false);
    } else if (this.props.clip === 0) {
      this.props.setCanShoot(false);
      this.setState({ isReloading: true, currentAnim: 'reload' });
      this.props.setFiring(false);
      this.reload();
    } else if (
      this.props.firing &&
      this.props.clip > 0 &&
      !this.state.isReloading &&
      this.props.selected.type === 'burst'
    ) {
      const velocity = forward.map((vector) => 20 * vector);
      if (!this.props.burst) {
        this.props.setClip(this.props.clip - 1);
        this.props.setCanShoot(false);
        this.props.setFiring(false);
        this.props.setBurst(true);
        this.props.setText(this.props.burst);

        this.bullets.push(this.renderBullet(velocity));
        setTimeout(() => {
          this.props.setFiring(true);
        }, 100);
        setTimeout(() => {
          this.props.setFiring(true);
        }, 200);
        setTimeout(() => {
          this.props.setCanShoot(true);
          this.props.setBurst(false);
        }, 1000);
      } else if (this.props.firing) {
        this.props.setClip(this.props.clip - 1);
        this.bullets.push(this.renderBullet(velocity));
        this.props.setFiring(false);
      }
    } else if (
      this.props.firing &&
      this.props.canShoot &&
      this.props.clip > 0 &&
      !this.state.isReloading
    ) {
      const velocity = forward.map((vector) => 20 * vector);
      this.setState({
        ...this.state,
        shotSound: true,
        currentAnim: 'recoil',
      });
      this.props.setClip(this.props.clip - 1);
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
      }, this.props.selected.timeout);
    } else if (!this.targets.length) {
      for (let i = 0; i < 10; i++) {
        this.targets.push(this.renderTarget(i));
      }
    }
  }

  reload() {
    setTimeout(() => {
      this.setState({
        reloadSound: true,
        magAnim: 'mag',
      });
    }, 1500);
    setTimeout(() => {
      this.setState({
        isReloading: false,
        shotSound: false,
      });
      this.props.setFiring(false);
      this.props.setClip(this.props.selected.clip);
      this.props.setCanShoot(true);
    }, 2000);
    setTimeout(() => {
      this.setState({
        magAnim: '',
      });
    }, 3000);
  }

  stopReloadSound() {
    this.setState({ reloadSound: false });
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
        {this.state.scene === 'building' && (
          <Viro360Image
            source={require('./res/building.jpg')}
            rotation={[0, 28, 0]}
          />
        )}
        {this.state.scene === 'galaxy' && (
          <Viro360Image
            source={require('./res/360galaxy.jpg')}
            rotation={[0, 90, 0]}
          />
        )}
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
          volume={0.75}
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
        <ViroSound
          source={require('./audio/reload.mp3')}
          loop={false}
          paused={!this.state.reloadSound}
          volume={0.9}
          onFinish={this.stopReloadSound}
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
          {/* <ViroText
            text={'O'}
            position={[0.485, -0.465, -2]}
            style={{ color: 'white', fontSize: 7 }}
          /> */}
          <ViroNode>
            {/* <Viro3DObject
              source={require('./res/gun.vrx')}
              type="VRX"
              highAccuracyEvents={true}
              scale={[0.0003, 0.0003, 0.0003]}
              position={[0.02, -0.1, -0.2]}
              rotation={[0, 90, 355]}
              animation={{
                name: this.state.currentAnim,
                run: true,
              }}
              onClick={() => {
                if (this.props.canShoot && Platform.OS !== 'ios') {
                  this.props.setFiring(true);
                }
              }}
            /> */}

            {/* <Viro3DObject
              source={require('./res/Ak.vrx')}
              type="VRX"
              scale={[0.0016, 0.0016, 0.0016]}
              position={[0.021, -0.075, -0.125]}
              rotation={[353, 185, 350]}
              // animation={{
              //   name: this.state.currentAnim,
              //   run: true,
              // }}
              onClick={() => {
                if (this.props.canShoot && Platform.OS !== 'ios') {
                  this.props.setFiring(true);
                }
              }}
            /> */}

            {/* Magazine */}
            <Viro3DObject
              highAccuracyEvents={true}
              source={require('./res/Mag_Handgun.vrx')}
              type="VRX"
              scale={[0.004, 0.004, 0.004]}
              position={[-10, -0.045, -0.11]}
              rotation={[90, 90, 0]}
              animation={{
                name: this.state.magAnim,
                run: true,
              }}
            />

            {/* <Viro3DObject
              source={require('./res/ColtGun.vrx')}
              type="VRX"
              scale={[0.00017, 0.00017, 0.00017]}
              position={[0.02, -0.4, -0.2]}
              rotation={[0, 273, 355]}
              animation={{
                name: this.state.currentAnim,
                run: true,
              }}
              onClick={() => {
                this.props.setFiring(true);
              }}
            /> */}
            <Viro3DObject
              source={this.props.selected.source}
              type="VRX"
              scale={this.props.selected.scale}
              position={this.props.selected.position}
              rotation={this.props.selected.rotation}
              // animation={{
              //   name: this.state.currentAnim,
              //   run: true,
              // }}
              onClick={() => {
                if (this.props.canShoot && Platform.OS !== 'ios') {
                  this.props.setFiring(true);
                }
              }}
            />
          </ViroNode>
          {this.bullets}
        </ViroARCamera>
        {this.props.gameStarted ? (
          <>{this.targets}</>
        ) : (
          <>
            <ViroSphere
              position={[0, 0, -5]}
              radius={0.4}
              materials={['bullseyeSphere']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              transformBehaviors={['billboard']}
              viroTag={'Start'}
              onCollision={this.startGame}
            />
            <Viro3DObject
              source={handgun}
              type="VRX"
              position={[-3, 0, -5]}
              scale={[0.0025, 0.0025, 0.0025]}
              rotation={[180, 180, 180]}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              viroTag={'Start'}
              onCollision={() => {
                this.props.selectGun('handgun');
                selected = guns['handgun'];
                this.props.setClip(selected.clip);
                this.setState({
                  currentAnim: 'setPlace',
                });
              }}
            />
            <Viro3DObject
              source={Ak}
              type="VRX"
              position={[3, 0, -5]}
              scale={[0.015, 0.015, 0.015]}
              rotation={[180, 180, 180]}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              viroTag={'Start'}
              onCollision={() => {
                this.props.selectGun('Ak');
                selected = guns['Ak'];
                this.props.setClip(selected.clip);
                this.setState({
                  currentAnim: 'setPlace',
                });
              }}
            />
            <Viro3DObject
              source={HaloBR}
              type="VRX"
              position={[0, -3, -5]}
              scale={[0.005, 0.005, 0.005]}
              rotation={[0, -90, 0]}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              viroTag={'Start'}
              onCollision={() => {
                this.props.selectGun('HaloBR');
                selected = guns['HaloBR'];
                this.props.setClip(selected.clip);
                this.setState({
                  currentAnim: 'setPlace',
                });
              }}
            />
          </>
        )}
      </ViroARScene>
    );
  }
}

ViroAnimations.registerAnimations({
  recoilUp: {
    properties: {
      positionX: selected.position[0],
      positionY: selected.position[1] + 0.01,
      positionZ: selected.position[2] + 0.05,
    },
    easing: 'easeOut',
    duration: 150,
  },
  recoilDown: {
    // properties: { positionX: 0.02, positionY: -0.1, positionZ: -0.2 },
    properties: {
      positionX: selected.position[0],
      positionY: selected.position[1],
      positionZ: selected.position[2],
    },
    easing: 'easeIn',
    duration: 150,
  },
  recoil: [['recoilUp', 'recoilDown']],
});

ViroAnimations.registerAnimations({
  setPlace: {
    properties: {
      positionX: selected.position[0],
      positionY: selected.position[1],
      positionZ: selected.position[2],
    },
    duration: 50,
  },
});

ViroAnimations.registerAnimations({
  reloadStart: {
    properties: {
      rotateX: 0,
      rotateY: 90,
      rotateZ: 265,
      positionX: 0.06,
      positionY: -0.05,
      positionZ: -0.2,
    },
    easing: 'easeOut',
    duration: 250,
  },
  reloadMiddle: {
    properties: { rotateX: 0, rotateY: 90, rotateZ: 265 },
    easing: 'easeOut',
    duration: 2650,
  },
  reloadEnd: {
    properties: {
      rotateX: 0,
      rotateY: 90,
      rotateZ: 355,
      positionX: 0.02,
      positionY: -0.1,
      positionZ: -0.2,
    },
    easing: 'easeIn',
    duration: 250,
  },
  reload: [['reloadStart', 'reloadMiddle', 'reloadEnd']],
});

// Magazine Aminations for reload
ViroAnimations.registerAnimations({
  magInitial: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: 0.055,
      positionY: -0.045,
      positionZ: -0.11,
    },
    duration: 0,
  },
  magStart: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: -1.5,
      positionY: -0.045,
      positionZ: -0.11,
    },
    easing: 'easeOut',
    duration: 1000,
  },
  magStartMiddle: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: -1.5,
      positionY: -0.045,
      positionZ: -0.11,
    },
    easing: 'easeOut',
    duration: 500,
  },
  magEndMiddle: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: 0.055,
      positionY: -0.045,
      positionZ: -0.11,
    },
    easing: 'easeout',
    duration: 850,
  },
  magEnd: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: -10,
      positionY: -0.045,
      positionZ: -0.11,
    },
    duration: 0,
  },

  mag: [['magInitial', 'magStart', 'magStartMiddle', 'magEndMiddle', 'magEnd']],
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
  neon2: {
    diffuseTexture: require('./res/neon2.png'),
  },
  start: {
    diffuseTexture: require('./res/Start1.png'),
  },
  Ak: {
    diffuseTexture: require('./res/AkSphere.png'),
  },
  pistol: {
    diffuseTexture: require('./res/pistolSphere.png'),
  },
  HaloBR: {
    diffuseTexture: require('./res/HaloBRSphere.png'),
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
  clip: state.clip,
  timer: state.timer,
  selected: state.selected,
  burst: state.burst,
});

const mapDispatch = (dispatch) => ({
  setFiring: (firing) => dispatch(setFiring(firing)),
  setText: (text) => dispatch(setText(text)),
  setHits: (hits) => dispatch(setHits(hits)),
  setCanShoot: (canShoot) => dispatch(setCanShoot(canShoot)),
  startGame: (gameStarted) => dispatch(startGame(gameStarted)),
  setScore: (score) => dispatch(setScore(score)),
  setClip: (clip) => dispatch(setClip(clip)),
  setTimer: (timer) => dispatch(setTimer(timer)),
  selectGun: (selected) => dispatch(setSelected(selected)),
  setBurst: (burst) => dispatch(setBurst(burst)),
});

module.exports = connect(mapState, mapDispatch)(HelloWorldSceneAR);
