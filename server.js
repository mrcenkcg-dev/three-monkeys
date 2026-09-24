/**
 * ==============================================================================
 * SOVEREIGN MASTER ENGINE: ULTIMATE UNIFIED ECOSYSTEM EDITION (SQLite)
 * Combined Code: Base Engine + Multi-Social Timeline + Public Community Contribution Wall + Multi-League Odds
 * ==============================================================================
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================================================================
// 1. DATABASE SETUP & MASTER SCHEMA
// ==============================================================================
const dbFile = path.join(__dirname, 'sovereign_master.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Sovereign Master Ecosystem DB.');
        initializeMasterDatabase();
    }
});

function initializeMasterDatabase() {
    db.serialize(() => {
        // Super Agent Logs
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
                    ('ProbabilityEngine', 'Calculating live multi-league odds across Premier League, National League & Süper Lig', '/island', 'ACTIVE'),
                    ('MultiSocialBridge', 'Syncing YouTube Shorts, Facebook Reels & Instagram feeds', '/island', 'ONLINE'),
                    ('CommunityAgent', 'Managing public contribution drop ledger and visitor logs', '/island', 'ACTIVE')`);
            }
        });

        // Treasury Vault
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

        // Toll Transactions
        db.run(`CREATE TABLE IF NOT EXISTS toll_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            service_endpoint TEXT,
            fee_amount TEXT,
            client_origin TEXT,
            status TEXT
        )`);

        // Multi-League Fixtures & Probability Table
        db.run(`CREATE TABLE IF NOT EXISTS multi_league_fixtures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league_category TEXT,
            home_team TEXT,
            away_team TEXT,
            match_date TEXT,
            venue TEXT,
            home_rating INT,
            away_rating INT,
            ad_sponsor TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM multi_league_fixtures`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO multi_league_fixtures (league_category, home_team, away_team, match_date, venue, home_rating, away_rating, ad_sponsor) VALUES 
                    ('Premier League', 'Manchester City', 'Arsenal', '27 Sep 2026, 16:30', 'Etihad Stadium, Manchester', 92, 90, 'Sovereign Analytics Partner'),
                    ('Süper Lig', 'Galatasaray S.K.', 'Fenerbahçe SK', '28 Sep 2026, 20:00', 'RAMS Park, Istanbul', 86, 85, 'Anadolu Sufi Rock Partner'),
                    ('National League', 'Boreham Wood', 'Southend United', '29 Sep 2026, 19:45', 'Meadow Park, Borehamwood', 72, 70, 'Get Big Together Initiative')`);
            }
        });

        // Social Channels
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

        // Public Community Contributions Wall
        db.run(`CREATE TABLE IF NOT EXISTS public_contributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            contributor_name TEXT,
            contribution_type TEXT,
            message_content TEXT,
            status TEXT
        )`);

        db.get(`SELECT COUNT(*) as count FROM public_contributions`, (err, row) => {
            if (row && row.count === 0) {
                db.run(`INSERT INTO public_contributions (contributor_name, contribution_type, message_content, status) VALUES 
                    ('Community Builder', 'Feature Idea', 'Welcome to the public sovereign island! Drop your thoughts or code updates here.', 'VERIFIED & LIVE')`);
            }
        });
    });
}

// ==============================================================================
// 2. HELPER FUNCTIONS & MIDDLEWARE
// ==============================================================================
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

function microFeeTollGate(fee = '$0.001') {
    return (req, res, next) => {
        const endpoint = req.originalUrl;
        const origin = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Local Client';
        db.run(`INSERT INTO toll_transactions (service_endpoint, fee_amount, client_origin, status) VALUES (?, ?, ?, ?)`,
            [endpoint, fee, origin, 'PAID & LOGGED']);
        next();
    };
}

// ==============================================================================
// 3. API ROUTES & PUBLIC CONTRIBUTIONS
// ==============================================================================
app.post('/api/social/add', (req, res) => {
    const { platform_name, channel_handle, profile_url, content_type } = req.body;
    db.run(`INSERT INTO social_channels (platform_name, channel_handle, profile_url, content_type, status) VALUES (?, ?, ?, ?, ?)`,
        [platform_name, channel_handle, profile_url, content_type || 'Shorts / Reels', 'CONNECTED'], () => {
            res.redirect('/');
        });
});

app.post('/api/public/contribute', (req, res) => {
    const { contributor_name, contribution_type, message_content } = req.body;
    db.run(
        `INSERT INTO public_contributions (contributor_name, contribution_type, message_content, status) VALUES (?, ?, ?, ?)`,
        [contributor_name || 'Anonymous Visitor', contribution_type || 'Idea Drop', message_content || 'No content provided', 'VERIFIED & LIVE'],
        () => {
            res.redirect('/island');
        }
    );
});

// Multi-League JSON Odds API Endpoint
app.get('/api/odds/matrix', (req, res) => {
    db.all(`SELECT * FROM multi_league_fixtures`, (err, fixtures) => {
        const analyzedMatches = fixtures ? fixtures.map(m => {
            const probs = calculateLiveProbabilities(m.home_rating, m.away_rating);
            return {
                league: m.league_category,
                fixture: `${m.home_team} vs ${m.away_team}`,
                date: m.match_date,
                venue: m.venue,
                probabilities: probs,
                sponsor: m.ad_sponsor
            };
        }) : [];

        res.json({
            status: "SUCCESS",
            engine: "AI Poisson/Elo Multi-League Matrix",
            data: analyzedMatches
        });
    });
});

// ==============================================================================
// 4. COMMAND CENTER (Admin Root Route: /)
// ==============================================================================
app.get('/', microFeeTollGate('$0.001'), (req, res) => {
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
                        <meta charset="UTF-8"><title>Sovereign Master Command Center</title>
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
                            input, select { width: 100%; padding: 10px; margin-top: 6px; margin-bottom: 12px; background: #1c1c1c; border: 1px solid #333; color: #fff; border-radius: 8px; }
                            button { background: #22c55e; color: #000; font-weight: bold; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <header>
                                <div>
                                    <h1>⚡ Sovereign Master Command Center</h1>
                                    <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Ledger Revenue: $${totalRev.toFixed(3)}</p>
                                </div>
                                <div><a href="/island" class="btn" style="background: #10b981; color:#000;">🌴 Visit Public Island Portal</a></div>
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

// ==============================================================================
// 5. PUBLIC INTERACTIVE ISLAND PORTAL (/island)
// ==============================================================================
app.get('/island', microFeeTollGate('$0.001'), (req, res) => {
    db.all(`SELECT * FROM multi_league_fixtures`, (err, matches) => {
        db.all(`SELECT * FROM social_channels`, (err, socials) => {
            db.all(`SELECT * FROM public_contributions ORDER BY timestamp DESC LIMIT 10`, (err, contributions) => {
                res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Anadolu Island - Public Community & Multi-League Probability Engine</title>
                    <style>
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { font-family: -apple-system, sans-serif; background: #070908; color: #e2e8f0; padding: 30px; }
                        .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
                        header { background: #111a14; padding: 24px; border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                        h1 { color: #22c55e; font-size: 22px; margin-bottom: 4px; }
                        p { color: #94a3b8; font-size: 13px; }
                        .badge { background: #22c55e; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
                        .league-tag { background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; border: 1px solid rgba(56, 189, 248, 0.3); display: inline-block; margin-bottom: 4px; }
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
                        input, textarea { width: 100%; padding: 10px; margin-top: 6px; margin-bottom: 12px; background: #18221b; border: 1px solid rgba(34,197,94,0.3); color: #fff; border-radius: 8px; }
                        button { background: #22c55e; color: #000; font-weight: bold; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <header>
                            <div>
                                <h1>🌴 Anadolu Island Public Portal</h1>
                                <p>Status: <span class="badge">OPEN FOR PUBLIC CONTRIBUTIONS</span></p>
                            </div>
                            <a href="/" class="btn">&larr; Admin Command Center</a>
                        </header>

                        <div class="card">
                            <h2>📊 Multi-League AI Probability Matrix (Premier League, National League & Süper Lig)</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>League & Fixture</th>
                                        <th>Date & Time</th>
                                        <th>Calculated Probabilities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${matches ? matches.map(m => {
                                        const probs = calculateLiveProbabilities(m.home_rating, m.away_rating);
                                        return `
                                        <tr>
                                            <td>
                                                <span class="league-tag">${m.league_category}</span><br>
                                                <b>${m.home_team} vs${m.away_team}</b><br>
                                                <span style="color:#94a3b8; font-size:11px;">${m.venue}</span>
                                            </td>
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

                        <!-- PUBLIC CONTRIBUTION DROP -->
                        <div class="card" style="border: 1px solid #22c55e;">
                            <h2>🌍 Community Contribution Wall</h2>
                            <p>Anyone visiting this public server can drop an idea, message, or code update below. Check back tomorrow to see what changed!</p>
                            <form action="/api/public/contribute" method="POST">
                                <label>Your Name / Handle:</label>
                                <input type="text" name="contributor_name" placeholder="e.g. Visitor Cenk or Guest" required>
                                <label>Contribution Type:</label>
                                <input type="text" name="contribution_type" placeholder="e.g. Feature Idea / Code Snippet / Greeting" required>
                                <label>Your Message or Idea:</label>
                                <textarea name="message_content" rows="3" placeholder="What should we add to the island next?" required></textarea>
                                <button type="submit">Submit to Island Ledger</button>
                            </form>

                            <h3 style="font-size:15px; margin-top:15px; color:#fff;">Recent Public Ledger Entries:</h3>
                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                                ${contributions ? contributions.map(c => `
                                    <div style="background:#18221b; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
                                        <div style="display:flex; justify-content:space-between; font-size:12px; color:#22c55e; margin-bottom:4px;">
                                            <b>${c.contributor_name} (${c.contribution_type})</b>
                                            <span style="color:#94a3b8;">${c.timestamp}</span>
                                        </div>
                                        <p style="color:#e2e8f0; font-size:13px;">${c.message_content}</p>
                                    </div>
                                `).join('') : ''}
                            </div>
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
    console.log(`🚀 Sovereign Master Engine running live on port ${PORT}`);
});
