const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

require("./routes/books.js")(app);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
