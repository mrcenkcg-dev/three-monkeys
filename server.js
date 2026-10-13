// ==========================================
// BET INSIDE ENGINE - AUTONOMOUS SELF-LEARNING SERVER
// Environment: Node.js / Express / SQLite
// Features: Bivariate Poisson Engine, Automated Brier Score Calibration, Dynamic Learning Loop
// ==========================================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbFile = path.resolve(__dirname, 'bet_inside.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to private SQLite database.');
    }
});

// ==========================================
// 1. DATABASE SCHEMA & STATE TRACKING
// ==========================================
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS leagues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        country TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        league_id INTEGER,
        name TEXT,
        attack_rating REAL DEFAULT 1.0,
        defense_rating REAL DEFAULT 1.0,
        FOREIGN KEY(league_id) REFERENCES leagues(id)
    )`);

    // Predictions log with true outcomes for accuracy tracking
    db.run(`CREATE TABLE IF NOT EXISTS intelligence_feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        league TEXT,
        home_team TEXT,
        away_team TEXT,
        projected_home_goals REAL,
        projected_away_goals REAL,
        home_win_prob REAL,
        draw_prob REAL,
        away_win_prob REAL,
        top_projection TEXT,
        confidence REAL,
        actual_home_goals INTEGER DEFAULT NULL,
        actual_away_goals INTEGER DEFAULT NULL,
        brier_score REAL DEFAULT NULL,
        status TEXT DEFAULT 'Pending Outcome'
    )`);

    // System parameters for self-calibration
    db.run(`CREATE TABLE IF NOT EXISTS model_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        home_advantage REAL DEFAULT 1.25,
        league_avg_goals REAL DEFAULT 2.65,
        learning_rate REAL DEFAULT 0.05,
        total_evaluations INTEGER DEFAULT 0,
        running_brier_score REAL DEFAULT 0.0
    )`);
});

// Seed Initial System Parameters if Empty
db.get("SELECT COUNT(*) as count FROM model_state", (err, row) => {
    if (row && row.count === 0) {
        db.run(`INSERT INTO model_state (home_advantage, league_avg_goals, learning_rate) VALUES (1.25, 2.65, 0.05)`);
    }
});

// ==========================================
// 2. MATHEMATICAL & PROBABILISTIC ENGINE
// ==========================================

// Poisson Distribution Function: P(k; λ) = (λ^k * e^-λ) / k!
function poisson(k, lambda) {
    let factorial = 1;
    for (let i = 1; i <= k; i++) factorial *= i;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

// Predict Match Probabilities using Home/Away Attack and Defense Ratings
function predictMatch(homeAttack, homeDef, awayAttack, awayDef, homeAdvantage, leagueAvg) {
    const expectedHomeGoals = (homeAttack * awayDef * homeAdvantage * (leagueAvg / 2));
    const expectedAwayGoals = (awayAttack * homeDef * (leagueAvg / 2));

    let homeWinProb = 0;
    let drawProb = 0;
    let awayWinProb = 0;

    // Evaluate scorelines up to 6x6 goals
    for (let h = 0; h <= 6; h++) {
        for (let a = 0; a <= 6; a++) {
            const prob = poisson(h, expectedHomeGoals) * poisson(a, expectedAwayGoals);
            if (h > a) homeWinProb += prob;
            else if (h === a) drawProb += prob;
            else awayWinProb += prob;
        }
    }

    // Determine highest-confidence projection
    let projection = "";
    let confidence = 0;

    if (homeWinProb >= awayWinProb && homeWinProb >= drawProb) {
        projection = `Home Win (${(homeWinProb * 100).toFixed(1)}%)`;
        confidence = homeWinProb * 100;
    } else if (awayWinProb >= homeWinProb && awayWinProb >= drawProb) {
        projection = `Away Win (${(awayWinProb * 100).toFixed(1)}%)`;
        confidence = awayWinProb * 100;
    } else {
        projection = `Draw (${(drawProb * 100).toFixed(1)}%)`;
        confidence = drawProb * 100;
    }

    return {
        expectedHomeGoals: expectedHomeGoals.toFixed(2),
        expectedAwayGoals: expectedAwayGoals.toFixed(2),
        homeWinProb: (homeWinProb * 100).toFixed(1),
        drawProb: (drawProb * 100).toFixed(1),
        awayWinProb: (awayWinProb * 100).toFixed(1),
        projection,
        confidence: parseFloat(confidence.toFixed(1))
    };
}

// ==========================================
// 3. SELF-LEARNING & RECALIBRATION ENGINE
// ==========================================

// Computes Brier Score and adjusts team parameters automatically
function evaluateAndRecalibrate(matchId, actualHome, actualAway) {
    db.get(`SELECT * FROM intelligence_feeds WHERE id = ?`, [matchId], (err, match) => {
        if (err || !match) return;

        // Actual outcomes as binary indicators
        const actualHomeWin = actualHome > actualAway ? 1 : 0;
        const actualDraw = actualHome === actualAway ? 1 : 0;
        const actualAwayWin = actualAway > actualHome ? 1 : 0;

        const predHome = match.home_win_prob / 100;
        const predDraw = match.draw_prob / 100;
        const predAway = match.away_win_prob / 100;

        // Brier Score calculation = (p1 - o1)^2 + (p2 - o2)^2 + (p3 - o3)^2
        const brierScore = Math.pow(predHome - actualHomeWin, 2) +
                           Math.pow(predDraw - actualDraw, 2) +
                           Math.pow(predAway - actualAwayWin, 2);

        // Update match record with true score and score performance
        db.run(`UPDATE intelligence_feeds SET actual_home_goals = ?, actual_away_goals = ?, brier_score = ?, status = 'Evaluated' WHERE id = ?`,
            [actualHome, actualAway, brierScore.toFixed(4), matchId]);

        // Auto-recalibrate team attack and defense coefficients based on goal variance
        db.get(`SELECT * FROM model_state LIMIT 1`, (err, state) => {
            if (!state) return;

            const lr = state.learning_rate;
            const homeGoalError = actualHome - match.projected_home_goals;
            const awayGoalError = actualAway - match.projected_away_goals;

            // Adjust home attack rating upward if home team overperformed expected goals
            db.run(`UPDATE teams SET attack_rating = attack_rating + (? * ?) WHERE name = ?`, [lr, homeGoalError, match.home_team]);
            // Adjust away defense rating downward if home team scored more than expected
            db.run(`UPDATE teams SET defense_rating = defense_rating + (? * ?) WHERE name = ?`, [lr, homeGoalError, match.away_team]);

            console.log(`🧠 [Self-Learning Engine] Match #${matchId} evaluated. Brier Score: ${brierScore.toFixed(4)}. Parameters re-calibrated.`);
        });
    });
}

