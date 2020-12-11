import React, { Component } from 'react';

import { Provider } from 'react-redux';

import { YellowBox } from 'react-native';

import store from './js/store';

import Menu from './Root';

YellowBox.ignoreWarnings(['Warning: Failed prop type']);

export default class ShootAR extends Component {
  render() {
    return (
      <Provider store={store}>
        <Menu />
      </Provider>
    );
  }
}
