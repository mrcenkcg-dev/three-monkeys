/**
 * ==============================================================================
 * SOVEREIGN BETTING PLATFORM - LIVE LEAGUES & MATCH ENGINE (V8.2)
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
// 1. DATABASE & FIXTURE SEEDING
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
                        ('Fixture & Odds Engine', 'EPL, Scottish & Super Lig Multi-League Parser', 'Core System Base', 'const leagues = ["Premier League", "Scottish Premiership", "Turkish Süper Lig"];', 'HARDCODED_CORE'),
                        ('Betting Calculation Engine', 'Decimal Payout Calculator', 'Core System Base', 'function calculatePayout(stake, odds) { return (stake * odds).toFixed(2); }', 'HARDCODED_CORE')`);
                }
            });
        });

        // Table for live fixtures across the 3 leagues
        db.run(`CREATE TABLE IF NOT EXISTS live_fixtures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league TEXT,
            home_team TEXT,
            away_team TEXT,
            home_odds REAL,
            draw_odds REAL,
            away_odds REAL,
            status TEXT DEFAULT 'LIVE'
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM live_fixtures`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO live_fixtures (league, home_team, away_team, home_odds, draw_odds, away_odds) VALUES 
                        ('Premier League', 'Arsenal', 'Chelsea', 1.85, 3.50, 4.20),
                        ('Premier League', 'Manchester City', 'Liverpool', 2.10, 3.40, 3.10),
                        ('Scottish Premiership', 'Celtic', 'Rangers', 1.95, 3.30, 3.80),
                        ('Scottish Premiership', 'Hearts', 'Aberdeen', 2.20, 3.20, 3.00),
                        ('Turkish Süper Lig', 'Galatasaray', 'Fenerbahçe', 2.05, 3.30, 3.40),
                        ('Turkish Süper Lig', 'Beşiktaş', 'Trabzonspor', 2.15, 3.25, 3.20)`);
                }
            });
        });
    });
}

// ==============================================================================
// 2. PRECISION SCAVENGER ENDPOINT
// ==============================================================================
app.post('/api/scavenge-blueprints', async (req, res) => {
    try {
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=site:github.com+"football+odds"+OR+"sports+betting"+OR+"trading+bot"+python&hl=en-US&gl=US&ceid=US:en');
        let scavengedCount = 0;

        for (let item of feed.items) {
            const title = item.title || '';
            const lowerTitle = title.toLowerCase();
            
            if (lowerTitle.includes('audiveris') || lowerTitle.includes('ipynb') || lowerTitle.includes('wordlist') || lowerTitle.includes('dataset')) continue;

            db.run(`INSERT OR IGNORE INTO fused_blueprints (pillar_category, blueprint_title, source_target, hardcoded_logic, status) VALUES (?, ?, ?, ?, ?)`,
                ['Precision Betting Swarm', title, item.link || 'GitHub Repository', item.contentSnippet || '// Validated quantitative model.', 'PENDING_FUSION'], function(err) {
                    if (this.changes > 0) scavengedCount++;
                });
        }
        setTimeout(() => res.status(200).json({ status: 'success', scavenged: scavengedCount }), 500);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/purge-noise', (req, res) => {
    db.run(`DELETE FROM fused_blueprints WHERE status = 'PENDING_FUSION' AND (blueprint_title LIKE '%audiveris%' OR blueprint_title LIKE '%ipynb%')`, [], function(err) {
        res.status(200).json({ status: 'success', deleted: this.changes });
    });
});

// ==============================================================================
// 3. MASTER PLATFORM DASHBOARD INTERFACE (LIVE INTERFACE)
// ==============================================================================
app.get('/', (req, res) => {
    db.all(`SELECT * FROM fused_blueprints ORDER BY id DESC`, [], (err, blueprints) => {
        db.all(`SELECT * FROM live_fixtures`, [], (err, fixtures) => {
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Sovereign Betting Platform - Live Control Center</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 20px; }
                    .container { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                    header { background: #141414; padding: 20px 25px; border-radius: 14px; border: 1px solid #262626; border-left: 6px solid #e11d48; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                    h1 { color: #f43f5e; font-size: 22px; margin-bottom: 4px; }
                    .badge { background: #e11d48; color: #fff; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 12px; }
                    
                    /* Grid Layout */
                    .grid-main { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
                    @media(max-width: 1000px) { .grid-main { grid-template-columns: 1fr; } }
                    
                    .pane { background: #141414; border: 1px solid #262626; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 15px; min-height: 450px; max-height: 80vh; overflow-y: auto; }
                    .pane-header { font-size: 16px; font-weight: bold; color: #f43f5e; border-bottom: 1px solid #222; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
                    
                    /* Fixture Cards */
                    .fixture-card { background: #181818; border: 1px solid #333; padding: 14px; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; }
                    .league-tag { font-size: 11px; color: #38bdf8; font-weight: bold; text-transform: uppercase; }
                    .match-teams { font-size: 15px; font-weight: bold; color: #fff; display: flex; justify-content: space-between; align-items: center; }
                    .odds-row { display: flex; gap: 8px; }
                    .odds-btn { flex: 1; background: #222; border: 1px solid #444; color: #34d399; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; text-align: center; font-size: 12px; }
                    .odds-btn:hover { background: #34d399; color: #000; }
                    
                    /* Ad Banner Slot */
                    .ad-banner { background: linear-gradient(135deg, #1e1b4b, #31103c); border: 1px dashed #a855f7; padding: 15px; border-radius: 10px; text-align: center; color: #c084fc; font-size: 13px; font-weight: bold; }

                    .card { background: #181818; border: 1px solid #333; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
                    .code-box { font-family: monospace; background: #0a0a0a; color: #34d399; padding: 8px; border-radius: 6px; font-size: 11px; border: 1px solid #333; overflow-x: auto; }
                    
                    .btn { background: #e11d48; color: #fff; padding: 8px 14px; border-radius: 6px; font-weight: bold; border: none; cursor: pointer; font-size: 13px; }
                    .btn-secondary { background: #38bdf8; color: #000; }
                </style>
            </head>
            <body>
                <div class="container">
                    <header>
                        <div>
                            <h1>⚽ Sovereign Betting Platform - Live Control Center</h1>
                            <p>Active Leagues: <span class="badge">EPL • Scottish Premiership • Turkish Süper Lig</span></p>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            <button class="btn btn-secondary" onclick="triggerScavenger()">🔍 Scavenge Models</button>
                            <button class="btn" style="background:#f87171; color:#000;" onclick="purgeNoise()">🧹 Purge Noise</button>
                        </div>
                    </header>

                    <div class="grid-main">
                        <!-- LEFT WINDOW: LIVE MATCH FIXTURES & AD SLOTS -->
                        <div class="pane">
                            <div class="pane-header">
                                <span>🎯 Live Match Fixtures & Odds Grid</span>
                                <span style="font-size:12px; color:#34d399;">Engine Active</span>
                            </div>

                            <!-- Monetization Ad Slot 1 -->
                            <div class="ad-banner">
                                📢 SPONSORED AD SLOT [Header Banner Placement - Ready for Affiliate Network]
                            </div>

                            <div style="display:flex; flex-direction:column; gap:12px;">
                                ${fixtures ? fixtures.map(f => `
                                    <div class="fixture-card">
                                        <div class="league-tag">${f.league}</div>
                                        <div class="match-teams">
                                            <span>${f.home_team} vs${f.away_team}</span>
                                            <span style="font-size:11px; color:#fbbf24; background:rgba(251,191,36,0.1); padding:2px 6px; border-radius:4px;">${f.status}</span>
                                        </div>
                                        <div class="odds-row">
                                            <button class="odds-btn" onclick="placeBet('${f.home_team}', ${f.home_odds})">1: ${f.home_odds}</button>
                                            <button class="odds-btn" onclick="placeBet('Draw', ${f.draw_odds})">X: ${f.draw_odds}</button>
                                            <button class="odds-btn" onclick="placeBet('${f.away_team}', ${f.away_odds})">2: ${f.away_odds}</button>
                                        </div>
                                    </div>
                                `).join('') : ''}
                            </div>

                            <!-- Monetization Ad Slot 2 -->
                            <div class="ad-banner">
                                💼 SPONSORED AD SLOT [Footer Banner Placement - Ready for Partner Integration]
                            </div>
                        </div>

                        <!-- RIGHT WINDOW: SCAVENGER & CORE BLUEPRINTS -->
                        <div class="pane">
                            <div class="pane-header">
                                <span>📡 Swarm & Core Base</span>
                                <span style="font-size:12px; color:#94a3b8;">Modules</span>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${blueprints ? blueprints.map(b => `
                                    <div class="card">
                                        <div style="display:flex; justify-content:space-between; font-size:10px;">
                                            <span style="color:#f43f5e; font-weight:bold;">${b.pillar_category}</span>
                                            <span style="color:#34d399;">${b.status}</span>
                                        </div>
                                        <h4 style="font-size:13px; color:#fff;">${b.blueprint_title}</h4>
                                        <pre class="code-box">${b.hardcoded_logic || b.source_target}</pre>
                                    </div>
                                `).join('') : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <script>
                    function placeBet(selection, odds) {
                        const stake = prompt('Enter your stake (£/€/$):', '10');
                        if (!stake) return;
                        const payout = (parseFloat(stake) * odds).toFixed(2);
                        alert('Bet Placed Successfully! Selection: ' + selection + ' @ Odds ' + odds + '\\nPotential Payout: ' + payout);
                    }

                    async function triggerScavenger() {
                        const btn = document.querySelector('.btn-secondary');
                        btn.innerText = 'Scavenging...';
                        try {
                            const res = await fetch('/api/scavenge-blueprints', { method: 'POST' });
                            const data = await res.json();
                            alert('Scavenge finished! Added: ' + data.scavenged);
                            location.reload();
                        } catch (e) {
                            alert('Error: ' + e.message);
                        }
                    }

                    async function purgeNoise() {
                        try {
                            const res = await fetch('/api/purge-noise', { method: 'POST' });
                            const data = await res.json();
                            alert('Purged noise items: ' + data.deleted);
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
});

app.listen(PORT, () => {
    console.log(`🚀 Sovereign Betting Platform V8.2 running on port ${PORT}`);
});
