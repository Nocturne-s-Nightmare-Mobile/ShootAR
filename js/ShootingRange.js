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
  unlockGun,
  setDifficulty,
  setReloading,
} from './store';

import { Target } from './Target.js';

import { connect } from 'react-redux';

import {
  ViroARScene,
  ViroNode,
  ViroText,
  ViroBox,
  ViroMaterials,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARCamera,
  ViroSphere,
  ViroSound,
  ViroAnimations,
  ViroParticleEmitter,
  Viro360Image,
} from 'react-viro';
import animations from './animations';
import textures from './textures';
import Bullet from './Bullet';

const handgun = require('./res/gun.vrx');
const Ak = require('./res/Ak.vrx');
const HaloBR = require('./res/HaloBR.vrx');

let selected = {
  name: 'handgun',
  source: handgun,
  bulletStart: [0.02, -0.06, -0.15],
  recoilAnim: '',
  reloadAnim: '',
  timeout: 500,
  clip: 8,
  scale: [0.0003, 0.0003, 0.0003],
  position: [0.02, -0.1, -0.2],
  rotation: [0, 90, 355],
  animation: '',
  soundSource: './audio/pistolShot.mp3',
};

export default class ShootingRange extends Component {
  constructor() {
    super();
    this.state = {
      hasARInitialized: false,
      bulletPosition: [0.02, -0.06, -0.15],
      shotSound: [],
      shotSoundIndex: 0,
      explosionSound: false,
      update: true,
      currentAnim: '',
      magAnim: '',
      songs: [false, false, false, false, false, false, false],
      battlefield: [false, false],
      reloadSound: false,
      scene: 'building',
      bursted: false,
      canReload: true,
    };

    this.bullets = [];
    this.targets = [];
    this.targetExplosion = [];

    this._onLoadStart = this._onLoadStart.bind(this);
    this.fire = this.fire.bind(this);
    this.hitTarget = this.hitTarget.bind(this);
    this.stopExplosionSound = this.stopExplosionSound.bind(this);
    this.pickRandomSong = this.pickRandomSong.bind(this);
    this.stopSong = this.stopSong.bind(this);
    this.stopBattlefield = this.stopBattlefield.bind(this);
    this.nextBattlefield = this.nextBattlefield.bind(this);
    this.startGame = this.startGame.bind(this);
    this.reload = this.reload.bind(this);
    this.stopReloadSound = this.stopReloadSound.bind(this);
    this.loopShotSounds = this.loopShotSounds.bind(this);
    this.resetShotSound = this.resetShotSound.bind(this);
    this.targetBoom = this.targetBoom.bind(this);
  }

