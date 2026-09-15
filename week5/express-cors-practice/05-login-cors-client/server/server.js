const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// TODO: configure cors() for origin http://localhost:5500

app.use(express.json());

require("./routes/auth.js")(app);

app.listen(PORT, () => {
	console.log(`Auth server running on http://localhost:${PORT}`);
});
