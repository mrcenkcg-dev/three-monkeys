/**
 * ==============================================================================
 * SOVEREIGN BETTING PLATFORM - MASTER BLUEPRINTS FUSION ENGINE (V8.1)
 * Target Leagues: Premier League, Scottish Premiership, Turkish Süper Lig
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

// ==============================================================================
// 1. MASTER PLATFORM DATABASE SCHEMA
// ==============================================================================
const dbFile = path.join(__dirname, 'master_betting_platform.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Master Betting Platform DB.');
        initializeMasterPlatformDB();
    }
});

function initializeMasterPlatformDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS fused_blueprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            pillar_category TEXT,
            blueprint_title TEXT UNIQUE,
            source_target TEXT,
            hardcoded_logic TEXT,
            status TEXT DEFAULT 'FUSED_BASE'
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM fused_blueprints`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT OR IGNORE INTO fused_blueprints (pillar_category, blueprint_title, source_target, hardcoded_logic, status) VALUES 
                        ('Fixture & Odds Engine', 'EPL, Scottish & Super Lig Multi-League Parser', 'Core System Base', 'const leagues = ["Premier League", "Scottish Premiership", "Turkish Süper Lig"]; function fetchFixtures(league) { return { league, status: "LIVE", odds: [1.85, 3.40, 4.20] }; }', 'HARDCODED_CORE'),
                        ('Betting Calculation Engine', 'Decimal & Fractional Odds Payout Calculator', 'Core System Base', 'function calculatePayout(stake, decimalOdds) { return (stake * decimalOdds).toFixed(2); }', 'HARDCODED_CORE'),
                        ('Storefront & Ad Slot Layout', 'Monetization Banner & Affiliate Slot Framework', 'Core System Base', 'const AdSlot = ({ position }) => (<div className="ad-banner"><span>Sponsored Ad Slot [{position}]</span></div>);', 'HARDCODED_CORE'),
                        ('AI Match Prediction Model', 'Poisson Distribution Match Outcome Predictor', 'Core System Base', 'function predictOutcome(homeGoalAvg, awayGoalAvg) { return { homeWinProb: 0.55, drawProb: 0.25, awayWinProb: 0.20 }; }', 'HARDCODED_CORE')`);
                }
            });
        });
    });
}

// ==============================================================================
// 2. PRECISION BETTING SCAVENGER & NOISE PURGE
// ==============================================================================
app.post('/api/scavenge-blueprints', async (req, res) => {
    try {
        // Ultra-specific search query targeting betting models and football odds algorithms
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=site:github.com+"football+odds"+OR+"sports+betting"+OR+"match+prediction"+OR+"betting+bot"+python&hl=en-US&gl=US&ceid=US:en');
        let scavengedCount = 0;

        for (let item of feed.items) {
            const title = item.title || '';
            const lowerTitle = title.toLowerCase();
            
            // STRICT NOISE FILTER: Skip notebooks, model specs, document classification, wordlists
            if (
                lowerTitle.includes('ipynb') || 
                lowerTitle.includes('model_spec') || 
                lowerTitle.includes('document-classification') || 
                lowerTitle.includes('wordlist') || 
                lowerTitle.includes('dataset') || 
                lowerTitle.includes('nlp.sql') ||
                lowerTitle.includes('password')
            ) {
                continue; 
            }

            db.run(`INSERT OR IGNORE INTO fused_blueprints (pillar_category, blueprint_title, source_target, hardcoded_logic, status) VALUES (?, ?, ?, ?, ?)`,
                ['Precision Betting Swarm', title, item.link || 'GitHub Repository', item.contentSnippet || '// Validated betting model schema.', 'PENDING_FUSION'], function(err) {
                    if (this.changes > 0) {
                        scavengedCount++;
                    }
                });
        }

        setTimeout(() => {
            res.status(200).json({ status: 'success', scavenged: scavengedCount });
        }, 500);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Purge existing noise already in the DB
app.post('/api/purge-noise', (req, res) => {
    db.run(`DELETE FROM fused_blueprints WHERE status = 'PENDING_FUSION' AND (blueprint_title LIKE '%ipynb%' OR blueprint_title LIKE '%model_spec%' OR blueprint_title LIKE '%Document-Classification%' OR blueprint_title LIKE '%nlp.sql%')`, [], function(err) {
        if (err) {
            res.status(500).json({ status: 'error', message: err.message });
        } else {
            res.status(200).json({ status: 'success', deleted: this.changes });
        }
    });
});

// ==============================================================================
// 3. MASTER DASHBOARD INTERFACE
// ==============================================================================
app.get('/', (req, res) => {
    db.all(`SELECT * FROM fused_blueprints ORDER BY id DESC`, [], (err, blueprints) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sovereign Betting Platform - Master Blueprint Engine</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 20px; }
                .container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 20px 25px; border-radius: 14px; border: 1px solid #262626; border-left: 6px solid #e11d48; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                h1 { color: #f43f5e; font-size: 22px; margin-bottom: 4px; }
                .badge { background: #e11d48; color: #fff; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media(max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
                
                .pane { background: #141414; border: 1px solid #262626; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 15px; min-height: 500px; max-height: 80vh; overflow-y: auto; }
                .pane-header { font-size: 16px; font-weight: bold; color: #f43f5e; border-bottom: 1px solid #222; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
                
                .card { background: #181818; border: 1px solid #333; padding: 15px; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
                .code-box { font-family: monospace; background: #0a0a0a; color: #34d399; padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid #333; overflow-x: auto; }
                
                .btn { background: #e11d48; color: #fff; padding: 9px 16px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; font-size: 13px; }
                .btn-secondary { background: #38bdf8; color: #000; }
                .btn-danger { background: #f87171; color: #000; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>⚽ Sovereign Betting Platform Master Base</h1>
                        <p>Leagues: <span class="badge">EPL • Scottish Premiership • Turkish Süper Lig</span></p>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="triggerScavenger()">🔍 Precision Scavenge</button>
                        <button class="btn btn-danger" onclick="purgeNoise()">🧹 Purge Noise</button>
                    </div>
                </header>

                <div class="grid-2">
                    <!-- PANE 1: HARDCODED CORE FOUNDATION -->
                    <div class="pane">
                        <div class="pane-header">
                            <span>🛡️ Hardcoded Core Foundation Base</span>
                            <span style="font-size:12px; color:#94a3b8;">Active Modules</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${blueprints ? blueprints.filter(b => b.status === 'HARDCODED_CORE').map(b => `
                                <div class="card">
                                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                                        <span style="color:#f43f5e; font-weight:bold;">${b.pillar_category}</span>
                                        <span style="color:#34d399; background:rgba(52,211,153,0.1); padding:2px 6px; border-radius:4px;">${b.status}</span>
                                    </div>
                                    <h4 style="font-size:14px; color:#fff;">${b.blueprint_title}</h4>
                                    <pre class="code-box">${b.hardcoded_logic}</pre>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>

                    <!-- PANE 2: PRECISION SCAVENGER POOL -->
                    <div class="pane">
                        <div class="pane-header">
                            <span>📡 Cleaned Betting Swarm Feed</span>
                            <span style="font-size:12px; color:#94a3b8;">Total: ${blueprints ? blueprints.filter(b => b.status === 'PENDING_FUSION').length : 0}</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${blueprints ? blueprints.filter(b => b.status === 'PENDING_FUSION').map(b => `
                                <div class="card">
                                    <div style="display:flex; justify-content:space-between; font-size:11px;">
                                        <span style="color:#38bdf8; font-weight:bold;">Source: ${b.source_target}</span>
                                        <span style="color:#fbbf24; background:rgba(251,191,36,0.1); padding:2px 6px; border-radius:4px;">${b.status}</span>
                                    </div>
                                    <h4 style="font-size:14px; color:#fff;">${b.blueprint_title}</h4>
                                    <pre class="code-box">${b.hardcoded_logic}</pre>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                </div>
            </div>

            <script>
                async function triggerScavenger() {
                    const btn = document.querySelector('.btn-secondary');
                    btn.innerText = 'Scavenging Betting Models...';
                    try {
                        const res = await fetch('/api/scavenge-blueprints', { method: 'POST' });
                        const data = await res.json();
                        alert('Precision Scavenge complete! New betting models added: ' + data.scavenged);
                        location.reload();
                    } catch (e) {
                        alert('Error: ' + e.message);
                        btn.innerText = '🔍 Precision Scavenge';
                    }
                }

                async function purgeNoise() {
                    if (!confirm('Clean out non-betting notebook and model files?')) return;
                    try {
                        const res = await fetch('/api/purge-noise', { method: 'POST' });
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
    console.log(`🚀 Master Betting Platform Engine V8.1 running on port ${PORT}`);
});
