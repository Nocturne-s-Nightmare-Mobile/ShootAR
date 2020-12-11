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
        visible={true}
        run={true}
        loop={false}
        duration={300}
        fixedToEmitter={true}
        image={{
          source: require('./res/explosion.png'),
          height: 0.2,
          width: 0.11,
        }}
        spawnBehavior={{
          particleLifetime: [50, 100],
          emissionRatePerSecond: [25, 50],
          maxParticles: 10,
        }}
        particleAppearance={{
          opacity: {
            initialRange: [10, 10],
            factor: 'Time',
            interpolation: [
              { endValue: 0.5, interval: [0, 500] },
              { endValue: 1.0, interval: [0, 500] },
            ],
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
    // this.targetBoom(point);
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
        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroSpotLight
          innerAngle={5}
          outerAngle={90}
          direction={[0, -0.1, -0.1]}
          position={[0, 3, 1]}
          color="#ffffff"
          castsShadow={true}
        />
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

ViroAnimations.registerAnimations({
  recoilUp: {
    properties: {
      positionX: 0.02,
      positionY: -0.1 + 0.01,
      positionZ: -0.2 + 0.05,
    },
    easing: 'easeOut',
    duration: 150,
  },
  recoilDown: {
    properties: {
      positionX: 0.02,
      positionY: -0.1,
      positionZ: -0.2,
    },
    easing: 'easeIn',
    duration: 150,
  },
  recoil: [['recoilUp', 'recoilDown']],
});

ViroAnimations.registerAnimations({
  BRRecoilUp: {
    properties: {
      positionX: 0.02,
      positionY: -0.069 + 0.01,
      positionZ: -0.18 + 0.05,
    },
    easing: 'easeOut',
    duration: 150,
  },
  BRRecoilDown: {
    properties: {
      positionX: 0.02,
      positionY: -0.069,
      positionZ: -0.18,
    },
    easing: 'easeIn',
    duration: 150,
  },
  BRRecoil: [['BRRecoilUp', 'BRRecoilDown']],
});

ViroAnimations.registerAnimations({
  AkRecoilUp: {
    properties: {
      positionX: 0.021,
      positionY: -0.075 + 0.005,
      positionZ: -0.125 + 0.015,
    },
    easing: 'easeOut',
    duration: 25,
  },
  AkRecoilDown: {
    properties: {
      positionX: 0.021,
      positionY: -0.075,
      positionZ: -0.125,
    },
    easing: 'easeIn',
    duration: 25,
  },
  AkRecoil: [['AkRecoilUp', 'AkRecoilDown']],
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
    duration: 1900,
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

ViroAnimations.registerAnimations({
  BRReloadStart: {
    properties: {
      rotateX: 0,
      rotateY: 180,
      rotateZ: 265,
      positionX: 0.06,
      positionY: -0.047,
      positionZ: -0.23,
    },
    easing: 'easeOut',
    duration: 250,
  },
  BRReloadMiddle: {
    properties: {
      rotateX: 0,
      rotateY: 180,
      rotateZ: 265,
    },
    easing: 'easeOut',
    duration: 1900,
  },
  BRReloadEnd: {
    properties: {
      rotateX: 0,
      rotateY: 180,
      rotateZ: 355,
      positionX: 0.02,
      positionY: -0.069,
      positionZ: -0.18,
    },
    easing: 'easeIn',
    duration: 250,
  },
  BRReload: [['BRReloadStart', 'BRReloadMiddle', 'BRReloadEnd']],
});

ViroAnimations.registerAnimations({
  AkReloadStart: {
    properties: {
      rotateX: 353,
      rotateY: 185,
      rotateZ: 270,
      positionX: 0.021,
      positionY: -0.05,
      positionZ: -0.1,
    },
    easing: 'easeOut',
    duration: 250,
  },
  AkReloadMiddle: {
    properties: {
      rotateX: 353,
      rotateY: 185,
      rotateZ: 270,
    },
    easing: 'easeOut',
    duration: 1900,
  },
  AkReloadEnd: {
    properties: {
      rotateX: 353,
      rotateY: 185,
      rotateZ: 350,
      positionX: 0.021,
      positionY: -0.075,
      positionZ: -0.125,
    },
    easing: 'easeIn',
    duration: 250,
  },
  AkReload: [['AkReloadStart', 'AkReloadMiddle', 'AkReloadEnd']],
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
      positionX: -0.5,
      positionY: -0.045,
      positionZ: -0.11,
    },
    easing: 'easeOut',
    duration: 750,
  },
  magStartMiddle: {
    properties: {
      rotateX: 90,
      rotateY: 90,
      rotateZ: 0,
      positionX: -0.5,
      positionY: -0.045,
      positionZ: -0.11,
    },
    easing: 'easeOut',
    duration: 0,
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
    duration: 750,
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
