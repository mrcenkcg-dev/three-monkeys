const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// 1. Diagnostic /make-video Route
app.get('/make-video', (req, res) => {
    // Look in current directory or src subfolder
    let scriptPath = path.join(__dirname, 'video_generator.py');
    
    if (!fs.existsSync(scriptPath)) {
        scriptPath = path.join(__dirname, 'src', 'video_generator.py');
    }

    if (!fs.existsSync(scriptPath)) {
        return res.status(404).send(`
            <h2>File Not Found Error</h2>
            <p>Could not locate video_generator.py at: ${scriptPath}</p>
            <p><b>Current __dirname:</b> ${__dirname}</p>
            <p><b>Files in __dirname:</b> ${fs.readdirSync(__dirname).join(', ')}</p>
        `);
    }

    console.log(`Executing Python script at: ${scriptPath}`);

    exec(`python3 "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec Error: ${error.message}`);
            return res.status(500).send(`
                <h2>Python Execution Error</h2>
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

// 4. Serve Static Files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    const indexPath = fs.existsSync(path.join(__dirname, 'index.html'))
        ? path.join(__dirname, 'index.html')
        : path.join(__dirname, 'src', 'index.html');
    res.sendFile(indexPath);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
