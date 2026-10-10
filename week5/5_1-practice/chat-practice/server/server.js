const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const fs = require('fs');

const PORT = 3000;

// middleware
  app.use(express.json());
  app.use('/api/groups', require('./routes/groups'))
  // app.use(cors({
  //     origin: 'http://localhost:4200'
  // }));
//

// logging api
  app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.url, 'Origin:', req.get('origin') ?? '-');
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });
  app.get('/api/ping', (req, res) => res.json({ pong: true }));
  app.post('/api/echo', (req, res) => res.json({ youSent: req.body }));
//

// API endpoints
  // Unknown api
  app.use('/api', (req, res) => {
    res.status(404).json({ error: "API ENDPOINT NOT FOUND. RESPONSE FROM MY API" });
  });
//

// static files
  app.use(express.static(path.join(__dirname, '../dist/chat-practice/browser')));
// 

// fallback
  app.get('/{*splat}', (req,res) => {
    res.sendFile(path.join(__dirname, '../dist/chat-practice/browser', 'index.html'));
  });
// 


app.listen(PORT, () => {
  console.log('API: http://localhost:3000');

  if(!fs.existsSync(path.join(__dirname, '../dist/chat-practice/browser', 'index.html'))){
    console.warn('index.html not found at required path');
  }

});
