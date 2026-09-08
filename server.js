const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.send('Server Active - Three Monkeys is running!');
});

// Existing routes
app.get(['/v', '/v1', '/make-video'], (req, res) => {
  res.json({ status: 'success', message: 'Video endpoint ready' });
});

app.get('/api/deals', (req, res) => {
  res.json({ status: 'success', deals: [] });
});

// YouTube OAuth Auth Route
app.get('/auth/youtube', (req, res) => {
  const redirectUri = 'https://free-monkey-system.onrender.com/oauth2callback';
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const scope = 'https://www.googleapis.com/auth/youtube.upload';

  if (!clientId) {
    return res.status(400).send('Error: YOUTUBE_CLIENT_ID environment variable is missing on Render.');
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(authUrl);
});

// OAuth Callback Route
app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;
  if (code) {
    res.send('<h1>Authentication Successful!</h1><p>Your YouTube account is now connected to Render.</p>');
  } else {
    res.status(400).send('Authentication failed: No code returned.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
