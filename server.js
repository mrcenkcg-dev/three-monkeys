const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// 1. Direct Video Route with Absolute Path
app.get('/make-video', (req, res) => {
    const scriptPath = path.join(__dirname, 'video_generator.py');
    console.log(`Triggering script at: ${scriptPath}`);

    exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).send(`
                <h2>Video Generation Failed</h2>
                <p><b>Error:</b> ${error.message}</p>
                <p><b>Stderr:</b> ${stderr || 'None'}</p>
            `);
        }
        res.send(`
            <h2>SUCCESS!</h2>
            <p>Video generated successfully!</p>
            <pre>${stdout}</pre>
        `);
    });
});

// 2. Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
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

// 3. Deals API Route
app.get('/api/deals', (req, res) => {
    db.all("SELECT * FROM community_deals ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deals: rows });
    });
});

// 4. Static Files & Root
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
