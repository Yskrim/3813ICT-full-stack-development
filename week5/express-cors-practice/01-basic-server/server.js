const express = require("express");

const app = express();
const PORT = 3000;

// TODO 1: раздать статику из папки www/
app.use(express.static(__dirname + "/www"));

// TODO 2: роут GET /api/status -> { status: "ok", time: <ISO строка> }
app.get("/api/status", (req, res) => {
    res.status(200).json({ "status": "ok", "time": new Date().toISOString() });
});

// TODO 3: обработчик "маршрут не найден" -> 404 + { error: "Not found" }
// Подсказка: это последний app.use(...), без указания пути
app.use((req, res, next) => {
    res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
