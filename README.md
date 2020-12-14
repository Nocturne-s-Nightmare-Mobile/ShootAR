# ShootAR

<img src="./js/res/ShootAR.png" alt="ShootAR Lovo" width="500" height="150">

ShootAR is an Augmented Reality mobile game that lets you enter a shooting range, choose a difficulty mode and then shoot randomly positioned targets in an attempt to get as high a score as possible within 60 seconds.

<hr>

Developers:  Chris Smith, Valentyna Vasylieva, Daniel Lee, Zachary Ernst.

<hr>

Instructions to play:

To Launch ShootAR you must first download the Viro CLI tools:<br>
  On Mac run:<br>
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"<br>

Then you must install Watchman:<br>
  On Mac run:<br>
  brew install watchman<br>

If you don't already have node, this needs to be installed as well:<br>
  On Mac run:<br>
  brew install node<br>

For Windows or Linux, please follow instructions here:<br>
https://docs.viromedia.com/docs/quick-start<br>

After installing the above, you then need to clone the repo and download the ViroMedia phone app.<br>

At this point, you can run 'npm i' within the project to install dependencies.  Next, run 'npm start' within the project to launch the bundler.<br>

Once the ViroMedia phone app is downloaded, you can click into it and access the menu at the top right.  (Your phone and computer must be on the same network) <br> Click the menu, and then click Enter Testbed.
Within Testbed you can enter your computer's IPv4 address to bundle the project and run it on your phone.  If you don't know how to find your IPv4 address, run 'ipconfig getifaddr en0' in the terminal.

Enjoy!
