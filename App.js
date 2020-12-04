import React, { Component } from 'react';

import { Provider } from 'react-redux';

import store from './js/store';

import Menu from './Root';

export default class ViroSample extends Component {
  render() {
    return (
      <Provider store={store}>
        <Menu />
      </Provider>
    );
  }
}
