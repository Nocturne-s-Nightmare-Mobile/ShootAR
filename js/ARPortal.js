'use strict';

import React, { Component } from 'react';

import {
  ViroSpinner,
  ViroARScene,
  ViroAmbientLight,
  Viro360Image,
  ViroPortal,
  ViroPortalScene,
  Viro3DObject,
  ViroConstants
} from 'react-viro';

var ShootingRange = require('./HelloWorldSceneAR');
class ARPortal extends Component{
  constructor (props){
    super(props)
    this.state = {
      text : "Initializing AR...", 
      elementToRender: <ViroSpinner  position={[0, 0, -2]}/>
    }
    this._onEnterPortal = this._onEnterPortal.bind(this)
    this._onInitialized = this._onInitialized.bind(this)
  }
  
  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        elementToRender:
         <ViroPortalScene 
              position={[0, -.1, -1.4]}
              passable={true} 
              dragType="FixedDistance" 
              onDrag={()=>{}}
              onPortalEnter={() =>{
                    this._onEnterPortal()
                }}>
         <ViroPortal position={[0, -.1, -1.4]} scale={[.8, 1, .8]}>
           <Viro3DObject source={require('./res/portals/portal_wood_frame.vrx')}
               resources={[require('./res/portals/portal_wood_frame_diffuse.png'),
                         require('./res/portals/portal_wood_frame_normal.png'),
                         require('./res/portals/portal_wood_frame_specular.png')]}
             type="VRX"/>
         </ViroPortal>
         <Viro360Image source={require("./res/building.jpg")} />
       </ViroPortalScene> 
      });
    } 
  }

  _onEnterPortal(){
      this.props.arSceneNavigator.jump('shootingRange', { scene: ShootingRange });
  }

  render (){
    return (
      <ViroARScene onTrackingUpdated={this._onInitialized}>
            {this.state.elementToRender}   
        <ViroAmbientLight color="#ffffff" intensity={200}/>
 </ViroARScene> ) }}

module.exports = ARPortal;




      