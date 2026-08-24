const express = require("express");
const formidable = require("formidable");

const app = express();

// endpoint for root level of the site with GET request
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

// endpoint for root level of the site with POST request
app.post("/", (req, res) => {
	
    const form = new formidable.IncomingForm();

	form.parse(req);

	// when a fileBegin event is triggered, use a callback
	form.on("fileBegin", (name, file) => {
		file.filepath = __dirname + "/uploads/" + file.originalFilename; // need to create a directory /uploads
	});

	// when a file has been received
	form.on("file", (name, file) => {
		console.log("Uploaded", file.originalFilename);
	});

	res.sendFile(__dirname + "/index.html"); // send back the same site file, so that another upload can happen.
});

app.listen(3000);
console.log("Server is now listening on: http://localhost:3000");


// also in the newer forbidable they changed file.path >> file.filepath and file.name >> file.originalFilename. That is why it didn't work at first.