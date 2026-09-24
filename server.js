.form-badge { background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-block; border: 1px solid rgba(34, 197, 94, 0.3); }
                .lore { font-style: italic; color: #94a3b8; font-size: 12px; margin-top: 4px; border-left: 2px solid #eab308; padding-left: 8px; }
                .portal-btn { background: #262626; color: #fff; padding: 10px 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 12px; border: 1px solid #3f3f46; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🎴 Anadolu Sovereign - Football Card Collection</h1>
                        <p>Status: <span class="badge">MYTHIC SOVEREIGN VAULT ACTIVE</span></p>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <a href="/" class="portal-btn">&larr; Command Center</a>
                        <a href="/island" class="portal-btn" style="background: #22c55e; color: #000; border-color: #22c55e;">⚽ Sportsbook</a>
                    </div>
                </header>

                <div class="card" style="background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px;">
                    <h2 style="color:#fff; font-size:17px; margin-bottom:4px;">✨ Legend Cards & Living Modifiers</h2>
                    <p style="color:#94a3b8; font-size:13px;">Historical icons calibrated with autonomous sovereign form ratings and acoustic resonance lore.</p>
                    
                    <div class="card-grid">
                        ${cards ? cards.map(c => `
                        <div class="trading-card">
                            <div class="card-header">
                                <div>
                                    <span class="tier">${c.rarity_tier}</span>
                                    <b style="font-size:16px; color:#fff; display:block; margin-top:2px;">${c.player_name}</b>
                                </div>
                                <div class="rating">${c.power_rating}</div>
                            </div>
                            <div class="card-body">
                                <span>🌍 <b>Team/Country:</b> ${c.team_country}</span>
                                <span>⏳ <b>Era:</b> ${c.era_year}</span>
                                <div><span class="form-badge">⚡ ${c.training_form}</span></div>
                                <div class="lore">"${c.lore_quote}"</div>
                            </div>
                        </div>`).join('') : ''}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `);
    });
});

// ==============================================================================
// 7. AUTONOMOUS 4D SANDBOX ROUTE (/pet-project)
// ==============================================================================
app.get('/pet-project', (req, res) => {
    db.all(`SELECT * FROM learning_cycles ORDER BY timestamp DESC LIMIT 10`, [], (err, cycles) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Anadolu Island - Autonomous 4D Sandbox</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #070908; color: #e2e8f0; padding: 30px; }
                .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
                header { background: #181022; padding: 24px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.4); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                h1 { color: #a855f7; font-size: 22px; margin-bottom: 4px; }
                p { color: #94a3b8; font-size: 13px; }
                .badge { background: #a855f7; color: #fff; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 11px; }
                .card { background: #141414; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { text-align: left; padding: 10px; border-bottom: 1px solid #262626; font-size: 13px; }
                th { color: #94a3b8; }
                .portal-btn { background: #262626; color: #fff; padding: 10px 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 12px; border: 1px solid #3f3f46; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🐾 Autonomous 4D Sandbox & Living Pulse</h1>
                        <p>Status: <span class="badge">SANDBOX SIMULATION RUNNING</span></p>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <a href="/" class="portal-btn">&larr; Command Center</a>
                        <a href="/island" class="portal-btn" style="background: #22c55e; color: #000; border-color: #22c55e;">⚽ Sportsbook</a>
                    </div>
                </header>

                <div class="card">
                    <h2 style="color:#fff; font-size:17px; margin-bottom:12px;">🧬 Autonomous Learning Cycles & Agent Hypotheses</h2>
                    <p style="color:#94a3b8; font-size:13px; margin-bottom:12px;">Simulates background agent self-optimization every 20 minutes to keep your live Render deployment adaptive.</p>
                    <table>
                        <tr><th>Cycle #</th><th>Experiment Title</th><th>Status</th><th>Agent Hypothesis</th><th>Result</th><th>Timestamp</th></tr>
                        ${cycles ? cycles.map(c => `
                        <tr>
                            <td><b>#${c.learning_cycle}</b></td>
                            <td>${c.experiment_title}</td>
                            <td><span style="color:#22c55e;">${c.approval_status}</span></td>
                            <td style="color:#cbd5e1;">${c.agent_hypothesis}</td>
                            <td style="color:#38bdf8;">${c.sandbox_result}</td>
                            <td style="color:#94a3b8; font-size:11px;">${c.tested_at}</td>
                        </tr>`).join('') : ''}
                    </table>
                </div>
            </div>
        </body>
        </html>
        `);
    });
});

// ==============================================================================
// 8. SERVER LISTENER START
// ==============================================================================
app.listen(PORT, () => {
    console.log(`🚀 Sovereign Master Engine v10.0 successfully live on port ${PORT}`);
    logEvent('Server', 'STARTUP', `Master Engine active and listening on port ${PORT}`);
});
