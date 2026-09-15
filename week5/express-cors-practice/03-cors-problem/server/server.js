const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// TODO (step 2, after you've seen the CORS error): require + app.use(cors())
// Put it BEFORE the routes below.
app.use(express.json());
app.use(cors());


// TODO (step 1): GET /api/message -> { message: "hello from server" }
app.get("/api/message", (req, res) => {
	res.status(200).json({ message: "Hello from server" });
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
