const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// 1. Video Trigger Endpoint (Must be above static files)
app.get('/make-video', (req, res) => {
    console.log("Starting video generation process...");
    exec('python3 video_generator.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).send(`Video Generation Failed: ${error.message}`);
        }
        res.send("SUCCESS: Video generated successfully!");
    });
});

// SQLite Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS community_deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            price TEXT,
            url TEXT,
            fee_paid REAL,
            is_priority INTEGER DEFAULT 0,
            stripe_payment_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS wallet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            balance REAL DEFAULT 10.00
        )`);
    }
});

// Deals API Endpoint
app.get('/api/deals', (req, res) => {
    db.all("SELECT * FROM community_deals ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deals: rows });
    });
});

// Serve Static Files & Homepage Dashboard
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
