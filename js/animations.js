import { ViroAnimations } from "react-viro";

export default function (x, y, z) {
  ViroAnimations.registerAnimations({
    recoilUp: {
      properties: {
        positionX: 0.02,
        positionY: -0.1 + 0.01,
        positionZ: -0.2 + 0.05,
      },
      easing: "easeOut",
      duration: 150,
    },
    recoilDown: {
      properties: {
        positionX: 0.02,
        positionY: -0.1,
        positionZ: -0.2,
      },
      easing: "easeIn",
      duration: 150,
    },
    recoil: [["recoilUp", "recoilDown"]],
  });

  ViroAnimations.registerAnimations({
    BRRecoilUp: {
      properties: {
        positionX: 0.02,
        positionY: -0.069 + 0.01,
        positionZ: -0.18 + 0.05,
      },
      easing: "easeOut",
      duration: 150,
    },
    BRRecoilDown: {
      properties: {
        positionX: 0.02,
        positionY: -0.069,
        positionZ: -0.18,
      },
      easing: "easeIn",
      duration: 150,
    },
    BRRecoil: [["BRRecoilUp", "BRRecoilDown"]],
  });

  ViroAnimations.registerAnimations({
    AkRecoilUp: {
      properties: {
        positionX: 0.021,
        positionY: -0.075 + 0.005,
        positionZ: -0.125 + 0.015,
      },
      easing: "easeOut",
      duration: 25,
    },
    AkRecoilDown: {
      properties: {
        positionX: 0.021,
        positionY: -0.075,
        positionZ: -0.125,
      },
      easing: "easeIn",
      duration: 25,
    },
    AkRecoil: [["AkRecoilUp", "AkRecoilDown"]],
  });

  ViroAnimations.registerAnimations({
    setPlace: {
      properties: {
        positionX: x,
        positionY: y,
        positionZ: z,
      },
      duration: 50,
    },
  });

  ViroAnimations.registerAnimations({
    reloadStart: {
      properties: {
        rotateX: 0,
        rotateY: 90,
        rotateZ: 265,
        positionX: 0.06,
        positionY: -0.05,
        positionZ: -0.2,
      },
      easing: "easeOut",
      duration: 250,
    },
    reloadMiddle: {
      properties: { rotateX: 0, rotateY: 90, rotateZ: 265 },
      easing: "easeOut",
      duration: 1900,
    },
    reloadEnd: {
      properties: {
        rotateX: 0,
        rotateY: 90,
        rotateZ: 355,
        positionX: 0.02,
        positionY: -0.1,
        positionZ: -0.2,
      },
      easing: "easeIn",
      duration: 250,
    },
    reload: [["reloadStart", "reloadMiddle", "reloadEnd"]],
  });

  ViroAnimations.registerAnimations({
    BRReloadStart: {
      properties: {
        rotateX: 0,
        rotateY: 180,
        rotateZ: 265,
        positionX: 0.06,
        positionY: -0.047,
        positionZ: -0.23,
      },
      easing: "easeOut",
      duration: 250,
    },
    BRReloadMiddle: {
      properties: {
        rotateX: 0,
        rotateY: 180,
        rotateZ: 265,
      },
      easing: "easeOut",
      duration: 1900,
    },
    BRReloadEnd: {
      properties: {
        rotateX: 0,
        rotateY: 180,
        rotateZ: 355,
        positionX: 0.02,
        positionY: -0.069,
        positionZ: -0.18,
      },
      easing: "easeIn",
      duration: 250,
    },
    BRReload: [["BRReloadStart", "BRReloadMiddle", "BRReloadEnd"]],
  });

  ViroAnimations.registerAnimations({
    AkReloadStart: {
      properties: {
        rotateX: 353,
        rotateY: 185,
        rotateZ: 270,
        positionX: 0.021,
        positionY: -0.05,
        positionZ: -0.1,
      },
      easing: "easeOut",
      duration: 250,
    },
    AkReloadMiddle: {
      properties: {
        rotateX: 353,
        rotateY: 185,
        rotateZ: 270,
      },
      easing: "easeOut",
      duration: 1900,
    },
    AkReloadEnd: {
      properties: {
        rotateX: 353,
        rotateY: 185,
        rotateZ: 350,
        positionX: 0.021,
        positionY: -0.075,
        positionZ: -0.125,
      },
      easing: "easeIn",
      duration: 250,
    },
    AkReload: [["AkReloadStart", "AkReloadMiddle", "AkReloadEnd"]],
  });

  // Magazine Aminations for reload
  ViroAnimations.registerAnimations({
    magInitial: {
      properties: {
        rotateX: 90,
        rotateY: 90,
        rotateZ: 0,
        positionX: 0.055,
        positionY: -0.045,
        positionZ: -0.11,
      },
      duration: 0,
    },
    magStart: {
      properties: {
        rotateX: 90,
        rotateY: 90,
        rotateZ: 0,
        positionX: -0.5,
        positionY: -0.045,
        positionZ: -0.11,
      },
      easing: "easeOut",
      duration: 750,
    },
    magStartMiddle: {
      properties: {
        rotateX: 90,
        rotateY: 90,
        rotateZ: 0,
        positionX: -0.5,
        positionY: -0.045,
        positionZ: -0.11,
      },
      easing: "easeOut",
      duration: 0,
    },
    magEndMiddle: {
      properties: {
        rotateX: 90,
        rotateY: 90,
        rotateZ: 0,
        positionX: 0.055,
        positionY: -0.045,
        positionZ: -0.11,
      },
      easing: "easeout",
      duration: 750,
    },
    magEnd: {
      properties: {
        rotateX: 90,
        rotateY: 90,
        rotateZ: 0,
        positionX: -10,
        positionY: -0.045,
        positionZ: -0.11,
      },
      duration: 0,
    },

    mag: [
      ["magInitial", "magStart", "magStartMiddle", "magEndMiddle", "magEnd"],
    ],
  });
}
