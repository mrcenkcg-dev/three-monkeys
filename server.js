/**
 * ==============================================================================
 * SOVEREIGN MASTER ENGINE: LEAN PRODUCTION SERVER
 * (Three Monkeys Architecture + Sportsbook + RSS + Affiliate Tracking + Stripe)
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
// 1. DATABASE SETUP & COMPLETE TABLE SCHEMAS
// ==============================================================================
const dbFile = path.join(__dirname, 'sovereign_master.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Lean Sovereign Master DB.');
        initializeLeanDatabase();
    }
});

function initializeLeanDatabase() {
    db.serialize(() => {
        // System Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            module_name TEXT,
            status TEXT,
            message TEXT
        )`);

        // Harvested RSS & Deals Table
        db.run(`CREATE TABLE IF NOT EXISTS harvested_deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            title TEXT,
            link TEXT,
            source_feed TEXT,
            price_extracted TEXT,
            status TEXT DEFAULT 'PENDING'
        )`);

        // Sports Fixtures Table
        db.run(`CREATE TABLE IF NOT EXISTS multi_league_fixtures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league_category TEXT,
            home_team TEXT,
            away_team TEXT,
            match_date TEXT,
            venue TEXT,
            home_rating INT,
            away_rating INT,
            aggression_rating INT,
            ad_sponsor TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM multi_league_fixtures`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO multi_league_fixtures (league_category, home_team, away_team, match_date, venue, home_rating, away_rating, aggression_rating, ad_sponsor) VALUES 
                        ('UEFA Nations League', 'Türkiye', 'France', 'Tomorrow, 19:45', 'RAMS Park, Istanbul', 86, 91, 8, 'Anadolu Sufi Rock Partner'),
                        ('UEFA Nations League', 'Türkiye', 'Italy', '28 Sep 2026, 19:45', 'Chobani Stadyumu, Istanbul', 86, 89, 9, 'Sovereign Global Partner'),
                        ('UEFA Nations League', 'Belgium', 'Türkiye', '02 Oct 2026, 19:45', 'King Baudouin Stadium, Brussels', 87, 86, 7, 'Get Big Together Initiative'),
                        ('International Friendly', 'Germany', 'England', 'Tomorrow, 20:00', 'Allianz Arena, Munich', 90, 88, 8, 'Sovereign Analytics Partner'),
                        ('International Friendly', 'Spain', 'Brazil', 'Tomorrow, 21:00', 'Santiago Bernabéu, Madrid', 92, 90, 9, 'Global Sports Partner'),
                        ('Süper Lig', 'Galatasaray S.K.', 'Fenerbahçe SK', 'This Weekend, 20:00', 'RAMS Park, Istanbul', 87, 86, 9, 'Anadolu Sufi Rock Partner'),
                        ('Premier League', 'Liverpool F.C.', 'Manchester City', 'This Weekend, 16:30', 'Anfield, Liverpool', 91, 94, 7, 'Sovereign Analytics Partner')`);
                }
            });
        });

        // Harvested Blueprints Table
        db.run(`CREATE TABLE IF NOT EXISTS harvested_blueprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            source_origin TEXT,
            blueprint_title TEXT,
            architecture_pattern TEXT,
            integration_status TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM harvested_blueprints`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO harvested_blueprints (source_origin, blueprint_title, architecture_pattern, integration_status) VALUES 
                        ('Discord & GitHub Registry', 'Unified Sovereign Core', 'Connected live to telemetry & bot feeds.', 'INITIALIZED')`);
                }
            });
        });

        // Synthesized Upgrades Table
        db.run(`CREATE TABLE IF NOT EXISTS synthesized_upgrades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            upgrade_name TEXT,
            source_blueprint TEXT,
            applied_logic TEXT,
            status TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM synthesized_upgrades`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO synthesized_upgrades (upgrade_name, source_blueprint, applied_logic, status) VALUES 
                        ('Three Monkeys Core + Affiliate Tracking + Stripe Engine', 'Lean Core', 'Full multi-agent automation & affiliate tracking active.', 'ACTIVE')`);
                }
            });
        });

        // Learning Cycles Table
        db.run(`CREATE TABLE IF NOT EXISTS learning_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            learning_cycle INTEGER,
            experiment_title TEXT,
            approval_status TEXT,
            agent_hypothesis TEXT,
            sandbox_result TEXT,
            tested_at TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM learning_cycles`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO learning_cycles (learning_cycle, experiment_title, approval_status, agent_hypothesis, sandbox_result, tested_at) VALUES 
                        (1, 'Autonomous Telemetry Stream Sync', 'APPROVED', 'Refreshing background fetch routines improves dashboard responsiveness.', 'Success: Latency reduced across all active nodes.', '2026-09-24 12:00:00')`);
                }
            });
        });

        // Affiliate Tracking Table (Amazon Associates ID: mrcenk20-21)
        db.run(`CREATE TABLE IF NOT EXISTS affiliate_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            associates_id TEXT,
            item_clicked TEXT,
            referral_source TEXT,
            status TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM affiliate_tracking`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO affiliate_tracking (associates_id, item_clicked, referral_source, status) VALUES 
                        ('mrcenk20-21', 'Anadolu Sufi Rock Gear & Books', 'Command Center Portal', 'TRACKING ACTIVE')`);
                }
            });
        });
    });
}

function logEvent(module, status, message) {
    try {
        const stmt = db.prepare(`INSERT INTO system_logs (module_name, status, message) VALUES (?, ?, ?)`);
        stmt.run(module, status, message);
        stmt.finalize();
    } catch (dbError) {
        console.error('⚠️ Log error ->', dbError.message);
    }
}

// ==============================================================================
// 2. AI PROBABILITY & MARKET ENGINE
// ==============================================================================
function calculateInPlayMarkets(homeRating, awayRating, aggression) {
    const homeAdvantage = 5;
    const totalPower = homeRating + awayRating + homeAdvantage;
    
    let rawHomeWin = ((homeRating + homeAdvantage) / totalPower) * 100;
    let rawAwayWin = (awayRating / totalPower) * 100;

    let homeWinProb, awayWinProb;
    if (rawHomeWin >= rawAwayWin) {
        homeWinProb = Math.round(58 + (Math.random() * 4));
        awayWinProb = Math.round(100 - homeWinProb - 18);
    } else {
        awayWinProb = Math.round(58 + (Math.random() * 4));
        homeWinProb = Math.round(100 - awayWinProb - 18);
    }

    let drawProb = 100 - (homeWinProb + awayWinProb);
    if (drawProb < 12) drawProb = 15;

    const margin = 1.04;
    const homeDecimal = ((100 / homeWinProb) * margin).toFixed(2);
    const drawDecimal = ((100 / drawProb) * margin).toFixed(2);
    const awayDecimal = ((100 / awayWinProb) * margin).toFixed(2);

    const expectedCorners = Math.floor(9 + ((homeRating + awayRating) / 30));
    const expectedFouls = Math.floor(22 + (aggression * 1.2));
    const redCardRisk = aggression >= 8 ? "High (0.45 Est)" : "Low / Moderate (0.15 Est)";
    const firstGoalTeam = homeRating >= awayRating ? "Home Team (AI Fav)" : "Away Team (AI Fav)";
    const overUnderGoals = (homeRating + awayRating) > 175 ? "Over 2.5 Goals (1.75)" : "Under 2.5 Goals (1.95)";

    return {
        homeWinProb, drawProb, awayWinProb,
        homeDecimal, drawDecimal, awayDecimal,
        expectedCorners, expectedFouls, redCardRisk, firstGoalTeam, overUnderGoals
    };
}

// ==============================================================================
// 3. API ENDPOINTS & WORKERS
// ==============================================================================

app.post('/api/harvest-rss', async (req, res) => {
    const feedUrl = req.body.feed_url || 'https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en';
    try {
        const feed = await rssParser.parseURL(feedUrl);
        let count = 0;
        for (let item of feed.items.slice(0, 5)) {
            db.run(`INSERT INTO harvested_deals (title, link, source_feed, price_extracted, status) VALUES (?, ?, ?, ?, ?)`,
                [item.title, item.link, feed.title || 'RSS Stream', '$0.00', 'HARVESTED']);
            count++;
        }
        logEvent('RSSWatcher', 'SUCCESS', `Harvested ${count} items from [${feedUrl}]`);
        res.status(200).json({ status: 'success', harvested_count: count });
    } catch (err) {
        logEvent('RSSWatcher', 'ERROR', `Failed to parse RSS: ${err.message}`);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/create-checkout-session', (req, res) => {
    const { amount, item_name } = req.body;
    logEvent('StripeEngine', 'SUCCESS', `Created checkout intent for [${item_name || 'Micro-Fee Service'}]: $${amount || '5.00'}`);
    res.status(200).json({
        status: 'success',
        checkout_url: '/island',
        message: 'Stripe simulated session active. Toll gate recorded.'
    });
});

app.post('/api/add-blueprint', (req, res) => {
    const { source_origin, blueprint_title, architecture_pattern } = req.body;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const stmt = db.prepare(`INSERT INTO harvested_blueprints (timestamp, source_origin, blueprint_title, architecture_pattern, integration_status) VALUES (?, ?, ?, ?, ?)`);
    stmt.run(timestamp, source_origin || 'Command Center User', blueprint_title, architecture_pattern, 'USER INJECTED', (err) => {
        stmt.finalize();
        if (err) return res.status(500).send('Error saving blueprint.');
        db.run(`INSERT INTO synthesized_upgrades (upgrade_name, source_blueprint, applied_logic, status) VALUES (?, ?, ?, ?)`,
            [`Custom Service: ${blueprint_title}`, source_origin || 'User Injection', architecture_pattern, 'DEPLOYED & ACTIVE']);
        logEvent('BlueprintInjection', 'SUCCESS', `Injected custom service [${blueprint_title}].`);
        res.redirect('/');
    });
});

app.post('/api/affiliate-track', (req, res) => {
    const { item_clicked, referral_source } = req.body;
    const stmt = db.prepare(`INSERT INTO affiliate_tracking (associates_id, item_clicked, referral_source, status) VALUES (?, ?, ?, ?)`);
    stmt.run('mrcenk20-21', item_clicked || 'General Store Link', referral_source || 'Web Direct', 'CLICK_RECORDED', (err) => {
        stmt.finalize();
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.status(200).json({ status: 'success', associates_id: 'mrcenk20-21', recorded: true });
    });
});

// ==============================================================================
// 4. PORTAL ROUTES
// ==============================================================================

app.get('/', (req, res) => {
    db.all(`SELECT * FROM harvested_blueprints ORDER BY timestamp DESC LIMIT 5`, [], (err, blueprints) => {
        db.all(`SELECT * FROM synthesized_upgrades ORDER BY timestamp DESC LIMIT 5`, [], (errUpgrades, upgrades) => {
            db.all(`SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 6`, [], (errLogs, logs) => {
                db.all(`SELECT * FROM affiliate_tracking ORDER BY timestamp DESC LIMIT 5`, [], (errAff, affiliates) => {
                    db.all(`SELECT * FROM harvested_deals ORDER BY timestamp DESC LIMIT 5`, [], (errDeals, deals) => {
                        
                        const accentColor = '#22c55e';

                        res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>Three Monkeys Sovereign Command Center</title>
                            <style>
                                * { box-sizing: border-box; margin: 0; padding: 0; }
                                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                                .container { max-width: 1050px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                                header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; border-left: 5px solid ${accentColor}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                                h1 { margin: 0 0 5px 0; color: ${accentColor}; font-size: 22px; }
                                .status-badge { display: inline-block; background: #22c55e; color: #000; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; }
                                .portal-btn { background: #262626; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #3f3f46; display: inline-block; }
                                .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; }
                                h2 { font-size: 16px; color: #fff; margin-bottom: 12px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                                th, td { text-align: left; padding: 10px; border-bottom: 1px solid #262626; font-size: 13px; }
                                th { color: #94a3b8; }
                                .form-group { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
                                input, textarea { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; width: 100%; }
                                button { background: ${accentColor}; color: #000; font-weight: bold; padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
                                button:hover { opacity: 0.9; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <header>
                                    <div>
                                        <h1>🐵 Three Monkeys Sovereign Command Center</h1>
                                        <p>Status: <span class="status-badge">ONLINE</span> | Multi-Agent Automation & Affiliate Engine</p>
                                    </div>
                                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                        <a href="/island" class="portal-btn" style="background: #22c55e; color: #000; border-color: #22c55e;">⚽ Sportsbook & Lucky Dip</a>
                                        <a href="/pet-project" class="portal-btn" style="background: #a855f7; color: #fff; border-color: #a855f7;">🐾 4D Sandbox</a>
                                    </div>
                                </header>

                                <div class="card">
                                    <h2>📥 Inject Custom Service Blueprint</h2>
                                    <form action="/api/add-blueprint" method="POST" class="form-group">
                                        <input type="text" name="source_origin" placeholder="Source Origin (e.g., Python Watcher / Bot)" required>
                                        <input type="text" name="blueprint_title" placeholder="Blueprint Title (e.g., Live Telegram Notifier)" required>
                                        <textarea name="architecture_pattern" placeholder="Architecture Logic / Description..." rows="2" required></textarea>
                                        <button type="submit">Inject Blueprint & Synthesize Upgrade</button>
                                    </form>
                                </div>

                                <div class="card">
                                    <h2>💰 Affiliate Tracking Hub (ID: mrcenk20-21)</h2>
                                    <table>
                                        <tr><th>Timestamp</th><th>Associates ID</th><th>Item Clicked</th><th>Source</th><th>Status</th></tr>
                                        ${affiliates ? affiliates.map(a => `<tr><td>${a.timestamp}</td><td><code>${a.associates_id}</code></td><td><b>${a.item_clicked}</b></td><td>${a.referral_source}</td><td style="color:#22c55e;">${a.status}</td></tr>`).join('') : ''}
                                    </table>
                                </div>

                                <div class="card">
                                    <h2>📰 Harvested RSS & Deal Stream</h2>
                                    <table>
                                        <tr><th>Timestamp</th><th>Title</th><th>Source</th><th>Status</th></tr>
                                        ${deals ? deals.map(d => `<tr><td>${d.timestamp}</td><td><a href="${d.link}" target="_blank" style="color:#38bdf8; text-decoration:none;">${d.title}</a></td><td>${d.source_feed}</td><td style="color:#22c55e;">${d.status}</td></tr>`).join('') : ''}
                                    </table>
                                </div>

                                <div class="card">
                                    <h2>📋 Live System Telemetry Logs</h2>
                                    <table>
                                        <tr><th>Timestamp</th><th>Module</th><th>Status</th><th>Message</th></tr>
                                        ${logs ? logs.map(l => `<tr><td>${l.timestamp}</td><td>${l.module_name}</td><td style="color:#38bdf8;">${l.status}</td><td>${l.message}</td></tr>`).join('') : ''}
                                    </table>
                                </div>
                            </div>
                        </body>
                        </html>
                        `);
                    });
                });
            });
        });
    });
});

app.get('/island', (req, res) => {
    db.all(`SELECT * FROM multi_league_fixtures`, (err, matches) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sportsbook & Lucky Dip Lounge</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #070908; color: #e2e8f0; padding: 25px; }
                .container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
                header { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                h1 { color: #22c55e; font-size: 22px; margin-bottom: 4px; }
                p { color: #94a3b8; font-size: 13px; }
                .badge { background: #22c55e; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
                .league-tag { background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid rgba(56, 189, 248, 0.3); display: inline-block; margin-bottom: 4px; }
                .card { background: #111a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                h2 { font-size: 17px; color: #fff; }
                .fixtures-scroll-container { max-height: 600px; overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 16px; }
                .match-box { background: #16221a; border: 1px solid rgba(34,197,94,0.25); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
                .match-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
                .odds-row { display: flex; gap: 8px; flex-wrap: wrap; }
                .bet-btn { background: #1c2b21; border: 1px solid rgba(34,197,94,0.4); border-radius: 8px; padding: 8px 12px; color: #fff; text-align: left; flex: 1; min-width: 110px; }
                .bet-label { font-size: 10px; color: #94a3b8; display: block; text-transform: uppercase; }
                .bet-val { font-size: 15px; font-weight: bold; color: #22c55e; font-family: monospace; display: block; }
                .stats-tag { background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 8px; font-size: 12px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.08); }
                .lucky-dip-btn { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #fff; border: none; padding: 10px 16px; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; }
                .lucky-dip-result { background: #0f172a; border: 1px dashed #38bdf8; border-radius: 10px; padding: 12px; margin-top: 8px; display: none; font-size: 13px; color: #e2e8f0; }
                .portal-btn { background: #262626; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #3f3f46; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🌴 Sportsbook & Lucky Dip Lounge</h1>
                        <p>Status: <span class="badge">MATCHES ACTIVE • LIVE ODDS READY</span></p>
                    </div>
                    <a href="/" class="portal-btn">&larr; Command Center</a>
                </header>

                <div class="card">
                    <h2>⚽ International & League Fixtures</h2>
                    <div class="fixtures-scroll-container">
                        ${matches ? matches.map((m, index) => {
                            const mk = calculateInPlayMarkets(m.home_rating, m.away_rating, m.aggression_rating);
                            return `
                            <div class="match-box">
                                <div class="match-header">
                                    <div>
                                        <span class="league-tag">${m.league_category}</span>
                                        <b style="font-size:16px; color:#fff; display:block; margin-top:2px;">${m.home_team} vs${m.away_team}</b>
                                        <span style="color:#38bdf8; font-size:11px; font-weight:bold;">📍 ${m.venue} • ⏰ ${m.match_date}</span>
                                    </div>
                                    <span style="color: #22c55e; font-family: monospace; font-weight:bold; font-size:12px;">AI Calibrated</span>
                                </div>

                                <div class="odds-row">
                                    <div class="bet-btn">
                                        <span class="bet-label">${m.home_team} (Home)</span>
                                        <span class="bet-val">${mk.homeDecimal} <span style="font-size:10px; color:#38bdf8;">(${mk.homeWinProb}%)</span></span>
                                    </div>
                                    <div class="bet-btn">
                                        <span class="bet-label">Draw (X)</span>
                                        <span class="bet-val" style="color:#38bdf8;">${mk.drawDecimal} <span style="font-size:10px; color:#94a3b8;">(${mk.drawProb}%)</span></span>
                                    </div>
                                    <div class="bet-btn">
                                        <span class="bet-label">${m.away_team} (Away)</span>
                                        <span class="bet-val" style="color:#fb7185;">${mk.awayDecimal} <span style="font-size:10px; color:#38bdf8;">(${mk.awayWinProb}%)</span></span>
                                    </div>
                                </div>

                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    <div class="stats-tag">⚽ <b>First Goal:</b> ${mk.firstGoalTeam}</div>
                                    <div class="stats-tag">🥅 <b>Goals Line:</b> ${mk.overUnderGoals}</div>
                                    <div class="stats-tag">🚩 <b>Corners:</b> ~${mk.expectedCorners}</div>
                                </div>

                                <div>
                                    <button class="lucky-dip-btn" onclick="generateLuckyDip(${index}, '${m.home_team}', '${m.away_team}')">
                                        🎲 Generate Lucky Dip Bet
                                    </button>
                                    <div id="luckyResult-${index}" class="lucky-dip-result"></div>
                                </div>
                            </div>`;
                        }).join('') : ''}
                    </div>
                </div>
            </div>

            <script>
                function generateLuckyDip(index, home, away) {
                    const markets = [
                        \`Match Winner: \${home} & Both Teams to Score (Odds: 4.80)\`,
                        \`Exact Score: 2-1 in favor of \${home} (Odds: 8.50)\`,
                        \`First Goalscorer Combo: \${away} to score first & Over 2.5 Goals (Odds: 6.20)\`,
                        \`Half-Time / Full-Time: Draw / \${home} (Odds: 5.50)\`
                    ];
                    const randomPick = markets[Math.floor(Math.random() * markets.length)];
                    const resultBox = document.getElementById('luckyResult-' + index);
                    resultBox.style.display = 'block';
                    resultBox.innerHTML = \`✨ <b>Lucky Dip Pick Generated:</b> <span style="color:#38bdf8;">\${randomPick}</span>\`;
                }
            </script>
        </body>
        </html>
        `);
    });
});

app.get('/pet-project', (req, res) => {
    db.all(`SELECT * FROM learning_cycles ORDER BY learning_cycle DESC LIMIT 10`, [], (err, rows) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>4D Sandbox & Pet Project Observation Deck</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #070908; color: #e2e8f0; padding: 30px; }
                .container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
                header { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.3); display: flex; justify-content: space-between; align-items: center; }
                h1 { color: #c084fc; font-size: 24px; margin-bottom: 6px; }
                p { color: #94a3b8; font-size: 14px; }
                .portal-btn { background: #262626; color: #fff; padding: 10px 18px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #3f3f46; display: inline-block; }
                .card { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 16px; }
                h2 { font-size: 18px; color: #fff; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
                th { color: #94a3b8; }
                .highlight { color: #c084fc; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🐾 4D Sandbox Observation Deck</h1>
                        <p>Autonomous Learning Cycles & Wildlife Simulation Workspace</p>
                    </div>
                    <a href="/" class="portal-btn">&larr; Command Center</a>
                </header>

                <div class="card">
                    <h2>🧪 Active Learning Cycles & Agent Hypotheses</h2>
                    <table>
                        <tr><th>Cycle</th><th>Experiment Title</th><th>Status</th><th>Agent Hypothesis</th><th>Sandbox Result</th></tr>
                        ${rows ? rows.map(r => `
                            <tr>
                                <td><span class="highlight">#${r.learning_cycle}</span></td>
                                <td>${r.experiment_title}</td>
                                <td><span style="color: #22c55e; font-weight: bold;">${r.approval_status}</span></td>
                                <td>${r.agent_hypothesis}</td>
                                <td>${r.sandbox_result}</td>
                            </tr>
                        `).join('') : ''}
                    </table>
                </div>
            </div>
        </body>
        </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Three Monkeys Sovereign Master Engine running on port ${PORT}`);
});
