const express = require('express');
const Stripe = require('stripe');
const Parser = require('rss-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const parser = new Parser();

const AMAZON_AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'mrcenk20-21';

app.use(express.json());
app.use(express.static('public'));

// Level 4: Initialize SQLite Database in Server Memory
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // Deals Storage Table
  db.run(`CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    link TEXT,
    monetizedLink TEXT,
    pubDate TEXT,
    snippet TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Local System Wallet Balance Table
  db.run(`CREATE TABLE IF NOT EXISTS wallet (
    id INTEGER PRIMARY KEY,
    balance REAL DEFAULT 10.00
  )`);

  // Seed default wallet balance of £10.00 if empty
  db.get(`SELECT COUNT(*) as count FROM wallet`, (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO wallet (id, balance) VALUES (1, 10.00)`);
    }
  });
});

// Helper: Transform affiliate links
function attachAffiliateTag(originalUrl) {
  if (!originalUrl) return originalUrl;
  try {
    const url = new URL(originalUrl);
    if (url.hostname.includes('amazon.')) {
      url.searchParams.set('tag', AMAZON_AFFILIATE_TAG);
      return url.toString();
    }
    return originalUrl;
  } catch (err) {
    return originalUrl;
  }
}

// Level 2, 3 & 4: Fetch deals, save to SQLite, deduct micro-fee (£0.01 per run)
app.get('/api/deals', async (req, res) => {
  try {
    const feedUrl = 'https://www.hotukdeals.com/rss/hot';
    const feed = await parser.parseURL(feedUrl);

    // Process deals
    const deals = feed.items.slice(0, 10).map(item => {
      const originalLink = item.link;
      const monetizedLink = attachAffiliateTag(originalLink);
      return {
        title: item.title,
        link: originalLink,
        monetizedLink: monetizedLink,
        pubDate: item.pubDate,
        snippet: item.contentSnippet || item.title
      };
    });

    // Store in SQLite
    const stmt = db.prepare(`INSERT INTO deals (title, link, monetizedLink, pubDate, snippet) VALUES (?, ?, ?, ?, ?)`);
    deals.forEach(deal => {
      stmt.run(deal.title, deal.link, deal.monetizedLink, deal.pubDate, deal.snippet);
    });
    stmt.finalize();

    // Deduct £0.01 micro-fee from system wallet balance
    db.run(`UPDATE wallet SET balance = balance - 0.01 WHERE id = 1`);

    // Fetch updated wallet balance
    db.get(`SELECT balance FROM wallet WHERE id = 1`, (err, row) => {
      const currentBalance = row ? parseFloat(row.balance).toFixed(2) : "10.00";

      res.json({
        success: true,
        monetizationTag: AMAZON_AFFILIATE_TAG,
        walletBalanceGBP: `£${currentBalance}`,
        count: deals.length,
        deals
      });
    });

  } catch (error) {
    console.error("RSS/DB Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to process RSS deals stream." });
  }
});

// Level 1: Stripe Payment Endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("ERROR: STRIPE_SECRET_KEY is missing!");
      return res.status(500).json({ error: "Stripe key is not configured." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Test Placement' },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
