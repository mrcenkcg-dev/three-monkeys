/**
 * ==============================================================================
 * SOVEREIGN MASTER ENGINE: BEDDING PLATFORM BLUEPRINT SCAVENGER (V5.1)
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
// 1. BEDDING PLATFORM DATABASE & SCAVENGED BLUEPRINTS SCHEMA
// ==============================================================================
const dbFile = path.join(__dirname, 'bedding_platform.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Bedding Platform Sovereign DB.');
        initializeBeddingPlatformDB();
    }
});

function initializeBeddingPlatformDB() {
    db.serialize(() => {
        // Scavenged Raw Blueprints (Unclaimed/Leftover Store Repos & Component Schemas)
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
                        ('Headless Mattress Configurator Schema', 'github.com/unclaimed-repos/bedding-configurator-v1', 'Product Configurator', 'const firmnessMatrix = { plush: 3, medium: 6, firm: 9 }; function calculateSupport(weight, preference) { return weight * firmnessMatrix[preference]; }', 'READY_TO_INTEGRATE'),
                        ('Shopify Headless Bedding Storefront Template', 'github.com/leftover-code/react-linen-store', 'Storefront UI', 'export const BeddingProductCard = ({ title, threadCount, price }) => (<div className=\"card\"><h3>{title}</h3><span>{threadCount} TC</span><b>${price}</b></div>);', 'HALF_FINISHED'),
                        ('Memory Foam Density & Thermal Logging Engine', 'github.com/abandoned-labs/sleep-telemetry-sqlite', 'Backend Database', 'CREATE TABLE mattress_inventory (sku TEXT, foam_density_kgm3 INTEGER, airflow_rating TEXT, stock_count INTEGER);', 'UNCLAIMED_GOLD')`);
                }
            });
        });

        // Active Bedding Store Catalog (Our Finished Platform Inventory)
        db.run(`CREATE TABLE IF NOT EXISTS store_inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT UNIQUE,
            category TEXT,
            price REAL,
            stock_status TEXT,
            image_url TEXT
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM store_inventory`, (err, row) => {
                if (row && row.count === 0) {
                    db.run(`INSERT OR IGNORE INTO store_inventory (item_name, category, price, stock_status, image_url) VALUES 
                        ('Aegean Organic Cotton Percale Sheet Set', 'Bed Sheets', 149.99, 'IN_STOCK', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'),
                        ('Bamboo Charcoal Infused Memory Foam Pillow', 'Pillows', 69.50, 'IN_STOCK', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2'),
                        ('Phase-Change Material Cooling Mattress Topper', 'Mattress Toppers', 219.00, 'LOW_STOCK', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304'),
                        ('Hollow-Fiber Anti-Allergy Duvet Insert', 'Duvets', 125.00, 'IN_STOCK', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b')`);
                }
            });
        });
    });
}

// ==============================================================================
// 2. SCAVENGER WEB HOOK (PULLS REAL GITHUB REPOS & CODE BITS)
// ==============================================================================
app.post('/api/scavenge-bedding', async (req, res) => {
    try {
        const feed = await rssParser.parseURL('https://news.google.com/rss/search?q=site:github.com+mattress+store+bedding+e-commerce+shop&hl=en-US&gl=US&ceid=US:en');
        let addedCount = 0;
        
        for (let item of feed.items) {
            db.run(`INSERT OR IGNORE INTO scavenged_bedding_blueprints (blueprint_title, source_repo, category, raw_code_snippet, status) VALUES (?, ?, ?, ?, ?)`,
                [item.title, item.link || 'GitHub Repository', 'Scavenged Code', item.contentSnippet || 'Unclaimed store template architecture.', 'RAW_SCAVENGED'], function(err) {
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
// 3. COMMAND CENTER & STOREFRONT DASHBOARD
// ==============================================================================
app.get('/', (req, res) => {
    db.all(`SELECT * FROM store_inventory`, [], (err, inventory) => {
        db.all(`SELECT * FROM scavenged_bedding_blueprints`, [], (err, blueprints) => {
            res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Sovereign Bedding Platform & Blueprint Scavenger</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                    .container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                    header { background: #141414; padding: 25px; border-radius: 16px; border: 1px solid #262626; border-left: 6px solid #f59e0b; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
                    h1 { color: #f59e0b; font-size: 24px; margin-bottom: 5px; }
                    .badge { background: #f59e0b; color: #000; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; display: inline-block; }
                    .section-card { background: #141414; padding: 22px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 15px; }
                    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 15px; }
                    .product-box { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
                    .product-img { width: 100%; height: 160px; object-fit: cover; }
                    .product-body { padding: 15px; display: flex; flex-direction: column; gap: 8px; }
                    .price { color: #22c55e; font-weight: bold; font-size: 16px; }
                    .blueprint-item { background: #161616; border: 1px solid #333; padding: 15px; border-radius: 10px; display: flex; flex-direction: column; gap: 8px; }
                    .code-snip { font-family: monospace; background: #0a0a0a; color: #38bdf8; padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid #262626; overflow-x: auto; }
                    .action-btn { background: #f59e0b; color: #000; padding: 10px 18px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; text-decoration: none; display: inline-block; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <header>
                        <div>
                            <h1>🛏️ Sovereign Bedding Store & Blueprint Scavenger</h1>
                            <p>Status: <span class="badge">BUILDING BEDDING PLATFORM</span> | Step 1 in Progress</p>
                        </div>
                        <button class="action-btn" onclick="triggerScavenger()">🌐 Scavenge Real Bedding Repos</button>
                    </header>

                    <!-- STOREFRONT INVENTORY -->
                    <div class="section-card">
                        <h2 style="color:#fff; font-size:18px;">🛒 Finished Bedding Platform Storefront (Amazon Style Catalog)</h2>
                        <div class="grid">
                            ${inventory ? inventory.map(item => `
                                <div class="product-box">
                                    <img src="${item.image_url}" class="product-img" alt="${item.item_name}" />
                                    <div class="product-body">
                                        <span style="font-size:10px; color:#f59e0b; font-weight:bold; text-transform:uppercase;">${item.category}</span>
                                        <h3 style="font-size:15px; color:#fff;">${item.item_name}</h3>                                         <div class="price">$${item.price.toFixed(2)}</div>
                                        <span style="font-size:11px; color:#94a3b8;">Status: ${item.stock_status}</span>
                                    </div>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>

                    <!-- SCAVENGED REPOS & BLUEPRINTS -->
                    <div class="section-card">
                        <h2 style="color:#fff; font-size:18px;">🔍 Scavenged Unclaimed & Leftover Bedding Blueprints (${blueprints ? blueprints.length : 0})</h2>
                        <div style="display:flex; flex-direction:column; gap:12px;">
                            ${blueprints ? blueprints.map(b => `
                                <div class="blueprint-item">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:10px; color:#22c55e; background:rgba(34,197,94,0.1); padding:2px 8px; border-radius:4px; font-weight:bold;">${b.status}</span>
                                        <span style="font-size:11px; color:#94a3b8;">${b.source_repo}</span>
                                    </div>
                                    <h3 style="font-size:15px; color:#fff;">${b.blueprint_title}</h3>
                                    <div class="code-snip">${b.raw_code_snippet}</div>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                </div>

                <script>
                    async function triggerScavenger() {
                        const btn = document.querySelector('button');
                        btn.innerText = 'Scavenging GitHub Repos...';
                        try {
                            const res = await fetch('/api/scavenge-bedding', { method: 'POST' });
                            const data = await res.json();
                            alert('Scavenge finished! Pulled new bedding code bits: ' + data.scavenged);
                            location.reload();
                        } catch (e) {
                            alert('Error: ' + e.message);
                            btn.innerText = '🌐 Scavenge Real Bedding Repos';
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
    console.log(`🚀 Bedding Platform Engine V5 running on port ${PORT}`);
});
