import React, { Component } from 'react';

import { Provider } from 'react-redux';

import { YellowBox } from 'react-native';

import store from './js/store';

import Menu from './Root';

YellowBox.ignoreWarnings(['Warning: Failed prop type']);

export default class ViroSample extends Component {
  render() {
    return (
      <Provider store={store}>
        <Menu />
      </Provider>
    );
  }
}

// {
//   handgun: {
//   source: './res/gun.vrx'
//   bulletStart: [0.02, -0.06, -0.15],
//   recoilAnim: '',
//   reloadAnim: '',
//   timeout: 1000,
//   scale: [0.0003, 0.0003, 0.0003],
//   position: [0.02, -0.1, -0.2],
//   rotation: [0, 90, 355],
//   animation: ''
//   },
//   Ak: {
//   source: '/res/Ak.vrx',
//     bulletStart: [0.02, -0.06, -0.15],
//     recoilAnim: '',
//     reloadAnim: '',
//     timeout: 50,
//     scale: [0.0016, 0.0016, 0.0016],
//     position: [0.021, -0.075, -0.125],
//     rotation: [353, 185, 350],
//     anim: ''
//   }
// }
