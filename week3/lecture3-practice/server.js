const http = require("http"); // http module
const routes = require("./route.js") // my router module

http.createServer(routes.handleRequest).listen(3000);
console.log("Server running on port 3000");
// this file creates a server listener on port 3000, that will perform the routes.handleRequest function every time it receives a request.
