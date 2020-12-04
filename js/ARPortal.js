'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroSceneNavigator,
  ViroScene,
  ViroCamera,
  ViroARSceneNavigator,
  ViroARScene,
  ViroAmbientLight,
  Viro360Video,
  Viro360Image,
  ViroUtils,
  ViroPortal,
  ViroPortalScene,
  Viro3DObject,
} from 'react-viro';

// var createReactClass = require('create-react-class');
var ShootingRange = require('./HelloWorldSceneAR');
class ARPortal extends Component{
  constructor (props){
    super(props)
    this.state = {
      isLoading: true
    }
    this._onEnterPortal = this._onEnterPortal.bind(this)
  }
  _onEnterPortal(){
      this.props.arSceneNavigator.jump('shootingRange', { scene: ShootingRange });
  }
  render (){
    return (
      <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200}/>
        <ViroPortalScene 
        position={[0, -.1, -1.4]}
        passable={true} 
        dragType="FixedDistance" 
        onDrag={()=>{}}
        onPortalEnter={() =>{
         this._onEnterPortal();
       }}
        >
          <ViroPortal position={[0, -.1, -1.4]} scale={[.8, 1, .8]}>
            <Viro3DObject source={require('./res/portals/portal_wood_frame.vrx')}
              resources={[require('./res/portals/portal_wood_frame_diffuse.png'),
                          require('./res/portals/portal_wood_frame_normal.png'),
                          require('./res/portals/portal_wood_frame_specular.png')]}
              type="VRX"/>
          </ViroPortal>
          <Viro360Image source={require("./res/building.jpg")} />
        </ViroPortalScene>
      </ViroARScene>
    )
}
}

module.exports = ARPortal;
