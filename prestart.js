const execSync = require("child_process").execSync;

function detectOS() {
  if (process.platform !== "win32") {
    const output = execSync("./node_modules/react-viro/bin/run_ngrok.sh", {
      encoding: "utf-8",
    });
    return output;
  } else {
    //   const output = execSync(
    //     // prettier-ignore
    //     "bash ./node_modules/react-viro/bin/run_ngrok.sh",
    //     {
    //       encoding: "utf-8",
    //     }
    //   );
    //   return output;
  }
}

detectOS();