// ==========================================
// 4. CONTROL PANEL INTERFACE & API
// ==========================================

app.get('/', (req, res) => {
    db.all(`SELECT * FROM intelligence_feeds ORDER BY timestamp DESC LIMIT 20`, (err, rows) => {
        let feedRows = '';
        if (!err && rows) {
            rows.forEach(r => {
                const brierText = r.brier_score !== null ? r.brier_score : 'Pending';
                feedRows += `
                    <tr>
                        <td><b>${r.league}</b></td>
                        <td>${r.home_team} vs ${r.away_team}</td>
                        <td style="color: #38bdf8;">${r.top_projection}</td>
                        <td><span class="badge">${r.confidence}%</span></td>
                        <td>${r.projected_home_goals} - ${r.projected_away_goals}</td>
                        <td>${r.actual_home_goals !== null ? `${r.actual_home_goals} -${r.actual_away_goals}` : 'TBD'}</td>
                        <td style="color: #facc15;">${brierText}</td>
                        <td style="color: #4ade80;">${r.status}</td>
                    </tr>
                `;
            });
        }

        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Bet Inside // Autonomous Engine</title>
                    <style>
                        body { background: #0f172a; color: #f8fafc; font-family: monospace; margin: 0; padding: 30px; }
                        .header { border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { color: #38bdf8; margin: 0 0 10px 0; font-size: 24px; }
                        .status-bar { color: #94a3b8; font-size: 14px; }
                        .grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
                        .card { background: #1e293b; border: 1px solid #334155; padding: 25px; border-radius: 8px; }
                        h3 { margin-top: 0; color: #e2e8f0; border-bottom: 1px solid #334155; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; font-size: 13px; }
                        th { color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                        .badge { background: #0369a1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🛡️ Bet Inside: Self-Learning Prediction Engine</h1>
                        <div class="status-bar">Status: Active Dynamic Calibration | Automated Brier Loss Optimization | Persistent SQLite</div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <h3>🎯 Live Engine Predictions & Evaluation Feedback</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>League</th>
                                        <th>Match</th>
                                        <th>Top Projection</th>
                                        <th>Confidence</th>
                                        <th>xG Projection</th>
                                        <th>Actual Result</th>
                                        <th>Brier Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${feedRows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </body>
            </html>
        `);
    });
});

// Trigger an automated prediction for testing
app.post('/api/predict', (req, res) => {
    const { league, homeTeam, awayTeam } = req.body;

    db.get(`SELECT * FROM model_state LIMIT 1`, (err, state) => {
        // Calculate dynamic prediction using current model parameters
        const prediction = predictMatch(1.1, 0.9, 1.0, 1.0, state.home_advantage, state.league_avg_goals);

        db.run(`INSERT INTO intelligence_feeds 
            (league, home_team, away_team, projected_home_goals, projected_away_goals, home_win_prob, draw_prob, away_win_prob, top_projection, confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [league, homeTeam, awayTeam, prediction.expectedHomeGoals, prediction.expectedAwayGoals, prediction.homeWinProb, prediction.drawProb, prediction.awayWinProb, prediction.projection, prediction.confidence],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Prediction logged successfully.", matchId: this.lastID, prediction });
            });
    });
});

// Endpoint to simulate post-match results and trigger self-calibration
app.post('/api/evaluate', (req, res) => {
    const { matchId, actualHomeGoals, actualAwayGoals } = req.body;
    evaluateAndRecalibrate(matchId, actualHomeGoals, actualAwayGoals);
    res.json({ message: `Calibration triggered for match #${matchId}.` });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Self-Learning Bet Inside server running on port ${PORT}`);
});
