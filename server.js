/**
 * ==============================================================================
 * SOVEREIGN BEDDING PLATFORM & BLUEPRINT ENGINE (V6.0)
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
// 1. BEDDING PLATFORM BLUEPRINTS DATABASE SCHEMA
// ==============================================================================
const dbFile = path.join(__dirname, 'bedding_platform.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Bedding Platform Blueprints DB.');
        initializeBeddingPlatformDB();
    }
});

function initializeBeddingPlatformDB() {
    db.serialize(() => {
        // Strict Bedding Architecture & Code Blueprints Table
        db.run(`CREATE TABLE IF NOT EXISTS scavenged_bedding_blueprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            blueprint_title TEXT UNIQUE,
            source_repo TEXT,
            category TEXT,
            raw_code_snippet TEXT,
            status TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM scavenged_bedding_blueprints`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT OR IGNORE INTO scavenged_bedding_blueprints (blueprint_title, source_repo, category, raw_code_snippet, status) VALUES 
                        ('Headless Mattress Configurator Schema', 'github.com/bedding-core/mattress-configurator-v1', 'Product Configurator', 'const firmnessMatrix = { plush: 3, medium: 6, firm: 9 }; function calculateSupport(weight, preference) { return weight * firmnessMatrix[preference]; }', 'READY_TO_INTEGRATE'),
                        ('Shopify Headless Linen Storefront UI Component', 'github.com/linen-labs/react-linen-store', 'Storefront Architecture', 'export const BeddingProductCard = ({ title, threadCount, price }) => (<div className="card"><h3>{title}</h3><span>{threadCount} TC</span><b>\${price}</b></div>);', 'ACTIVE_BLUEPRINT'),
                        ('Memory Foam Density & Thermal Logging Engine', 'github.com/sleep-tech/sleep-telemetry-sqlite', 'Backend Database Schema', 'CREATE TABLE mattress_inventory (sku TEXT, foam_density_kgm3 INTEGER, airflow_rating TEXT, stock_count INTEGER);', 'CORE_ENGINE')`);
                }
            });
        });
    });
}

// ==============================================================================
// 2. TARGETED BEDDING SCAVENGER WEB HOOK
// ==============================================================================
app.post('/api/scavenge-bedding', async (req, res) => {
    try {
        // Highly targeted query strictly for bedding/mattress platform code repositories
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=site:github.com+mattress+configurator+bedding+schema+sleep+tech&hl=en-US&gl=US&ceid=US:en');
        let addedCount = 0;
        
        for (let item of feed.items) {
            db.run(`INSERT OR IGNORE INTO scavenged_bedding_blueprints (blueprint_title, source_repo, category, raw_code_snippet, status) VALUES (?, ?, ?, ?, ?)`,
                [item.title, item.link || 'GitHub Bedding Repository', 'Bedding Architecture', item.contentSnippet || 'Bedding platform component blueprint.', 'RAW_BLUEPRINT'], function(err) {
                    if (this.changes > 0) {
                        addedCount++;
                    }
                });
        }
        
        setTimeout(() => {
            res.status(200).json({ status: 'success', scavenged: addedCount });
        }, 500);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ==============================================================================
// 3. BEDDING PLATFORM ARCHITECT DASHBOARD
// ==============================================================================
app.get('/', (req, res) => {
    db.all(`SELECT * FROM scavenged_bedding_blueprints`, [], (err, blueprints) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Sovereign Bedding Platform & Blueprint Engine</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                .container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 25px; border-radius: 16px; border: 1px solid #262626; border-left: 6px solid #38bdf8; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                h1 { color: #38bdf8; font-size: 24px; margin-bottom: 5px; }
                .badge { background: #38bdf8; color: #000; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; display: inline-block; }
                .section-card { background: #141414; padding: 22px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 15px; }
                .blueprint-item { background: #161616; border: 1px solid #333; padding: 18px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; }
                .code-snip { font-family: monospace; background: #0a0a0a; color: #34d399; padding: 12px; border-radius: 8px; font-size: 12px; border: 1px solid #262626; overflow-x: auto; }
                .action-btn { background: #38bdf8; color: #000; padding: 10px 18px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🛏️ Sovereign Bedding Platform Blueprint Engine</h1>
                        <p>Status: <span class="badge">V6.0 PURE BEDDING ARCHITECTURE</span></p>
                    </div>
                    <button class="action-btn" onclick="triggerScavenger()">🔍 Scavenge Bedding Repos & Schemas</button>
                </header>

                <!-- BLUEPRINTS REGISTRY -->
                <div class="section-card">
                    <h2 style="color:#fff; font-size:18px;">📋 Bedding Platform Blueprints & Architecture Schemas (${blueprints ? blueprints.length : 0})</h2>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${blueprints ? blueprints.map(b => `
                            <div class="blueprint-item">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:#34d399; background:rgba(52,211,153,0.1); padding:3px 10px; border-radius:4px; font-weight:bold;">${b.status}</span>
                                    <span style="font-size:11px; color:#94a3b8;">Source: ${b.source_repo}</span>
                                </div>
                                <h3 style="font-size:16px; color:#fff;">${b.blueprint_title}</h3>
                                <div style="font-size:12px; color:#cbd5e1; font-weight:500;">Category: ${b.category}</div>
                                <div class="code-snip">${b.raw_code_snippet}</div>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
            </div>

            <script>
                async function triggerScavenger() {
                    const btn = document.querySelector('button');
                    btn.innerText = 'Scavenging Bedding Blueprints...';
                    try {
                        const res = await fetch('/api/scavenge-bedding', { method: 'POST' });
                        const data = await res.json();
                        alert('Scavenge finished! Pulled new bedding blueprints: ' + data.scavenged);
                        location.reload();
                    } catch (e) {
                        alert('Error: ' + e.message);
                        btn.innerText = '🔍 Scavenge Bedding Repos & Schemas';
                    }
                }
            </script>
        </body>
        </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Bedding Platform Engine V6.0 running on port ${PORT}`);
});
