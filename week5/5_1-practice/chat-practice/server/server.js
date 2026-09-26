const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.get('/api/health', (req,res)=>{ res.json({ ok: true, time: new Date().toISOString() })});

app.listen(PORT, ()=>{
    console.log('API: http://localhost:3000');
})