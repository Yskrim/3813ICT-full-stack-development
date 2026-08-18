// import modules
let url = require("url"); // utils for url resolution
let fs = require("fs"); // API for interacting with the file system

function isLoggedIn(request) {
	let cookies = request.headers.cookie || "";
	return cookies.includes("loggedIn=true");
}

function renderHTML(path, response) {
	fs.readFile(path, null, function (err, data) {
		if (err) {
			response.writeHead(404);
			response.write("File not found");
		} else {
			response.writeHead(200, { "Content-Type": "text/html" });
			response.write(data);
		}
		response.end();
	});
}

module.exports = {
	handleRequest: function (request, response) {
		// this function takes in the request
		let path = url.parse(request.url).pathname;

		if (path === "/") {
			renderHTML("./index.html", response);

		} else if (path === "/login" && request.method === "GET") {
			// User clicked "log in" link — show the form
			renderHTML("./login.html", response);

		} else if (path === "/login" && request.method === "POST") {
			// User submitted the form — read password from request body
			let body = "";
			request.on("data", (chunk) => {
				body += chunk;
			});
			request.on("end", () => {
				// body looks like: "password=123"
				let params = new URLSearchParams(body);
				let password = params.get("password");

				if (password === "123") {
					// Set a cookie so the server remembers this user logged in
					response.writeHead(302, {
						Location: "/account",
						"Set-Cookie": "loggedIn=true; Path=/",
					});
				} else {
					response.writeHead(401, { "Content-Type": "text/html" });
					response.write(
						"<h1>Wrong password</h1><a href='/login'>Try again</a>",
					);
				}
				response.end();
			});

		} else if (path === "/account") {
			if (isLoggedIn(request)) {
				renderHTML("./account.html", response);
			} else {
				// No login cookie — send them back to login
				response.writeHead(302, { Location: "/login" });
				response.end();
			}

		} else if (path === "/logout") {
			// Max-Age=0 deletes the cookie. Path=/ must match how it was set.
			response.writeHead(302, {
				Location: "/login",
				"Set-Cookie": "loggedIn=; Path=/; Max-Age=0",
			});
			response.end();

		} else {
			response.writeHead(404);
			response.write("Route not defined");
			response.end();
		}
	},
};
