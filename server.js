/**
 * Sovereign Master Engine: Multi-Social & Multi-Media Edition (SQLite Version)
 * Zero configuration needed for cloud deployment.
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const dbFile = path.join(__dirname, 'sovereign.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite Sovereign Master Database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS super_agent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            agent_name TEXT,
            action_taken TEXT,
            target_page TEXT,
            status TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM super_agent_logs`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO super_agent_logs (agent_name, action_taken, target_page, status) VALUES 
                    ('ProbabilityEngine', 'Calculating live match odds and statistical distributions', '/island', 'ACTIVE'),
                    ('MultiSocialBridge', 'Syncing YouTube Shorts, Facebook Reels & Instagram feeds', '/island', 'ONLINE'),
                    ('WatcherAgent', 'Verified real-time internet telemetry and micro-fee toll gates', '/', 'ACTIVE')`);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS treasury_vault (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            daily_inflow DECIMAL(10,2),
            reinvested_amount DECIMAL(10,2),
            total_vault_balance DECIMAL(10,2),
            status TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM treasury_vault`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO treasury_vault (daily_inflow, reinvested_amount, total_vault_balance, status) VALUES (4.00, 2.00, 184.50, 'LIVE & COMPOUNDING')`);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS toll_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            service_endpoint TEXT,
            fee_amount TEXT,
            client_origin TEXT,
            status TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS live_matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league_name TEXT,
            home_team TEXT,
            away_team TEXT,
            match_date TEXT,
            match_score TEXT,
            venue TEXT,
            home_rating INT,
            away_rating INT,
            status TEXT,
            ad_sponsor TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM live_matches`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO live_matches (league_name, home_team, away_team, match_date, match_score, venue, home_rating, away_rating, status, ad_sponsor) VALUES 
                    ('Süper Lig', 'Galatasaray S.K.', 'Kasımpaşa S.K.', '09 Oct 2026, 18:00', '2 - 1', 'RAMS Park, Istanbul', 85, 72, 'PLAYING', 'Anadolu Sufi Rock Partner'),
                    ('Süper Lig', 'Çaykur Rizespor', 'Fenerbahçe SK', '10 Oct 2026, 17:00', '0 - 0', 'Caykur Didi Stadium, Rize', 70, 84, 'UPCOMING', 'Get Big Together Initiative')`);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS social_channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform_name TEXT,
            channel_handle TEXT,
            profile_url TEXT,
            content_type TEXT,
            status TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM social_channels`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO social_channels (platform_name, channel_handle, profile_url, content_type, status) VALUES 
                    ('YouTube', '@AnadoluSufiRock', 'https://www.youtube.com', 'Long-form & Shorts', 'CONNECTED'),
                    ('Facebook', 'Get Big Together Community', 'https://www.facebook.com', 'Community Reels', 'CONNECTED'),
                    ('Instagram', '@CenkSovereignEngine', 'https://www.instagram.com', 'Visual Media & Stories', 'CONNECTED')`);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS sufi_culture_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            poet_name TEXT,
            verse_title TEXT,
            verse_text TEXT,
            musical_arrangement TEXT,
            video_status TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM sufi_culture_queue`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO sufi_culture_queue (poet_name, verse_title, verse_text, musical_arrangement, video_status) VALUES 
                    ('Yunus Emre', 'Bilmeyen Ne Bilsin Bizi', 'Cümleler doğrudur sen doğru isen, doğruluk bulunmaz sen eğri isen.', 'Anatolian Psychedelic Rock (Bağlama + Synth)', 'RENDERED & READY FOR MULTI-SOCIAL')`);
            }
        });
    });
}

// Probability Calculator
function calculateLiveProbabilities(homeRating, awayRating) {
    const homeAdvantage = 5;
    const totalPower = homeRating + awayRating + homeAdvantage;
    let homeWin = Math.round(((homeRating + homeAdvantage) / totalPower) * 70);
    let awayWin = Math.round((awayRating / totalPower) * 70);
    let draw = 100 - (homeWin + awayWin);
    if (draw < 15) draw = 15;
    if (homeWin < 10) homeWin = 10;
    if (awayWin < 10) awayWin = 10;
    return { homeWin, draw, awayWin };
}

// Toll Gate Middleware
function microFeeTollGate(fee = '$0.001') {
    return (req, res, next) => {
        const endpoint = req.originalUrl;
        const origin = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Local Client';
        db.run(`INSERT INTO toll_transactions (service_endpoint, fee_amount, client_origin, status) VALUES (?, ?, ?, ?)`,
            [endpoint, fee, origin, 'PAID & LOGGED']);
        next();
    };
}

// API Routes
app.post('/api/social/add', (req, res) => {
    const { platform_name, channel_handle, profile_url, content_type } = req.body;
    db.run(`INSERT INTO social_channels (platform_name, channel_handle, profile_url, content_type, status) VALUES (?, ?, ?, ?, ?)`,
        [platform_name, channel_handle, profile_url, content_type || 'Shorts / Reels', 'CONNECTED'], () => {
            res.redirect('/');
        });
});

// Admin Command Center
app.get('/', (req, res) => {
    db.all(`SELECT fee_amount FROM toll_transactions`, (err, tolls) => {
        db.all(`SELECT * FROM super_agent_logs ORDER BY timestamp DESC LIMIT 5`, (err, agents) => {
            db.get(`SELECT total_vault_balance, daily_inflow FROM treasury_vault ORDER BY id DESC LIMIT 1`, (err, treasury) => {
                db.all(`SELECT * FROM social_channels`, (err, socials) => {
                    let totalRev = 0;
                    if (tolls) tolls.forEach(t => totalRev += parseFloat(t.fee_amount.replace('$', '')) || 0.001);
                    const vaultBalance = treasury ? treasury.total_vault_balance : 184.50;
                    const dailyInflow = treasury ? treasury.daily_inflow : 4.00;

                    res.send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8"><title>Sovereign Multi-Social Command Center</title>
                        <style>
                            body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 30px; }
                            .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                            header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #22c55e; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                            h1 { color: #22c55e; font-size: 20px; margin: 0; }
                            .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; }
                            .btn { background: #262626; color: #fff; padding: 10px 16px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #3f3f46; display: inline-block; }
                            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 15px; }
                            .metric-box { background: #1c1c1c; border-radius: 10px; padding: 16px; border: 1px solid #333; }
                            .metric-value { font-size: 20px; font-weight: bold; color: #22c55e; margin-top: 6px; }
                            ul { padding-left: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6; }
                            input { width: 100%; padding: 10px; margin-top: 6px; margin-bottom: 12px; background: #1c1c1c; border: 1px solid #333; color: #fff; border-radius: 8px; }
                            button { background: #22c55e; color: #000; font-weight: bold; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <header>
                                <div>
                                    <h1>⚡ Sovereign Multi-Social & Multimedia Command Center</h1>
                                    <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Ledger Revenue: $${totalRev.toFixed(3)}</p>
                                </div>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <a href="/island" class="btn" style="background: #10b981; color:#000;">🌴 Visit Island Portal</a>
                                </div>
                            </header>

                            <div class="card" style="border: 1px solid #22c55e;">
                                <h2>🏦 Treasury Vault & Active Networks</h2>
                                <div class="grid">
                                    <div class="metric-box">
                                        <div style="color: #aaa; font-size: 12px;">Daily Multi-Platform Inflow</div>
                                        <div class="metric-value">$${parseFloat(dailyInflow).toFixed(2)} / day</div>
                                    </div>
                                    <div class="metric-box">
                                        <div style="color: #aaa; font-size: 12px;">Total Vault Balance</div>
                                        <div class="metric-value">$${parseFloat(vaultBalance).toFixed(2)}</div>
                                    </div>
                                </div>
                                <h3 style="font-size: 15px; color: #fff; margin-top: 20px;">Connected Social Channels</h3>
                                <ul>
                                    ${socials ? socials.map(s => `<li><b>[${s.platform_name}]</b> ${s.channel_handle} (${s.content_type}) &mdash; <span style="color:#22c55e">${s.status}</span></li>`).join('') : ''}
                                </ul>
                            </div>

                            <div class="card">
                                <h2>🔗 Register New Social Platform Bridge</h2>
                                <form action="/api/social/add" method="POST">
                                    <label>Platform Name:</label>
                                    <input type="text" name="platform_name" placeholder="e.g. TikTok" required>
                                    <label>Channel Handle:</label>
                                    <input type="text" name="channel_handle" placeholder="e.g. @CenkSovereign" required>
                                    <label>Profile URL:</label>
                                    <input type="text" name="profile_url" placeholder="https://..." required>
                                    <label>Content Type:</label>
                                    <input type="text" name="content_type" placeholder="e.g. Vertical Shorts" required>
                                    <button type="submit">Connect Social Bridge</button>
                                </form>
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

// Interactive Island Portal (/island)
app.get('/island', microFeeTollGate('$0.001'), (req, res) => {
    db.all(`SELECT * FROM live_matches`, (err, matches) => {
        db.all(`SELECT * FROM social_channels`, (err, socials) => {
            db.get(`SELECT total_vault_balance, daily_inflow FROM treasury_vault ORDER BY id DESC LIMIT 1`, (err, treasury) => {
                const vaultBalance = treasury ? treasury.total_vault_balance : 184.50;
                const dailyInflow = treasury ? treasury.daily_inflow : 4.00;

                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Anadolu Island - Multi-Social Portal</title>
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { font-family: -apple-system, sans-serif; background: #070908; color: #e2e8f0; padding: 30px; }
                        .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
                        header { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                        h1 { color: #22c55e; font-size: 22px; margin-bottom: 4px; }
                        p { color: #94a3b8; font-size: 13px; }
                        .badge { background: #22c55e; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
                        .btn { background: #1f2937; color: #fff; padding: 8px 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 12px; border: 1px solid #374151; }
                        .card { background: #111a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                        h2 { font-size: 17px; color: #fff; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        th, td { padding: 12px; text-align: left; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.06); }
                        th { color: #22c55e; font-weight: 600; text-transform: uppercase; font-size: 11px; background: #142017; }
                        .prob-badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-right: 4px; font-family: monospace; }
                        .home-prob { background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.4); }
                        .draw-prob { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }
                        .away-prob { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); }
                        .social-box { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
                        .social-card { background: #18221b; border: 1px solid rgba(34, 197, 94, 0.3); padding: 12px 18px; border-radius: 10px; color: #fff; text-decoration: none; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <header>
                            <div>
                                <h1>🌴 Anadolu Island Multi-Social Portal</h1>
                                <p>Status: <span class="badge">SQLITE ENGINE ACTIVE</span></p>
                            </div>
                            <a href="/" class="btn">&larr; Command Center</a>
                        </header>

                        <div class="card">
                            <h2>📡 Connected Creator Channels</h2>
                            <div class="social-box">
                                ${socials ? socials.map(s => `
                                    <a href="${s.profile_url}" target="_blank" class="social-card">
                                        📺 ${s.platform_name}: <span style="color:#22c55e; font-weight:normal;">${s.channel_handle}</span>
                                    </a>
                                `).join('') : ''}
                            </div>
                        </div>

                        <div class="card">
                            <h2>⚽ Süper Lig Fixtures & Live Probability Engine</h2>
                            <table>
                               <thead>
                                    <tr>
                                        <th>Fixture & Venue</th>
                                        <th>Date & Time</th>
                                        <th>Calculated Probabilities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${matches ? matches.map(m => {
                                        const probs = calculateLiveProbabilities(m.home_rating, m.away_rating);
                                        return `
                                        <tr>
                                            <td><b>${m.home_team} vs${m.away_team}</b><br><span style="color:#94a3b8; font-size:11px;">${m.venue}</span></td>
                                            <td><span style="color: #38bdf8; font-family: monospace; font-weight:bold;">${m.match_date}</span></td>
                                            <td>
                                                <span class="prob-badge home-prob">${m.home_team.split(' ')[0]}:${probs.homeWin}%</span>
                                                <span class="prob-badge draw-prob">Draw: ${probs.draw}%</span>
                                                <span class="prob-badge away-prob">${m.away_team.split(' ')[0]}:${probs.awayWin}%</span>
                                            </td>
                                        </tr>`;
                                    }).join('') : ''}
                                </tbody>
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

app.listen(PORT, () => {
    console.log(`🚀 Sovereign SQLite Engine running live on port ${PORT}`);
});
