/**
 * ==============================================================================
 * SOVEREIGN PLATFORM - ADVANCED BLUEPRINT VAULT (V9.0.1 STABLE)
 * ==============================================================================
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const Parser = require('rss-parser');

const app = express();
const rssParser = new Parser();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Safe database connection (using local file storage)
const dbFile = path.join(__dirname, 'master_betting_platform.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Advanced Vault DB.');
        initializeVaultDB();
    }
});

function initializeVaultDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS advanced_vault_blueprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            blueprint_category TEXT,
            blueprint_title TEXT UNIQUE,
            source_repo TEXT,
            blueprint_code TEXT,
            status TEXT DEFAULT 'VAULT_PENDING'
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM advanced_vault_blueprints`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT OR IGNORE INTO advanced_vault_blueprints (blueprint_category, blueprint_title, source_repo, blueprint_code, status) VALUES 
                        ('Advanced AI Swarm', 'Multi-Agent Autonomous Betting Dispatcher', 'github.com/swarm-labs/ai-betting-agent-core', 'class SwarmController { analyzeStream(data) { return data.map(node => node.score * 1.15); } }', 'CORE_VAULT'),
                        ('Monetization & AdSense', 'Dynamic AdSense & Affiliate Header Injection Engine', 'github.com/monetize-core/smart-adsense-injector', 'function injectAdSense(slotId, publisherCode) { const el = document.getElementById(slotId); el.innerHTML = "<script async src=\\"adsbygoogle.js\\"></script>"; }', 'CORE_VAULT')`);
                }
            });
        });
    });
}

// Scavenger Endpoint
app.post('/api/scavenge-advanced', async (req, res) => {
    try {
        let totalAdded = 0;
        const feedAI = await rssParser.parseURL('https://news.google.com/rss/search?q=site:github.com+"ai-agent"+OR+"machine-learning"+sports+betting+algorithm+python&hl=en-US&gl=US&ceid=US:en');
        for (let item of feedAI.items) {
            const title = item.title || '';
            if (title.toLowerCase().includes('ipynb') || title.toLowerCase().includes('wordlist')) continue;
            db.run(`INSERT OR IGNORE INTO advanced_vault_blueprints (blueprint_category, blueprint_title, source_repo, blueprint_code, status) VALUES (?, ?, ?, ?, ?)`,
                ['Advanced AI Swarm', title, item.link || 'GitHub AI Repo', item.contentSnippet || '// Advanced AI model schema.', 'VAULT_PENDING'], function(err) {
                    if (this.changes > 0) totalAdded++;
                });
        }
        setTimeout(() => res.status(200).json({ status: 'success', added: totalAdded }), 500);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/purge-vault-noise', (req, res) => {
    db.run(`DELETE FROM advanced_vault_blueprints WHERE status = 'VAULT_PENDING' AND (blueprint_title LIKE '%ipynb%' OR blueprint_title LIKE '%wordlist%')`, [], function(err) {
        res.status(200).json({ status: 'success', deleted: this.changes });
    });
});

app.get('/', (req, res) => {
    db.all(`SELECT * FROM advanced_vault_blueprints ORDER BY id DESC`, [], (err, blueprints) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sovereign Platform - Advanced Blueprint Vault</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 20px; }
                .container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 20px 25px; border-radius: 14px; border: 1px solid #262626; border-left: 6px solid #8b5cf6; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                h1 { color: #a78bfa; font-size: 22px; margin-bottom: 4px; }
                .badge { background: #8b5cf6; color: #fff; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media(max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
                .pane { background: #141414; border: 1px solid #262626; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 15px; min-height: 500px; max-height: 80vh; overflow-y: auto; }
                .pane-header { font-size: 16px; font-weight: bold; color: #a78bfa; border-bottom: 1px solid #222; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
                .card { background: #181818; border: 1px solid #333; padding: 15px; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
                .code-box { font-family: monospace; background: #0a0a0a; color: #34d399; padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid #333; overflow-x: auto; }
                .btn { background: #8b5cf6; color: #fff; padding: 9px 16px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; font-size: 13px; }
                .btn-danger { background: #f87171; color: #000; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🧠 Sovereign Platform - Advanced Blueprint Vault</h1>
                        <p>Status: <span class="badge">VAULT SECURED V9.0.1</span></p>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn" onclick="triggerAdvancedScavenge()">📡 Scavenge Advanced AI & AdSense</button>
                        <button class="btn btn-danger" onclick="purgeNoise()">🧹 Purge Noise</button>
                    </div>
                </header>
                <div class="grid-2">
                    <div class="pane">
                        <div class="pane-header">
                            <span>🛡️ Core Vault Foundation</span>
                            <span style="font-size:12px; color:#34d399;">Active & Locked</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${blueprints ? blueprints.filter(b => b.status === 'CORE_VAULT').map(b => `
                                <div class="card">
                                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                                        <span style="color:#a78bfa; font-weight:bold;">${b.blueprint_category}</span>
                                        <span style="color:#34d399; background:rgba(52,211,153,0.1); padding:2px 6px; border-radius:4px;">${b.status}</span>
                                    </div>
                                    <h4 style="font-size:14px; color:#fff;">${b.blueprint_title}</h4>
                                    <div style="font-size:11px; color:#94a3b8;">Repo: ${b.source_repo}</div>
                                    <pre class="code-box">${b.blueprint_code}</pre>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                    <div class="pane">
                        <div class="pane-header">
                            <span>📡 Scavenged Advanced Stream</span>
                            <span style="font-size:12px; color:#94a3b8;">Total Vault: ${blueprints ? blueprints.filter(b => b.status === 'VAULT_PENDING').length : 0}</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${blueprints ? blueprints.filter(b => b.status === 'VAULT_PENDING').map(b => `
                                <div class="card">
                                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                                        <span style="color:#38bdf8; font-weight:bold;">${b.blueprint_category}</span>
                                        <span style="color:#fbbf24; background:rgba(251,191,36,0.1); padding:2px 6px; border-radius:4px;">${b.status}</span>
                                    </div>
                                    <h4 style="font-size:14px; color:#fff;">${b.blueprint_title}</h4>
                                    <div style="font-size:11px; color:#94a3b8;">Source: ${b.source_repo}</div>
                                    <pre class="code-box">${b.blueprint_code}</pre>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                </div>
            </div>
            <script>
                async function triggerAdvancedScavenge() {
                    const btn = document.querySelector('.btn');
                    btn.innerText = 'Scavenging Advanced Vault...';
                    try {
                        const res = await fetch('/api/scavenge-advanced', { method: 'POST' });
                        const data = await res.json();
                        alert('Advanced Scavenge complete! New AI & AdSense blueprints caught: ' + data.added);
                        location.reload();
                    } catch (e) {
                        alert('Error: ' + e.message);
                        btn.innerText = '📡 Scavenge Advanced AI & AdSense';
                    }
                }
                async function purgeNoise() {
                    try {
                        const res = await fetch('/api/purge-vault-noise', { method: 'POST' });
                        const data = await res.json();
                        alert('Purged noisy items: ' + data.deleted);
                        location.reload();
                    } catch (e) {
                        alert('Error: ' + e.message);
                    }
                }
            </script>
        </body>
        </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Advanced Blueprint Vault V9.0.1 running on port ${PORT}`);
});