  componentDidMount() {
    this.pickRandomSong();
    this.nextBattlefield();
    this.resetShotSound();
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

  targetBoom(position) {
    this.targetExplosion.push(
      <ViroParticleEmitter
        key={this.targetExplosion.length}
        position={position}
        duration={300}
        run={true}
        visible={true}
        fixedToEmitter={true}
        image={{
          source: require('./res/explosion.png'),
          height: 0.15,
          width: 0.15,
          bloomThreshold: 1,
        }}
        spawnBehavior={{
          particleLifetime: [300, 300],
          emissionRatePerSecond: [50, 50],
          maxParticles: 50,
          spawnVolume: {
            shape: 'sphere',
            params: [0.2, 0.2, 0.2],
            spawnOnSurface: true,
          },
        }}
        particlePhysics={{
          explosiveImpulse: {
            impulse: 20,
            position: position.map((x) => x * 1),
            decelerationPeriod: 300,
          },
        }}
        particleAppearance={{
          opacity: {
            initialRange: [0, 1.0],
            factor: 'time',
            interpolation: [
              {
                endValue: 0.5,
                interval: [0, 150],
              },
              {
                endValue: 1,
                interval: [150, 300],
              },
            ],
          },
          scale: {
            initialRange: [
              [1, 1, 1],
              [0.5, 0.5, 0.5],
            ],
            factor: 'time',
            interpolation: [
              { endValue: [2, 2, 2], interval: [0, 150] },
              { endValue: [0, 0, 0], interval: [150, 300] },
            ],
          },
        }}
      />
    );
  }

  hitTarget(tag, point) {
    Vibration.vibrate(50);
    this.targets[+tag] = this.renderTarget(+tag);
    this.setState({
      ...this.state,
      explosionSound: true,
    });
    this.props.setHits(this.props.hits + 1);
    //Below function renders explosion on impact with target.  Commented out due to performance issues, but if we can optimize, would be cool to add back in.
    this.props.gameStarted && this.targetBoom(point);
  }

  startGame() {
    this.props.setHits(0);
    this.props.startGame(true);
    this.bullets = [];
    this.props.setClip(this.props.selected.clip);
    this.props.setTimer(60);
    for (let i = 0; i < 10; i++) {
      this.targets.push(this.renderTarget(i));
    }
    let x = setInterval(() => {
      this.props.setTimer(this.props.timer - 1);
      if (this.props.timer <= 0) {
        clearInterval(x);
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(x);
      if (this.props.hits >= 25 && !this.props.unlocked['Ak']) {
        this.props.unlockGun('Ak');
      }
      if (this.props.hits >= 35 && !this.props.unlocked['HaloBR']) {
        this.props.unlockGun('HaloBR');
      }
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
    let posDifficulty;
    if (this.props.difficulty[0] === 'Normal') {
      posDifficulty = [5, 3];
    } else if (this.props.difficulty[0] === 'Hard') {
      posDifficulty = [3, 7];
    } else if (this.props.difficulty[0] === 'Easy') {
      posDifficulty = [0, 2.5];
    } else if (this.props.difficulty[0] === 'Expert') {
      posDifficulty = [5, 10];
    }
    let posX =
      Math.floor(Math.random() * 6) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posY =
      Math.floor(Math.random() * 4) *
      (Math.floor(Math.random() * 2) === 1 ? -1 : 1);
    let posZ = Math.floor(
      Math.random() * posDifficulty[0] * -1 - posDifficulty[1]
    );
    let randomPosition = [posX, posY, posZ];
    this.setState((prevState) => ({
      ...this.state,
      update: !prevState.update,
    }));
    return (
      <Target
        key={num}
        num={num}
        scene={this.state.scene}
        randomPosition={randomPosition}
      />
    );
  }

  renderBullet(velocity) {
    return (
      <Bullet
        key={this.bullets.length}
        velocity={velocity}
        callback={this.hitTarget}
      />
    );
  }

  fire({ position, rotation, forward }) {
    if (!this.props.isReloading) {
      if (this.props.clip === 0 && this.state.canReload) {
        this.setState({ canReload: false });
        setTimeout(() => {
          this.reload();
        }, 500);
      } else if (
        this.props.firing &&
        this.props.clip > 0 &&
        !this.state.isReloading &&
        this.props.selected.type === 'burst'
      ) {
        const velocity = forward.map((vector) => 20 * vector);
        this.setState({
          ...this.state,
          currentAnim: 'BRRecoil',
        });
        if (!this.props.burst) {
          this.props.gameStarted && this.props.setClip(this.props.clip - 1);
          this.props.setCanShoot(false);
          this.props.setFiring(false);
          this.props.setBurst(true);
          Vibration.vibrate(10);

          this.bullets.push(this.renderBullet(velocity));
          this.loopShotSounds();
          setTimeout(() => {
            Vibration.vibrate(10);
            this.props.setFiring(true);
          }, 100);
          setTimeout(() => {
            Vibration.vibrate(10);
            this.props.setFiring(true);
          }, 200);
          setTimeout(() => {
            this.props.setCanShoot(true);
            this.props.setBurst(false);
            !this.state.isReloading &&
              this.setState({
                ...this.state,
                currentAnim: '',
              });
          }, this.props.selected.timeout);
        } else if (this.props.firing) {
          this.props.gameStarted && this.props.setClip(this.props.clip - 1);
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
        Vibration.vibrate(10);
        this.props.selected.name === 'handgun' &&
          this.setState({
            ...this.state,
            currentAnim: 'recoil',
          });

        if (this.props.selected.name === 'Ak') {
          this.setState({
            ...this.state,
            currentAnim: 'AkRecoil',
          });
        }
        this.loopShotSounds();
        this.props.gameStarted && this.props.setClip(this.props.clip - 1);
        this.props.setCanShoot(false);
        this.props.setFiring(false);
        this.bullets.push(this.renderBullet(velocity));
        !this.state.isReloading &&
          setTimeout(() => {
            !this.state.isReloading &&
              this.setState({
                ...this.state,
                currentAnim: '',
              });
            this.props.setCanShoot(true);
          }, this.props.selected.timeout + 50);
      }
    }
  }

  loopShotSounds() {
    const newshotSoundArr = this.state.shotSound;
    newshotSoundArr[this.state.shotSoundIndex] = true;
    const newIndex = this.state.shotSoundIndex + 1;
    this.setState({
      shotSoundIndex: newIndex,
      shotSound: newshotSoundArr,
    });
  }

  reload() {
    this.props.setReloading(true);
    this.props.setCanShoot(false);
    this.props.selected.name === 'handgun' &&
      this.setState({
        isReloading: true,
        currentAnim: 'reload',
      });
    this.props.selected.name === 'HaloBR' &&
      this.setState({
        isReloading: true,
        currentAnim: 'BRReload',
      });
    this.props.selected.name === 'Ak' &&
      this.setState({
        isReloading: true,
        currentAnim: 'AkReload',
      });
    this.resetShotSound();
    this.props.setFiring(false);
    setTimeout(() => {
      this.setState({
        reloadSound: true,
        magAnim: 'mag',
      });
    }, 250);
    setTimeout(() => {
      this.props.setReloading(false);
      this.setState({
        isReloading: false,
        magAnim: '',
        currentAnim: '',
        canReload: true,
      });
      this.targetExplosion = [];
      this.props.setFiring(false);
      this.props.setClip(this.props.selected.clip);
      this.props.setCanShoot(true);
    }, 2500);
  }

  stopReloadSound() {
    this.setState({ reloadSound: false });
  }

  resetShotSound() {
    const arr = [];
    for (let i = 0; i < 30; i++) {
      arr.push(false);
    }
    this.setState({
      shotSound: arr,
      shotSoundIndex: 0,
    });
  }

  stopExplosionSound() {
    this.setState({ explosionSound: false });
  }

  stopSong() {
    this.pickRandomSong();
  }

  pickRandomSong() {
    const random = Math.floor(Math.random() * 7);
    const newSongs = [false, false, false, false, false, false, false];
    newSongs[random] = true;
    this.setState({ songs: newSongs });
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
        {this.state.shotSound.map((map, idx) => {
          return (
            <ViroSound
              key={idx}
              source={this.props.selected.soundSource}
              loop={false}
              paused={!this.state.shotSound[idx]}
              volume={0.6}
            />
          );
        })}
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
          loop={this.state.songs[0]}
          paused={!this.state.songs[0]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song2.m4a')}
          loop={this.state.songs[1]}
          paused={!this.state.songs[1]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song3.m4a')}
          loop={this.state.songs[2]}
          paused={!this.state.songs[2]}
          volume={0.25}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song4.mp3')}
          loop={this.state.songs[3]}
          paused={!this.state.songs[3]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song5.mp3')}
          loop={this.state.songs[4]}
          paused={!this.state.songs[4]}
          volume={0.35}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song6.mp3')}
          loop={this.state.songs[5]}
          paused={!this.state.songs[5]}
          volume={0.2}
          onFinish={this.stopSong}
        />
        <ViroSound
          source={require('./audio/song7.mp3')}
          loop={this.state.songs[6]}
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
        <ViroAmbientLight color="#ffffff" intensity={500} />
        {/* <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -0.1, -0.1]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
        /> */}
        {this.targetExplosion}
        <ViroARCamera>
          <ViroNode>
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

            {/* Gun Model */}
            <Viro3DObject
              source={this.props.selected.source}
              type="VRX"
              scale={this.props.selected.scale}
              position={this.props.selected.position}
              rotation={this.props.selected.rotation}
              animation={{
                name: this.state.currentAnim,
                run: true,
                interruptible: true,
              }}
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
            <ViroText
              text="Shoot to Select Difficulty:"
              position={[0.1, 2.4, -10]}
              width={3}
              height={2}
              style={{
                fontSize: 40,
                textAlign: 'center',
                fontWeight: '900',
              }}
              transformBehaviors={['billboard']}
            />
            <ViroSphere
              position={[0.05, 2.7, -15]}
              radius={3}
              materials={['black']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
            />
            <ViroSphere
              position={[0, 0, -5]}
              radius={0.55}
              materials={[this.props.difficulty[1]]}
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
            <ViroSphere
              position={[-1.2, 1.3, -10]}
              radius={0.3}
              materials={['greenMetal']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              transformBehaviors={['billboard']}
              onCollision={() =>
                this.props.setDifficulty(['Easy', 'greenMetal'])
              }
            />
            <ViroSphere
              position={[-0.4, 1.75, -10]}
              radius={0.3}
              materials={['gold']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              transformBehaviors={['billboard']}
              onCollision={() => this.props.setDifficulty(['Normal', 'gold'])}
            />
            <ViroSphere
              position={[0.4, 1.75, -10]}
              radius={0.3}
              materials={['redMetal']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              transformBehaviors={['billboard']}
              onCollision={() => this.props.setDifficulty(['Hard', 'redMetal'])}
            />
            <ViroSphere
              position={[1.2, 1.3, -10]}
              radius={0.3}
              materials={['diamondPlate']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              transformBehaviors={['billboard']}
              onCollision={() =>
                this.props.setDifficulty(['Expert', 'diamondPlate'])
              }
            />
            <Viro3DObject
              source={handgun}
              type="VRX"
              position={[-1.4, 0, -5]}
              scale={[0.0013, 0.0013, 0.0013]}
              rotation={[180, 180, 180]}
            />
            <ViroBox
              height={0.9}
              width={1}
              position={[-1.7, 0, -6]}
              transformBehaviors={['billboard']}
              materials={['shiny']}
              physicsBody={{
                type: 'Static',
                mass: 0,
                useGravity: false,
                velocity: [0, 0, 0],
              }}
              onCollision={() => {
                this.resetShotSound();
                this.props.selectGun('handgun');
                selected = guns['handgun'];
                this.props.setClip(selected.clip);
                this.setState({
                  currentAnim: '',
                });
              }}
            />
            {this.props.unlocked['Ak'] ? (
              <>
                <Viro3DObject
                  source={Ak}
                  type="VRX"
                  position={[2, 0, -5]}
                  scale={[0.01, 0.01, 0.01]}
                  rotation={[180, 280, 180]}
                />
                <ViroBox
                  height={0.9}
                  width={1.8}
                  position={[2.15, 0, -6]}
                  transformBehaviors={['billboard']}
                  materials={['shiny']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  onCollision={() => {
                    this.resetShotSound();
                    this.props.selectGun('Ak');
                    selected = guns['Ak'];
                    this.props.setClip(selected.clip);
                    this.setState({
                      currentAnim: '',
                    });
                  }}
                />
              </>
            ) : (
              <>
                <ViroText
                  text="Score 25 To Unlock AK"
                  position={[2.8, -0.5, -10]}
                  width={3}
                  height={2}
                  style={{
                    fontSize: 40,
                    textAlign: 'center',
                    fontWeight: '900',
                  }}
                  transformBehaviors={['billboard']}
                  viroTag={'Start'}
                  onCollision={this.startGame}
                />
                <ViroSphere
                  position={[-1.2, 1.3, -10]}
                  radius={0.3}
                  materials={['greenMetal']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  transformBehaviors={['billboard']}
                  onCollision={() =>
                    this.props.setDifficulty(['Easy', 'greenMetal'])
                  }
                />
                <ViroSphere
                  position={[-0.4, 1.7, -10]}
                  radius={0.3}
                  materials={['gold']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  transformBehaviors={['billboard']}
                  onCollision={() =>
                    this.props.setDifficulty(['Normal', 'gold'])
                  }
                />
                <ViroSphere
                  position={[0.4, 1.7, -10]}
                  radius={0.3}
                  materials={['redMetal']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  transformBehaviors={['billboard']}
                  onCollision={() =>
                    this.props.setDifficulty(['Hard', 'redMetal'])
                  }
                />
                <ViroSphere
                  position={[1.2, 1.3, -10]}
                  radius={0.3}
                  materials={['diamondPlate']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  transformBehaviors={['billboard']}
                  onCollision={() =>
                    this.props.setDifficulty(['Expert', 'diamondPlate'])
                  }
                />
                <Viro3DObject
                  source={handgun}
                  type="VRX"
                  position={[-1.4, 0, -5]}
                  scale={[0.0013, 0.0013, 0.0013]}
                  rotation={[180, 180, 180]}
                />
                <ViroBox
                  height={0.9}
                  width={1}
                  position={[-1.7, 0, -6]}
                  transformBehaviors={['billboard']}
                  materials={['shiny']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  onCollision={() => {
                    this.props.selectGun('handgun');
                    selected = guns['handgun'];
                    this.props.setClip(selected.clip);
                    this.setState({
                      currentAnim: '',
                    });
                  }}
                />
              </>
            )}
            {this.props.unlocked['Ak'] ? (
              <>
                <Viro3DObject
                  source={Ak}
                  type="VRX"
                  position={[2, 0, -5]}
                  scale={[0.01, 0.01, 0.01]}
                  rotation={[180, 280, 180]}
                />
                <ViroBox
                  height={0.9}
                  width={1.8}
                  position={[2.15, 0, -6]}
                  transformBehaviors={['billboard']}
                  materials={['shiny']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  onCollision={() => {
                    this.props.selectGun('Ak');
                    selected = guns['Ak'];
                    this.props.setClip(selected.clip);
                    this.setState({
                      currentAnim: '',
                    });
                  }}
                />
              </>
            ) : (
              <ViroText
                text="Score 25 To Unlock AK"
                position={[2.8, -0.5, -10]}
                width={3}
                height={2}
                style={{
                  fontSize: 40,
                  textAlign: 'center',
                  fontWeight: '900',
                }}
                transformBehaviors={['billboard']}
              />
            )}
            {this.props.unlocked['HaloBR'] ? (
              <>
                <Viro3DObject
                  source={HaloBR}
                  type="VRX"
                  position={[0, -1.3, -5]}
                  scale={[0.0042, 0.0042, 0.0042]}
                  rotation={[0, -90, 0]}
                />
                <ViroBox
                  height={0.9}
                  width={2.5}
                  position={[0, -1.57, -6]}
                  transformBehaviors={['billboard']}
                  materials={['gold']}
                  physicsBody={{
                    type: 'Static',
                    mass: 0,
                    useGravity: false,
                    velocity: [0, 0, 0],
                  }}
                  onCollision={() => {
                    this.resetShotSound();
                    this.props.selectGun('HaloBR');
                    selected = guns['HaloBR'];
                    this.props.setClip(selected.clip);
                    this.setState({
                      currentAnim: '',
                    });
                  }}
                />
              </>
            ) : (
              <ViroText
                text="Score 35 To Unlock BR"
                position={[0, -2.5, -10]}
                width={3}
                height={2}
                style={{
                  fontSize: 40,
                  textAlign: 'center',
                  fontWeight: '900',
                }}
                transformBehaviors={['billboard']}
              />
            )}
          </>
        )}
      </ViroARScene>
    );
  }
}

animations(selected.position[0], selected.position[1], selected.position[2]);

textures();

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
  unlocked: state.unlocked,
  difficulty: state.difficulty,
  isReloading: state.isReloading,
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
  unlockGun: (gun) => dispatch(unlockGun(gun)),
  setDifficulty: (difficulty) => dispatch(setDifficulty(difficulty)),
  setReloading: (reloading) => dispatch(setReloading(reloading)),
});

module.exports = connect(mapState, mapDispatch)(ShootingRange);
