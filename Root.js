/**
 * Copyright (c) 2017-present, Viro, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  StyleSheet,
  PixelRatio,
  TouchableHighlight,
  Button,
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
  Image,
} from 'react-native';

import { ViroVRSceneNavigator, ViroARSceneNavigator } from 'react-viro';

import { connect } from 'react-redux';

import { setFiring, setText } from './js/store';

/*
TODO: Insert your API key below
*/
var sharedProps = {
  apiKey: 'API_KEY_HERE',
};

// Sets the default scene you want for AR and VR
// var InitialARScene = require('./js/ARPortal');
var InitialARScene = require('./js/HelloWorldSceneAR');

var UNSET = 'UNSET';
var VR_NAVIGATOR_TYPE = 'VR';
var AR_NAVIGATOR_TYPE = 'AR';

// This determines which type of experience to launch in, or UNSET, if the user should
// be presented with a choice of AR or VR. By default, we offer the user a choice.
var defaultNavigatorType = UNSET;

class Menu extends Component {
  constructor() {
    super();

    this.state = {
      navigatorType: defaultNavigatorType,
      sharedProps: sharedProps,
    };
    this._getExperienceSelector = this._getExperienceSelector.bind(this);
    this._getARNavigator = this._getARNavigator.bind(this);
    this._getVRNavigator = this._getVRNavigator.bind(this);
    this._getExperienceButtonOnPress = this._getExperienceButtonOnPress.bind(
      this
    );
    this._exitViro = this._exitViro.bind(this);
  }

  // Replace this function with the contents of _getVRNavigator() or _getARNavigator()
  // if you are building a specific type of experience.
  render() {
    if (this.state.navigatorType == UNSET) {
      return this._getExperienceSelector();
    } else if (this.state.navigatorType == VR_NAVIGATOR_TYPE) {
      return this._getVRNavigator();
    } else if (this.state.navigatorType == AR_NAVIGATOR_TYPE) {
      return this._getARNavigator();
    }
  }

