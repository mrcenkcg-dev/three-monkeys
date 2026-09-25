/**
 * ==============================================================================
 * SOVEREIGN MASTER ENGINE: UNIFIED PRODUCTION SERVER
 * (Three Monkeys Architecture + Bedding Ads + Music Lounge + 4D Pet Project)
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
        console.log('✅ Connected to Unified Sovereign Master DB.');
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

        // Bedding & Harvested Deals Table
        db.run(`CREATE TABLE IF NOT EXISTS harvested_deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            title TEXT,
            link TEXT,
            source_feed TEXT,
            price_extracted TEXT,
            status TEXT DEFAULT 'PENDING'
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM harvested_deals`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO harvested_deals (title, link, source_feed, price_extracted, status) VALUES 
                        ('Luxury Egyptian Cotton Bedding Set - King Size', '#', 'Amazon Affiliates [mrcenk20-21]', '$49.99', 'ACTIVE DEAL'),
                        ('Orthopedic Memory Foam Mattress Topper', '#', 'Amazon Affiliates [mrcenk20-21]', '$39.50', 'ACTIVE DEAL'),
                        ('Hypoallergenic Goose Feather Pillow Pack of 2', '#', 'Amazon Affiliates [mrcenk20-21]', '$29.99', 'ACTIVE DEAL')`);
                }
            });
        });

        // Musics & Soundtracks Table
        db.run(`CREATE TABLE IF NOT EXISTS music_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            track_title TEXT,
            artist TEXT,
            genre TEXT,
            duration TEXT,
            audio_source TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM music_tracks`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT INTO music_tracks (track_title, artist, genre, duration, audio_source) VALUES 
                        ('Uzun İnce Bir Yoldayım (Psychedelic Remix)', 'Cenk & Lyria 3 Synth', 'Anatolian Psychedelic Sufi Rock', '3:45', 'Stream Live'),
                        ('Yunus Emre Nefes Session', 'Traditional Bağlama & Synth Engine', 'Sufi Folk Fusion', '4:12', 'Stream Live'),
                        ('Anatolian Highway Groove', 'Three Monkeys Ensemble', 'Anatolian Rock', '3:20', 'Stream Live')`);
                }
            });
        });

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
                        ('Süper Lig', 'Galatasaray S.K.', 'Fenerbahçe SK', 'This Weekend, 20:00', 'RAMS Park, Istanbul', 87, 86, 9, 'Anadolu Sufi Rock Partner')`);
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
        )`);

        // Synthesized Upgrades Table
        db.run(`CREATE TABLE IF NOT EXISTS synthesized_upgrades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            upgrade_name TEXT,
            source_blueprint TEXT,
            applied_logic TEXT,
            status TEXT
        )`);

        // Learning Cycles & 4D Pet Project Table
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
                        (1, '4D Wildlife Rescue Simulation & Movement Grid', 'APPROVED', 'Dynamic compound simulation tracks rescue paths in real-time space-time coordinates.', 'Success: Spatial tracking latency < 12ms.', '2026-09-24 12:00:00'),
                        (2, 'Multi-Agent Autonomous Feed Synchronization', 'ACTIVE', 'Background agents poll telemetry feeds continuously without dropping connection pools.', 'Success: Stable cluster communication.', '2026-09-25 10:30:00')`);
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
                        ('mrcenk20-21', 'Luxury Egyptian Cotton Bedding', 'Bedding Ads Lounge', 'TRACKING ACTIVE')`);
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

app.post('/api/affiliate-track', (req, res) => {
    const { item_clicked, referral_source } = req.body;
    const stmt = db.prepare(`INSERT INTO affiliate_tracking (associates_id, item_clicked, referral_source, status) VALUES (?, ?, ?, ?)`);
    stmt.run('mrcenk20-21', item_clicked || 'Bedding Ad Item', referral_source || 'Web Direct', 'CLICK_RECORDED', (err) => {
        stmt.finalize();
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.status(200).json({ status: 'success', associates_id: 'mrcenk20-21', recorded: true });
    });
});

// ==============================================================================
// 4. PORTAL ROUTES (Command Center + Dedicated Pages)
// ==============================================================================

// COMMAND CENTER HOME
app.get('/', (req, res) => {
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
            header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; border-left: 5px solid #22c55e; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
            h1 { margin: 0 0 5px 0; color: #22c55e; font-size: 22px; }
            .status-badge { display: inline-block; background: #22c55e; color: #000; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; }
            .portal-btn { background: #262626; color: #fff; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #3f3f46; display: inline-block; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
            .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 12px; }
            h2 { font-size: 16px; color: #fff; }
            p { font-size: 13px; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div>
                    <h1>🐵 Three Monkeys Sovereign Command Center</h1>
                    <p>Status: <span class="status-badge">ONLINE</span> | Unified Engine Active</p>
                </div>
            </header>

            <div class="grid">
                <div class="card" style="border-left: 4px solid #f59e0b;">
                    <h2>🛏️ Bedding Ads & Deals</h2>
                    <p>Browse curated mattress toppers, pillows, and bedding essentials linked with Amazon Associates.</p>
                    <a href="/bedding-ads" class="portal-btn" style="background:#f59e0b; color:#000; text-align:center;">Open Bedding Ads &rarr;</a>
                </div>

                <div class="card" style="border-left: 4px solid #38bdf8;">
                    <h2>🎵 Music Lounge</h2>
                    <p>Listen to Anatolian Psychedelic Sufi Rock and traditional poetry musical arrangements.</p>
                    <a href="/musics" class="portal-btn" style="background:#38bdf8; color:#000; text-align:center;">Open Music Lounge &rarr;</a>
                </div>

                <div class="card" style="border-left: 4px solid #a855f7;">
                    <h2>🐾 4D Pet Project Sandbox</h2>
                    <p>Observation deck for autonomous learning cycles and wildlife rescue simulations.</p>
                    <a href="/pet-project" class="portal-btn" style="background:#a855f7; color:#fff; text-align:center;">Open 4D Sandbox &rarr;</a>
                </div>

                <div class="card" style="border-left: 4px solid #22c55e;">
                    <h2>⚽ Sportsbook & Lucky Dip</h2>
                    <p>AI-calibrated fixtures, live odds, and automated match predictions.</p>
                    <a href="/island" class="portal-btn" style="background:#22c55e; color:#000; text-align:center;">Open Sportsbook &rarr;</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});

// PAGE 1: BEDDING ADS & DEALS
app.get('/bedding-ads', (req, res) => {
    db.all(`SELECT * FROM harvested_deals ORDER BY timestamp DESC`, [], (err, deals) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Bedding Ads & Affiliate Lounge</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; border-left: 5px solid #f59e0b; display: flex; justify-content: space-between; align-items: center; }
                h1 { color: #f59e0b; font-size: 22px; }
                .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 15px; }
                .deal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; }
                .deal-box { background: #1a1a1a; border: 1px solid #333; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; }
                .price { font-size: 18px; font-weight: bold; color: #22c55e; font-family: monospace; }
                .buy-btn { background: #f59e0b; color: #000; padding: 10px; border-radius: 8px; text-decoration: none; font-weight: bold; text-align: center; display: block; }
                .portal-btn { background: #262626; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 13px; border: 1px solid #3f3f46; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🛏️ Bedding Ads & Sleep Essentials</h1>
                        <p style="color:#94a3b8; font-size:13px;">Curated Offers • Associates ID: mrcenk20-21</p>
                    </div>
                    <a href="/" class="portal-btn">&larr; Command Center</a>
                </header>

                <div class="card">
                    <h2>Featured Bedding Ads & Deals</h2>
                    <div class="deal-grid">
                        ${deals ? deals.map(d => `
                            <div class="deal-box">
                                <div>
                                    <span style="font-size:11px; color:#38bdf8; background:rgba(56,189,248,0.1); padding:2px 6px; border-radius:4px;">${d.source_feed}</span>
                                    <h3 style="font-size:15px; color:#fff; margin-top:8px;">${d.title}</h3>
                                </div>
                                <div>
                                    <div class="price">${d.price_extracted}</div>
                                    <a href="${d.link}" target="_blank" class="buy-btn" style="margin-top:10px;">View Deal (Amazon)</a>
                                </div>
                            </div>
                        `).join('') : '<p>No bedding deals found.</p>'}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `);
    });
});

// PAGE 2: MUSIC LOUNGE
app.get('/musics', (req, res) => {
    db.all(`SELECT * FROM music_tracks ORDER BY timestamp DESC`, [], (err, tracks) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Music Lounge & Sufi Rock Stream</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; border-left: 5px solid #38bdf8; display: flex; justify-content: space-between; align-items: center; }
                h1 { color: #38bdf8; font-size: 22px; }
                .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 15px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid #262626; font-size: 13px; }
                th { color: #94a3b8; }
                .play-btn { background: #38bdf8; color: #000; padding: 6px 12px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
                .portal-btn { background: #262626; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 13px; border: 1px solid #3f3f46; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🎵 Anatolian Psychedelic Sufi Rock Lounge</h1>
                        <p style="color:#94a3b8; font-size:13px;">Traditional Poetry, Bağlama & Lyria 3 Synthesized Tracks</p>
                    </div>
                    <a href="/" class="portal-btn">&larr; Command Center</a>
                </header>

                <div class="card">
                    <h2>Live Track Catalog</h2>
                    <table>
                        <tr><th>Track Title</th><th>Artist</th><th>Genre</th><th>Duration</th><th>Action</th></tr>
                        ${tracks ? tracks.map(t => `
                            <tr>
                                <td><b>${t.track_title}</b></td>
                                <td style="color:#cbd5e1;">${t.artist}</td>
                                <td><span style="color:#38bdf8;">${t.genre}</span></td>
                                <td><code>${t.duration}</code></td>
                                <td><button class="play-btn" onclick="alert('Streaming: ${t.track_title}')">▶ Play</button></td>
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

// PAGE 3: 4D PET PROJECT OBSERVATION DECK
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

// SPORTSBOOK LOUNGE ROUTE
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
                header { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.4); display: flex; justify-content: space-between; align-items: center; }
                h1 { color: #22c55e; font-size: 22px; margin-bottom: 4px; }
                p { color: #94a3b8; font-size: 13px; }
                .badge { background: #22c55e; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
                .league-tag { background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid rgba(56, 189, 248, 0.3); display: inline-block; margin-bottom: 4px; }
                .card { background: #111a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                h2 { font-size: 17px; color: #fff; }
                .fixtures-scroll-container { max-height: 600px; overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 16px; }
                .match-box { background: #16221a; border: 1px solid rgba(34,197,94,0.25); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
                .match-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
                .odds-row { display: flex; gap: 8px; flex-wrap: wrap; }
                .bet-btn { background: #1c2b21; border: 1px solid rgba(34,197,94,0.4); border-radius: 8px; padding: 8px 12px; color: #fff; text-align: left; flex: 1; min-width: 110px; }
                .bet-label { font-size: 10px; color: #94a3b8; display: block; text-transform: uppercase; }
                .bet-val { font-size: 15px; font-weight: bold; color: #22c55e; font-family: monospace; display: block; }
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
                            </div>`;
                        }).join('') : ''}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Unified Sovereign Master Engine running on port ${PORT}`);
});
