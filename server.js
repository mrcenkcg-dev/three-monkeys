const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

// Price API endpoint required by index.html
app.get('/api/prices', (req, res) => {
    res.json([
        { symbol: 'btc', price: 64250.50, change_24h: 2.45 },
        { symbol: 'eth', price: 3480.10, change_24h: -0.85 },
        { symbol: 'sol', price: 145.75, change_24h: 5.12 },
        { symbol: 'ada', price: 0.42, change_24h: 1.15 }
    ]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
