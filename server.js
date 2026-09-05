const express = require('express');
const Stripe = require('stripe');
const Parser = require('rss-parser');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const parser = new Parser();

app.use(express.json());
app.use(express.static('public'));

// Level 2: RSS Feed Parsing Endpoint
app.get('/api/deals', async (req, res) => {
  try {
    // RSS deal feed stream (using hotukdeals active deals feed)
    const feedUrl = 'https://www.hotukdeals.com/rss/hot';
    const feed = await parser.parseURL(feedUrl);

    // Extract top 10 deal items into clean format
    const deals = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      snippet: item.contentSnippet || item.title
    }));

    res.json({ success: true, count: deals.length, deals });
  } catch (error) {
    console.error("RSS Parse Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch RSS deals stream." });
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
