import { createStore } from 'redux';

let defaultState = {
  // hasARInitialized: false,
  text: 'Initializing AR...',
  firing: false,
  // bulletPosition: [0.02, -0.06, -0.15],
  hits: 0,
  // shotSound: false,
  // explosionSound: false,
  // update: true,
  canShoot: true,
  // currentAnim: '',
  // songs: [false, false, false, false, false, false, false],
  // battlefield: [false, false],
  gameStarted: false,
  score: 0,
  clip: 8,
  timer: 60,
  selected: {
    source: 'handgun',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 1000,
    clip: 12,
    scale: [0.0003, 0.0003, 0.0003],
    position: [0.02, -0.1, -0.2],
    rotation: [0, 90, 355],
    animation: '',
  },
};

const guns = {
  handgun: {
    source: 'handgun',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 1000,
    clip: 12,
    scale: [0.0003, 0.0003, 0.0003],
    position: [0.02, -0.1, -0.2],
    rotation: [0, 90, 355],
    animation: '',
  },
  Ak: {
    source: 'Ak',
    bulletStart: [0.02, -0.06, -0.15],
    recoilAnim: '',
    reloadAnim: '',
    timeout: 50,
    clip: 30,
    scale: [0.0016, 0.0016, 0.0016],
    position: [0.021, -0.075, -0.125],
    rotation: [353, 185, 350],
    anim: '',
  },
};

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
    default:
      return state;
  }
}

export default createStore(gameReducer);
