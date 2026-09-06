const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, 'public')));

// Three Monkeys Amazon Deals API
app.get('/api/deals', (req, res) => {
    res.json([
        {
            title: "Wireless Noise Cancelling Headphones",
            category: "Tech",
            originalPrice: "£149.99",
            dealPrice: "£89.99",
            discount: "40% OFF",
            tag: "mrcenk20-21"
        },
        {
            title: "Smart Watch Fitness Tracker",
            category: "Electronics",
            originalPrice: "£79.99",
            dealPrice: "£45.00",
            discount: "44% OFF",
            tag: "mrcenk20-21"
        },
        {
            title: "Mechanical Gaming Keyboard",
            category: "Gaming",
            originalPrice: "£59.99",
            dealPrice: "£34.99",
            discount: "42% OFF",
            tag: "mrcenk20-21"
        }
    ]);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Three Monkeys Tech Deals Server running on port ${PORT}`);
});