  // Presents the user with a choice of an AR or VR experience
  _getExperienceSelector() {
    return (
      <View style={localStyles.outer}>
        <View style={localStyles.inner}>
          {/* <Text style={localStyles.titleText}>WELCOME TO SHOOTAR!</Text> */}
          <Image source={require('./js/res/ShootAR.png')} />
          <TouchableHighlight
            style={localStyles.buttons}
            onPress={this._getExperienceButtonOnPress(AR_NAVIGATOR_TYPE)}
            underlayColor={'#68a0ff'}
          >
            <Text style={localStyles.buttonText}>Go Shoot</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  // Returns the ViroARSceneNavigator which will start the AR experience
  _getARNavigator() {
    return (
      <>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            zIndex: 100000,
            top: 80,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 100,
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              position: 'absolute',
              zIndex: 10,
              textAlign: 'center',
              padding: 10,
              width: '80%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderWidth: 2,
              borderColor: 'white',
              borderRadius: 10,
            }}
          >
            {this.props.insideShootingRange ? (
              this.props.gameStarted ? (
                <>
                  <Text
                    style={{
                      textAlign: 'center',
                      margin: 'auto',
                      width: '33%',
                      color: 'white',
                    }}
                  >
                    {`Hits: ${this.props.hits}`}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                      margin: 'auto',
                      width: '33%',
                      color: 'white',
                    }}
                  >
                    Clip: {this.props.clip.toString()}
                  </Text>
                  {this.props.timer > 10 ? (
                    <Text
                      style={{
                        textAlign: 'center',
                        margin: 'auto',
                        width: '33%',
                        color: 'white',
                      }}
                    >
                      Time:{' '}
                      {`${parseInt(this.props.timer / 60).toString()}:${
                        this.props.timer -
                          60 * parseInt(this.props.timer / 60) <
                        10
                          ? '0' +
                            (
                              this.props.timer -
                              60 * parseInt(this.props.timer / 60)
                            ).toString()
                          : (
                              this.props.timer -
                              60 * parseInt(this.props.timer / 60)
                            ).toString()
                      }`}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        textAlign: 'center',
                        margin: 'auto',
                        width: '33%',
                        color: 'red',
                      }}
                    >
                      Time:{' '}
                      {`${parseInt(this.props.timer / 60).toString()}:${
                        this.props.timer -
                          60 * parseInt(this.props.timer / 60) <
                        10
                          ? '0' +
                            (
                              this.props.timer -
                              60 * parseInt(this.props.timer / 60)
                            ).toString()
                          : (
                              this.props.timer -
                              60 * parseInt(this.props.timer / 60)
                            ).toString()
                      }`}
                    </Text>
                  )}
                </>
              ) : (
                <Text
                  style={{
                    textAlign: 'center',
                    margin: 'auto',
                    width: '100%',
                    color: 'white',
                  }}
                >
                  {`Shoot Center Target to Start!\nDifficulty: ${this.props.difficulty[0]}\nScore: ${this.props.score}`}
                </Text>
              )
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  margin: 'auto',
                  width: '100%',
                  color: 'white',
                }}
              >
                {'Enter the portal'}
              </Text>
            )}
          </View>
        </View>
        {Platform.OS === 'ios' && (
          <View
            style={{
              top: '80%',
              position: 'absolute',
              zIndex: 1000,
              elevation: 1000,
              width: '100%',
            }}
          >
            {this.props.insideShootingRange ? (
              <TouchableHighlight
                style={{
                  height: 80,
                  backgroundColor: 'red',
                  width: 80,
                  borderRadius: 40,
                  elevation: 100000,
                  borderColor: 'white',
                  borderWidth: 2,
                  left: '40%',
                }}
                underlayColor={'gray'}
                onPress={() => {
                  if (this.props.canShoot) {
                    this.props.setFiring(true);
                  }
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    alignSelf: 'center',
                    paddingTop: '37%',
                    margin: 0,
                  }}
                >
                  Shoot
                </Text>
              </TouchableHighlight>
            ) : null}
          </View>
        )}
        <ViroARSceneNavigator
          style={{ position: 'relative' }}
          {...this.state.sharedProps}
          initialScene={{ scene: InitialARScene }}
        />
      </>
    );
  }

  // Returns the ViroSceneNavigator which will start the VR experience
  _getVRNavigator() {
    return (
      <ViroVRSceneNavigator
        {...this.state.sharedProps}
        initialScene={{ scene: InitialVRScene }}
        onExitViro={this._exitViro}
      />
    );
  }

  // This function returns an anonymous/lambda function to be used
  // by the experience selector buttons
  _getExperienceButtonOnPress(navigatorType) {
    return () => {
      this.setState({
        navigatorType: navigatorType,
      });
    };
  }

  // This function "exits" Viro by setting the navigatorType to UNSET.
  _exitViro() {
    this.setState({
      navigatorType: UNSET,
    });
  }
}

var localStyles = StyleSheet.create({
  viroContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  outer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  inner: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  titleText: {
    paddingTop: 30,
    paddingBottom: 20,
    color: '#fff',
    textAlign: 'center',
    fontSize: 25,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '900',
  },
  buttons: {
    height: 80,
    width: 150,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  exitButton: {
    height: 50,
    width: 100,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#68a0cf',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
});

const mapDispatch = (dispatch) => ({
  setFiring: (firing) => dispatch(setFiring(firing)),
  setText: (text) => dispatch(setText(text)),
});

const mapState = (state) => ({
  insideShootingRange: state.insideShootingRange,
  text: state.text,
  firing: state.firing,
  hits: state.hits,
  canShoot: state.canShoot,
  gameStarted: state.gameStarted,
  score: state.score,
  clip: state.clip,
  timer: state.timer,
  burst: state.burst,
  difficulty: state.difficulty,
});

module.exports = connect(mapState, mapDispatch)(Menu);
