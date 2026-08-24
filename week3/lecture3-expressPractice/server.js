// used for routing
const express = require("express");

// init express to the project
const app = express();

// used to provide http functionality
const http = require("http").Server(app);

// this allows files to be hosted into a public folder in the server in a subdir `www/`
// a request for http://localhost:3000/index.html will serve the www/index.html
app.use(express.static(__dirname + "/www"));

let server = http.listen(3000, function () {
	const host = server.address().address;
	const port = server.address().port;

	console.log("My first Express server!");
	console.log(`Server listening on http://localhost:${port}`);
});

app.get("/test", function (req, res) {
	res.sendFile(__dirname + "/www/test.html");
});
// This method finds the path to the file and sends it back to the client when this route is hit.
// A client request 'http://localhost:3000/test' should return the test.html file
