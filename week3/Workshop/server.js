const express = require("express");
const routes = require("./routes.js").routes

const app = express();
const http = require("http").Server(app);
const PORT = 3001;

app.use(express.static(__dirname + "/www"));
app.use(express.json());

routes(app);

http.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
