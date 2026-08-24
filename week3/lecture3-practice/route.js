let url = require("url");
let fs = require("fs");

function renderHTML(path, response) {
	fs.readFile(path, null, function (err, data) {
		if (err) {
			resoponse.writeHead(404);
			response.write("File not found");
		} else {
			response.write(data);
		}
		response.end();
	});
}

module.exports = {
	handleRequest: function (request, response) {
		response.writeHead(200, { "Content-Type": "text/html" });
        
        // parse the url obj to find the pathname
		const path = url.parse(request.url).pathname; 
		
        if (path === "/") {  
            // home path
			renderHTML("./index.html", response);
		} else { 
            // no other routes yet
			resonse.writeHead(404);
			response.write("Route not defined");
			response.end();
		}
	},
};

// Express is a more flexible Node.js web app framework that simplifies route creating methods. + uses utility middleware methods and API endpoints.
