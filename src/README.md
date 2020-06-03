# Watson Finance Chat Bot Server
## Faustino Cortina, Julian Grunauer, Syed Tanveer
 
This repository is a part of our final project for CS89 Cognitive Computing with IBM Watson. It is a Node Express server that is accessed by our Watson Assistant webhook. This server is publically accessible via https://watson-finance-bot.herokuapp.com/api. However, this server can be run locally by following the below instructions.

### Building the server
in order to build the server, simply run the command `yarn install` in the root of this directory. See https://classic.yarnpkg.com/en/docs/install/ for how to install yarn if you do not have this command line took installed.

### Running the server
Simply type `yarn start` in the root of this repository to get a local instance of this server running at `http://localhost:9090`

### Testing the server
This server has one primary endpoint which can be accessed via a POST request at `http://localhost:9090/api`. All post requests at this endpoint require a 'question' field to be passed, and some questions require a 'stock' field to be passed as well. See `watson_controller.js` to see what types of requests this endpoint handles.
