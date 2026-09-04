import os
import sqlite3
import stripe
from flask import Flask, render_template_string, request, redirect, url_for

app = Flask(__name__)

# Load Stripe live key from Render environment variables
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

def get_db():
    conn = sqlite3.connect('deals.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM deals ORDER BY id DESC")
    deals = cursor.fetchall()
    conn.close()
    
    # HTML Layout matching your Digital Billboard hub
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Three Monkeys Hub 🐒</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 650px; margin: 30px auto; padding: 0 20px; line-height: 1.5; background: #f9f9f9; color: #222; }
            .card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            h1 { font-size: 1.8rem; margin-bottom: 5px; }
            label { font-weight: bold; display: block; margin-top: 10px; }
            input, select { width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
            button { background: #0066cc; color: #fff; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 1rem; margin-top: 15px; width: 100%; font-weight: bold; }
            button:hover { background: #0052a3; }
            .deal { border-bottom: 1px solid #eee; padding: 12px 0; }
            .deal:last-child { border-bottom: none; }
            .tag { background: #eef2f5; font-size: 0.8rem; padding: 3px 8px; border-radius: 4px; color: #555; }
        </style>
    </head>
    <body>
        <h1>Three Monkeys Hub 🐒</h1>
        
        <div class="card">
            <h2>🚀 Add Your Deal / Link (£2.00)</h2>
            <form action="/create-checkout-session" method="POST">
                <label>Offer Title / App Name:</label>
                <input type="text" name="title" placeholder="e.g., Monzo Signup Bonus" required>
                
                <label>Category:</label>
                <select name="category">
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Cashback & Rewards">Cashback & Rewards</option>
                    <option value="Tech & Deals">Tech & Deals</option>
                    <option value="Other">Other</option>
                </select>
                
                <label>Your Referral / Deal Link:</label>
                <input type="url" name="url" placeholder="https://example.com" required>
                
                <button type="submit">Publish Deal To Hub (£2.00)</button>
            </form>
        </div>

        <div class="card">
            <h2>🌐 Live Community Deals</h2>
            {% for deal in deals %}
            <div class="deal">
                <span class="tag">[{{ deal['category'] }}]</span> <strong>{{ deal['title'] }}</strong><br>
                <a href="{{ deal['url'] }}" target="_blank" style="color: #0066cc;">Visit Deal →</a>
            </div>
            {% else %}
            <p style="color: #777;">No live deals posted yet.</p>
            {% endfor %}
        </div>
    </body>
    </html>
    """
    return render_template_string(html, deals=deals)

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    title = request.form.get('title')
    category = request.form.get('category')
    url = request.form.get('url')

    # Create £2.00 Stripe Checkout session
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'gbp',
                'product_data': {'name': f'Digital Billboard Post: {title}'},
                'unit_amount': 200, # 200 pence = £2.00
            },
            'quantity': 1,
        }],
        mode='payment',
        metadata={
            'title': title,
            'category': category,
            'url': url
        },
        success_url='https://free-monkey-system.onrender.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url='https://free-monkey-system.onrender.com/',
    )
    return redirect(session.url, code=303)

@app.route('/success')
def success():
    session_id = request.args.get('session_id')
    if session_id:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            # Save deal to database after successful £2 payment
            title = session.metadata['title']
            category = session.metadata['category']
            url = session.metadata['url']
            
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO deals (title, category, url) VALUES (?, ?, ?)", (title, category, url))
            conn.commit()
            conn.close()
            
    return redirect(url_for('index'))

if __name__ == '__main__':def init_db():
    conn = sqlite3.connect('deals.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            url TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Run DB initialization on startup
init_db()    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
