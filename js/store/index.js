import { createStore } from 'redux';
const handgun = require('../res/gun.vrx');
const Ak = require('../res/Ak.vrx');
const HaloBR = require('../res/HaloBR.vrx');
const handgunSound = require('../audio/pistolShot.mp3');
const akSound = require('../audio/akShot.mp3');
const brSound = require('../audio/BRShot.mp3');

let defaultState = {
  text: 'Initializing AR...',
  firing: false,
  hits: 0,
  canShoot: true,
  difficulty: ['Normal', 'gold'],
  burst: false,
  gameStarted: false,
  insideShootingRange: false,
  //Comment out false unlocked values and uncomment true ones below to unlock
  //guns without earning it.
  unlocked: {
    HaloBR: false,
    Ak: false,
  },
  //Uncomment below and comment above to unlock guns
  // unlocked: {
  //   HaloBR: true,
  //   Ak: true,
  // },
  score: 0,
  clip: 8,
  timer: 60,
  isReloading: false,
  selected: {
    name: 'handgun',
    source: handgun,
    type: 'semi',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 500,
    clip: 8,
    scale: [0.0003, 0.0003, 0.0003],
    position: [0.02, -0.1, -0.2],
    rotation: [0, 90, 355],
    animation: '',
    soundSource: handgunSound,
  },
};

export const guns = {
  handgun: {
    name: 'handgun',
    source: handgun,
    type: 'semi',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 500,
    clip: 8,
    scale: [0.0003, 0.0003, 0.0003],
    position: [0.02, -0.1, -0.2],
    rotation: [0, 90, 355],
    animation: '',
    soundSource: handgunSound,
  },
  Ak: {
    name: 'Ak',
    source: Ak,
    type: 'semi',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 70,
    clip: 30,
    scale: [0.0016, 0.0016, 0.0016],
    position: [0.021, -0.075, -0.125],
    rotation: [353, 185, 350],
    anim: '',
    soundSource: akSound,
  },
  HaloBR: {
    name: 'HaloBR',
    source: HaloBR,
    type: 'burst',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 1000,
    clip: 36,
    scale: [0.001, 0.001, 0.001],
    position: [0.02, -0.069, -0.18],
    rotation: [0, 180, 355],
    anim: '',
    soundSource: brSound,
  },
};

const SET_RELOADING = 'SET_RELOADING';
export const setReloading = (reloading) => ({
  type: SET_RELOADING,
  reloading,
});

const SET_DIFFICULTY = 'SET_DIFFICULTY';
export const setDifficulty = (difficulty) => ({
  type: SET_DIFFICULTY,
  difficulty,
});

const UNLOCK_GUN = 'UNLOCK_GUN';
export const unlockGun = (gun) => ({
  type: UNLOCK_GUN,
  gun,
});

const GET_INSIDE_SHOOTING_RANGE = 'GET_INSIDE_SHOOTING_RANGE';
export const getInsidePortal = (insideShootingRange) => ({
  type: GET_INSIDE_SHOOTING_RANGE,
  insideShootingRange,
});

const SET_BURST = 'SET_BURST';
export const setBurst = (burst) => ({
  type: SET_BURST,
  burst,
});

const SET_SELECTED = 'SET_SELECTED';
export const setSelected = (selected) => ({
  type: SET_SELECTED,
  selected,
});

const SET_FIRING = 'SET_FIRING';
export const setFiring = (firing) => ({
  type: SET_FIRING,
  firing,
});

const SET_CLIP = 'SET_CLIP';
export const setClip = (clip) => ({
  type: SET_CLIP,
  clip,
});

const SET_TEXT = 'SET_TEXT';
export const setText = (text) => ({
  type: SET_TEXT,
  text,
});

const SET_HITS = 'SET_HITS';
export const setHits = (hits) => ({
  type: SET_HITS,
  hits,
});

const SET_CAN_SHOOT = 'SET_CAN_SHOOT';
export const setCanShoot = (canShoot) => ({
  type: SET_CAN_SHOOT,
  canShoot,
});

const SET_GAME_STARTED = 'SET_GAME_STARTED';
export const startGame = (gameStarted) => ({
  type: SET_GAME_STARTED,
  gameStarted,
});

const SET_SCORE = 'SET_SCORE';
export const setScore = (score) => ({
  type: SET_SCORE,
  score,
});

const SET_TIMER = 'SET_TIMER';
export const setTimer = (timer) => ({
  type: SET_TIMER,
  timer,
});

function gameReducer(state = defaultState, action) {
  switch (action.type) {
    case GET_INSIDE_SHOOTING_RANGE:
      return { ...state, insideShootingRange: action.insideShootingRange };
    case SET_FIRING:
      return { ...state, firing: action.firing };
    case SET_TEXT:
      return { ...state, text: action.text };
    case SET_HITS:
      return { ...state, hits: action.hits };
    case SET_CAN_SHOOT:
      return { ...state, canShoot: action.canShoot };
    case SET_GAME_STARTED:
      return { ...state, gameStarted: action.gameStarted };
    case SET_SCORE:
      return { ...state, score: action.score };
    case SET_CLIP:
      return { ...state, clip: action.clip };
    case SET_TIMER:
      return { ...state, timer: action.timer };
    case SET_SELECTED:
      return { ...state, selected: guns[action.selected] };
    case SET_BURST:
      return { ...state, burst: action.burst };
    case UNLOCK_GUN:
      return { ...state, unlocked: { ...state.unlocked, [action.gun]: true } };
    case SET_DIFFICULTY:
      return { ...state, difficulty: action.difficulty };
    case SET_RELOADING:
      return { ...state, isReloading: action.reloading };
    default:
      return state;
  }
}

export default createStore(gameReducer);
