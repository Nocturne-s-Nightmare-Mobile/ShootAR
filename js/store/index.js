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
};

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
    default:
      return state;
  }
}

export default createStore(gameReducer);
