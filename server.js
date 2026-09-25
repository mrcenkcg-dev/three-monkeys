/**
 * ==============================================================================
 * SOVEREIGN MASTER ENGINE: GLOBAL BLUEPRINT CATCHER & MUSIC LOUNGE
 * (Autonomous Web Scavenger + Clean Audio Streaming + Human-in-the-Loop Review)
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
// 1. DATABASE SETUP & DISCOVERY SCHEMAS
// ==============================================================================
const dbFile = path.join(__dirname, 'sovereign_master.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to Sovereign Master DB.');
        initializeEngineDatabase();
    }
});

function initializeEngineDatabase() {
    db.serialize(() => {
        // System Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            module_name TEXT,
            status TEXT,
            message TEXT
        )`);

        // Global Blueprint Catcher Table (Stores unclaimed blueprints found from the web for your review)
        db.run(`CREATE TABLE IF NOT EXISTS global_blueprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            blueprint_title TEXT,
            source_url TEXT,
            category TEXT,
            raw_snippet TEXT,
            review_status TEXT DEFAULT 'PENDING_REVIEW'
        )`, () => {
            db.get(`SELECT COUNT(*) as count FROM global_blueprints`, (err, row) => {
                if (row && row.count === 0) {
                    // Seed initial discovered blueprints for immediate inspection
                    db.run(`INSERT INTO global_blueprints (blueprint_title, source_url, category, raw_snippet, review_status) VALUES 
                        ('Open-Source Bedding E-Commerce Storefront Template', 'https://github.com/topics/ecommerce-template', 'Bedding & Retail', 'Node.js Express backend with SQLite product catalog and cart session management.', 'PENDING_REVIEW'),
                        ('Modular Shopify-Style Bedding Product Grid', 'https://developer.mozilla.org', 'UI Layout', 'CSS Grid layout optimized for mattress, pillow, and linen collections with responsive image filters.', 'PENDING_REVIEW'),
                        ('Autonomous Affiliate Link Injector Script', 'https://github.com/topics/affiliate-automation', 'Affiliate Tools', 'Python/Node script for auto-tagging Amazon Associate IDs ([mrcenk20-21]) into product markdown descriptions.', 'PENDING_REVIEW')`);
                }
            });
        });

        // Music & Soundtracks Table (Working Direct MP3 Audio Streams)
        db.run(`CREATE TABLE IF NOT EXISTS music_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            track_title TEXT,
            artist TEXT,
            genre TEXT,
            duration TEXT,
            audio_source TEXT
        )`, () => {
            db.run(`DELETE FROM music_tracks`);
            db.run(`INSERT INTO music_tracks (track_title, artist, genre, duration, audio_source) VALUES 
                ('Uzun İnce Bir Yoldayım (Sufi Ambient Mix)', 'Cenk & Lyria Synth Lab', 'Anatolian Psychedelic Sufi Rock', '3:45', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
                ('Yunus Emre Nefes & Bağlama Groove', 'Anatolian Heritage Ensemble', 'Traditional Sufi Fusion', '4:12', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
                ('Three Monkeys Highway Odyssey', 'Cenk & The Sovereign Crew', 'Anatolian Rock Instrumental', '3:20', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),
                ('Midnight Bosphorus Meditation', 'Sufi Synthesizer Project', 'Ambient Meditation', '5:00', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3')`);
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
// 2. BLUEPRINT SCAVENGER WORKER (Catches blueprints from public web feeds)
// ==============================================================================
app.post('/api/scavenge-web', async (req, res) => {
    const targetFeed = req.body.feed_url || 'https://news.google.com/rss/search?q=open+source+ecommerce+blueprint&hl=en-US&gl=US&ceid=US:en';
    try {
        const feed = await rssParser.parseURL(targetFeed);
        let caughtCount = 0;
        
        for (let item of feed.items.slice(0, 5)) {
            db.run(`INSERT INTO global_blueprints (blueprint_title, source_url, category, raw_snippet, review_status) VALUES (?, ?, ?, ?, ?)`,
                [item.title, item.link || '#', 'Web Discovery', item.contentSnippet || 'Scavenged public repository or article blueprint.', 'PENDING_REVIEW']);
            caughtCount++;
        }
        
        logEvent('BlueprintCatcher', 'SUCCESS', `Scavenged and caught ${caughtCount} external blueprints.`);
        res.status(200).json({ status: 'success', blueprints_caught: caughtCount });
    } catch (err) {
        logEvent('BlueprintCatcher', 'ERROR', `Scavenge failed: ${err.message}`);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ==============================================================================
// 3. PORTAL INTERFACES
// ==============================================================================

// COMMAND CENTER HOME
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Sovereign Master Command Center</title>
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
                    <h1>🐵 Sovereign Master Engine</h1>
                    <p>Status: <span class="status-badge">ONLINE</span> | Blueprint Catcher & Music Lounge Active</p>
                </div>
            </header>

            <div class="grid">
                <div class="card" style="border-left: 4px solid #f59e0b;">
                    <h2>🔍 Global Blueprint Catcher</h2>
                    <p>Inspect unclaimed e-commerce and bedding platform blueprints scavenged from the worldwide web by your background agents.</p>
                    <a href="/blueprints" class="portal-btn" style="background:#f59e0b; color:#000; text-align:center;">Open Blueprint Deck &rarr;</a>
                </div>

                <div class="card" style="border-left: 4px solid #38bdf8;">
                    <h2>🎵 Anatolian Music Lounge</h2>
                    <p>Stream working MP3 audio tracks of Anatolian Psychedelic Sufi Rock while working on your projects.</p>
                    <a href="/musics" class="portal-btn" style="background:#38bdf8; color:#000; text-align:center;">Open Music Lounge &rarr;</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});

// BLUEPRINT INSPECTION DECK
app.get('/blueprints', (req, res) => {
    db.all(`SELECT * FROM global_blueprints ORDER BY id DESC`, [], (err, rows) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Global Blueprint Catcher Deck</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, sans-serif; background: #0b0b0b; color: #f8fafc; padding: 25px; }
                .container { max-width: 1050px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
                header { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; border-left: 5px solid #f59e0b; display: flex; justify-content: space-between; align-items: center; }
                h1 { color: #f59e0b; font-size: 22px; }
                .card { background: #141414; padding: 20px; border-radius: 16px; border: 1px solid #262626; display: flex; flex-direction: column; gap: 15px; }
                .blueprint-box { background: #161616; border: 1px solid #333; padding: 18px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; }
                .snippet { font-family: monospace; font-size: 12px; background: #0a0a0a; padding: 10px; border-radius: 6px; color: #38bdf8; border: 1px solid #262626; }
                .portal-btn { background: #262626; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 13px; border: 1px solid #3f3f46; }
                .scavenge-btn { background: #22c55e; color: #000; border: none; padding: 10px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🔍 Global Blueprint Catcher</h1>
                        <p style="color:#94a3b8; font-size:13px;">Review scavenged unclaimed blueprints & templates for manual integration</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="scavenge-btn" onclick="triggerScavenge()">🌐 Scavenge Web Now</button>
                        <a href="/" class="portal-btn">&larr; Command Center</a>
                    </div>
                </header>

                <div class="card">
                    <h2>Discovered Blueprints (${rows ? rows.length : 0})</h2>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        ${rows ? rows.map(b => `
                            <div class="blueprint-box">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; color:#f59e0b; background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:4px; font-weight:bold;">${b.category}</span>
                                    <span style="font-size:11px; color:#94a3b8;">${b.timestamp}</span>
                                </div>
                                <h3 style="font-size:16px; color:#fff;">${b.blueprint_title}</h3>
                                <div class="snippet">${b.raw_snippet}</div>
                                <a href="${b.source_url}" target="_blank" style="color:#38bdf8; font-size:12px; text-decoration:none;">🔗 Source Reference Link</a>
                            </div>
                        `).join('') : '<p>No blueprints caught yet.</p>'}
                    </div>
                </div>
            </div>

            <script>
                async function triggerScavenge() {
                    const btn = document.event ? document.event.target : document.querySelector('.scavenge-btn');
                    btn.innerText = 'Scavenging Web...';
                    try {
                        const res = await fetch('/api/scavenge-web', { method: 'POST' });
                        const data = await res.json();
                        alert('Scavenge complete! Caught ' + data.blueprints_caught + ' new blueprints.');
                        location.reload();
                    } catch (e) {
                        alert('Scavenge error: ' + e.message);
                        btn.innerText = '🌐 Scavenge Web Now';
                    }
                }
            </script>
        </body>
        </html>
        `);
    });
});

// MUSIC LOUNGE (Direct Working MP3 Streaming Player)
app.get('/musics', (req, res) => {
    db.all(`SELECT * FROM music_tracks ORDER BY id ASC`, [], (err, tracks) => {
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
                .play-btn { background: #38bdf8; color: #000; padding: 6px 14px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
                .play-btn:hover { background: #7dd3fc; }
                .portal-btn { background: #262626; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 13px; border: 1px solid #3f3f46; }
                .player-banner { background: #111c24; border: 1px solid #38bdf8; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <div>
                        <h1>🎵 Anatolian Psychedelic Sufi Rock Lounge</h1>
                        <p style="color:#94a3b8; font-size:13px;">Direct MP3 Audio Player • Bağlama & Synth Tracks</p>
                    </div>
                    <a href="/" class="portal-btn">&larr; Command Center</a>
                </header>

                <div class="card player-banner">
                    <h3 id="current-playing" style="color:#38bdf8; font-size:16px;">▶ Select a track below to play MP3 audio</h3>
                    <audio id="audio-player" controls style="width: 100%;"></audio>
                </div>

                <div class="card">
                    <h2>Track Catalog</h2>
                    <table>
                        <tr><th>Track Title</th><th>Artist</th><th>Genre</th><th>Duration</th><th>Action</th></tr>
                        ${tracks ? tracks.map(t => `
                            <tr>
                                <td><b>${t.track_title}</b></td>
                                <td style="color:#cbd5e1;">${t.artist}</td>
                                <td><span style="color:#38bdf8;">${t.genre}</span></td>
                                <td><code>${t.duration}</code></td>
                                <td><button class="play-btn" onclick="playTrack('${t.audio_source}', '${t.track_title}', '${t.artist}')">▶ Play MP3</button></td>
                            </tr>
                        `).join('') : ''}
                    </table>
                </div>
            </div>

            <script>
                function playTrack(sourceUrl, title, artist) {
                    const player = document.getElementById('audio-player');
                    const banner = document.getElementById('current-playing');
                    banner.innerText = 'Now Playing: ' + title + ' — ' + artist;
                    player.src = sourceUrl;
                    player.play().catch(e => console.log('Playback error:', e));
                }
            </script>
        </body>
        </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sovereign Master Engine running on port ${PORT}`);
});
