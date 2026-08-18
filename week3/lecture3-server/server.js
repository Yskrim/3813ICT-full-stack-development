let http = require("http");
let routes = require("./route.js")

http.createServer(routes.handleRequest).listen(3000);
console.log("Server running at http://localhost:3000/");