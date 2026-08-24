# Create routes with express

### Routes

Express allows to define routing using Express object methods that correspond to HTTP methods
1. app.get() == GET
2. app.post() == POST

The server listens for requests that match the specific routes and methods and runs a callback funciton for those routes upon match detection.

### Nodejs server with Express.js
- cd to the directory
- `npm init` the node project
- `npm install express --save` installs express to the project, --save will save express to package.json by itself


## What Express server needs to run properly?

1. Imports
    - Import express
    - Import http
2. Create express instance
3. Create http instance by passing the express app when importing http `require('http').Server(app)`
4. Specify the public dir
5. Initiate the server by starting listening on a certain port
6. Add more routes by controlling the get and post requests to the routes on the server.