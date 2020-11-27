// "use strict";

// import React, { Component } from "react";

// import {
//   ViroNode,
//   ViroCamera,
//   ViroARScene,
//   Viro3DObject,
//   ViroConstants,
//   ViroMaterials,
//   ViroAnimations,
//   ViroAmbientLight,
//   ViroQuad
// } from "react-viro";

// class BowGame extends Component
// {
//   constructor(props)
//   {
//     super(props);

//     this.state = {
//       getCamPos: true,
//       hasARInitialized: false,
//       text: "Wait a moment...",
//       gravity: true,
//       velocity: [0,0,0],
//       arrowStartPos:[0, 0, .2],
//     };
//     this.bowRef = React.createRef();
//     this.firstArrow = React.createRef();

//     this.trackingUpdated = this.trackingUpdated.bind(this);
//     this.cameraTransformUpdate = this.cameraTransformUpdate.bind(this);
//     this.onTargetClicked = this.onTargetClicked.bind(this);
//   }

//   trackingUpdated(state, reason)
//   {
//     // Condition required by viro-react to let package to track AR objects
//     if ( !this.state.hasARInitialized &&
//       state == ViroConstants.TRACKING_NORMAL
//     ) {
//       this.setState({ hasARInitialized: true, text: "Find the target" }, () => {
//         this.interval3 = setTimeout(() => {
//           this.setState({ text: "" });
//         }, 1000);
//       });
//       this.props.hasArBeenInitialized(true);
//     } else if (state == ViroConstants.TRACKING_NONE) {
//     }
//   }
//   bowarrowAnimationHelper = () => {
//     if (!this.loadedArrow && this.shootedArrow) {
//       this.loadedArrow = true;
//       this.shootedArrow = false;
//       this.firstArrow.current.setNativeProps({
//         animation: {
//           name: "LoadArrow",
//           run: true,
//           loop: false,
//           duration: 150,
//         },
//       });
//       this.bowRef.current.setNativeProps({
//         animation: {
//           name: "Bow|BowDraw",
//           run: true,
//           loop: false,
//           duration: 200,
//         },
//       });
//     } else if (this.loadedArrow && !this.shootedArrow) {
//       this.loadedArrow = false;
//       this.shootedArrow = true;

//       this.setState({lockCamera: true, hide: true});
//         this.bowRef.current.setNativeProps({
//           animation: {
//             name: "Bow|BowShoot",
//             run: true,
//             loop: false,
//             duration: 200,
//           },
//         });
//         this.setState({velocity: [this.state.arrowStartPos[0],this.state.arrowStartPos[1],this.state.arrowStartPos[2]*-30], torque:[0,0,-5], gravity: true})

//         let interval = setTimeout(() => {
//           this.setState({gravity: false});
//           this.firstArrow.current.setNativeProps({ position: this.state.arrowStartPos, rotation: [0,85,90]});
//         }, 1100);
//     }
//   };

//   onCollide = (collidedTag, collidedPoint, collidedNormal) =>
//   {
//     this.setState({gravity: false})
//   }

//   onCollideWithTarget = (collidedTag, collidedPoint, collidedNormal) =>
//   {
//     this.setState({gravity: false})
//   }
//   render()
//   {
//     return (
//       <ViroARScene
//         onTrackingUpdated={this.trackingUpdated}
//         onCameraTransformUpdate={this.cameraTransformUpdate}
//       >
//         <ViroAmbientLight color={"#ffffff"} intensity={200} />

//         {this.state.hasARInitialized &&
//         this.props.gameState === GAME_STARTED &&
//         !this.props.sceneNavigator.viroAppProps.isGamePaused ? (
//           <Viro3DObject
//             type="VRX"
//             rotation={[0, 70, 0]}
//             scale={[0.001, 0.001, 0.001]}
//             source={require("../../js/target.vrx")}
//             materials={"targetTexture"}
//             physicsBody={{ type: "Static", restitution: 0.75 }}
//             onCollision={this.onCollideWithTarget}
//             position={this.props.sceneNavigator.viroAppProps.randPos}
//           />
//         ) : null}

//           <ViroCamera active={true}>
//             <ViroNode position={[0, -0.3, -1]}>
//               <Viro3DObject
//                 type="VRX"
//                 ref={this.bowRef}
//                 position={[0, 0, 0]}
//                 rotation={[0, 75, 90]}
//                 scale={[0.15, 0.15, 0.2]}
//                 materials={"bowArrowTexture"}
//                 onClick={this.bowarrowAnimationHelper}
//                 source={require("../../js/bow_preconvert.vrx")}
//                 physicsBody={{ type: "Static" }}
//                 onCollision={this.onCollide}
//               />

//               <Viro3DObject
//                 type="VRX"
//                 viroTag="Arrow"
//                 ref={this.firstArrow}
//                 rotation={[0, 85, 90]}
//                 position={this.state.arrowStartPos}
//                 materials={"bowArrowTexture"}
//                 scale={[0.0009, 0.0005, 0.0005]}
//                 source={require("../../js/arrow.vrx")}
//                 physicsBody={{
//                   type: "Dynamic",
//                   mass: 1,
//                   enabled: this.state.gravity,
//                   useGravity: this.state.gravity,
//                   velocity: this.state.velocity,
//                 }}
//               />
//             </ViroNode>
//           </ViroCamera>
//       </ViroARScene>
//     );
//   }
// }

// ViroMaterials.createMaterials({
//   targetTexture: {
//     diffuseTexture: require("../../js/target.png"),
//   },
//   bowArrowTexture: {
//     diffuseTexture: require("../../js/bowarrow.png"),
//   },
// });

// ViroAnimations.registerAnimations({
//   LoadArrow: {
//     properties: {
//       positionZ: "+=0.33",
//     },
//   }
// });
// export default BowGame;
