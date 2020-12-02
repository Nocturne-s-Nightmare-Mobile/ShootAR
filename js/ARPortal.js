'use strict';

import React, { Component } from 'react';

import {StyleSheet} from 'react-native';

import {
  ViroSceneNavigator,
  ViroScene,
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
    this._onEnterPortal = this._onEnterPortal.bind(this)
  }
  _onEnterPortal(){
      //  <ViroARSceneNavigator 
      //   initialScene={{scene: ShootingRange}} /> 
      //this.props.sceneNavigator.jump(scene: ShootingRange)
      this.props.arSceneNavigator.jump('shootingRange', { scene: ShootingRange });
  }
  render (){
    return (
      <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200}/>
        <ViroPortalScene 
        position={[0, 0, 0]}
        passable={true} 
       // dragType="FixedDistance" 
      // onDrag={()=>{}}
        onPortalEnter={() =>{
         this._onEnterPortal();
       }}
        >
          <ViroPortal position={[0, 0, 0]} scale={[.5, .5, .5]}>
            <Viro3DObject source={require('./res/portals/portal_wood_frame.vrx')}
              resources={[require('./res/portals/portal_wood_frame_diffuse.png'),
                          require('./res/portals/portal_wood_frame_normal.png'),
                          require('./res/portals/portal_wood_frame_specular.png')]}
              type="VRX"/>
          </ViroPortal>
          <Viro360Image source={require("./res/guadalupe_360.jpg")} />
          {/* <ViroARSceneNavigator 
        initialScene={{scene: ShootingRange}} /> */}
          {/* // <ViroARScene source={ShootingRange} /> */}
        </ViroPortalScene>
      </ViroARScene>
    )
}
}
//  ARPortal = createReactClass({

//   render: function() {
//     return (
//       <ViroARScene>
//       <ViroAmbientLight color="#ffffff" intensity={200}/>
//         <ViroPortalScene passable={true} 
//         dragType="FixedDistance" 
//         onDrag={()=>{}}
//         onPortalEnter={() =>{
//          this._onEnterPortal();
//        }}
//         >
//           <ViroPortal position={[0, 1, 0]} scale={[.5, .5, .5]}>
//             <Viro3DObject source={require('./res/portals/portal_wood_frame.vrx')}
//               resources={[require('./res/portals/portal_wood_frame_diffuse.png'),
//                           require('./res/portals/portal_wood_frame_normal.png'),
//                           require('./res/portals/portal_wood_frame_specular.png')]}
//               type="VRX"/>
//           </ViroPortal>
//           {/* <Viro360Image source={require("./res/guadalupe_360.jpg")} /> */}
//           <ViroARSceneNavigator 
//         initialScene={{scene: ShootingRange}} />
//           {/* // <ViroARScene source={ShootingRange} /> */}
//         </ViroPortalScene>
//       </ViroARScene>
//     );var
//   },
// });

module.exports = ARPortal;