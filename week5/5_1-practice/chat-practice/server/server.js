const express = require('express');
const app = express();
const cors = require('cors');

const PORT = 3000;

// cors middleware
    app.use(cors({
        origin: 'http://localhost:4200'
    }));
//

// logging api
    app.use(express.json());
    app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
    });

    app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.url, 'Origin:', req.get('origin') ?? '-');
    next();
    });

    app.get('/api/ping', (req, res) => res.json({ pong: true }));
    app.post('/api/echo', (req, res) => res.json({ youSent: req.body }));
//


app.listen(PORT, () => {
  console.log('API: http://localhost:3000');
});
