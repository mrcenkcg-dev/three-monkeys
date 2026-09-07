const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// 1. VIDEO TRIGGER ROUTES (/v, /v1, /make-video)
app.get(['/v', '/v1', '/make-video'], (req, res) => {
    const scriptPath = path.join(__dirname, 'video_generator.py');

    if (!fs.existsSync(scriptPath)) {
        return res.status(404).send("Error: video_generator.py not found in project root.");
    }

    console.log(`Executing Python script at: ${scriptPath}`);

    exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).send(`Python Error: ${error.message}\nStderr: ${stderr}`);
        }
        res.send(`SUCCESS! Video output:\n${stdout}`);
    });
});

// 2. DATABASE SETUP
const db = new sqlite3.Database('./database.db', (err) => {
    if (!err) {
        db.run(`CREATE TABLE IF NOT EXISTS community_deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, price TEXT, url TEXT, fee_paid REAL,
            is_priority INTEGER DEFAULT 0, stripe_payment_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS wallet (id INTEGER PRIMARY KEY AUTOINCREMENT, balance REAL DEFAULT 10.00)`);
    }
});

// 3. API DEALS ROUTE
app.get('/api/deals', (req, res) => {
    db.all("SELECT * FROM community_deals ORDER BY created_at DESC", [], (err, rows) => {
        res.json({ deals: rows || [] });
    });
});

// 4. SERVE STATIC FILES
app.use(express.static(__dirname));

// 5. ROOT ROUTE FALLBACK
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send("<h1>Server Active</h1><p>Monkey system server is running, but index.html is missing in root.</p>");
    }
});

// 6. CATCH-ALL 404 ROUTE
app.use((req, res) => {
    res.status(404).send(`<h1>404 Not Found</h1><p>The route <b>${req.url}</b> does not exist on this server.</p>`);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
