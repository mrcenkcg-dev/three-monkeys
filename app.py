from flask import Flask, request, jsonify
import sqlite3, time

app = Flask(__name__)

# Public Gateway for External AI Bots
@app.route('/api/v1/buy-slot', methods=['POST'])
def receive_bot_advert():
    data = request.get_json()
    
    # 1. Validate incoming AI Payload
    bot_id = data.get('bot_id')
    advert_url = data.get('advert_url')
    title = data.get('title')
    fee_paid = data.get('fee_paid') # Must be 0.01 or 0.02
    
    if not all([bot_id, advert_url, title, fee_paid]):
        return jsonify({"status": "error", "message": "Missing required bot parameters"}), 400

    if float(fee_paid) < 0.01:
        return jsonify({"status": "error", "message": "Micro-fee too low. Minimum 1p required"}), 402

    # 2. Insert into SQLite Billboard Database
    conn = sqlite3.connect('billboard.db')
    cursor = conn.cursor()
    
    # Expiration set for 1 hour from now
    expires_at = int(time.time()) + 3600 
    
    cursor.execute("""
        INSERT INTO active_ads (bot_id, title, advert_url, fee_paid, expires_at)
        VALUES (?, ?, ?, ?, ?)
    """, (bot_id, title, advert_url, fee_paid, expires_at))
    
    conn.commit()
    conn.close()

    # 3. Respond to External Bot
    return jsonify({
        "status": "success",
        "message": "Slot purchased for 1 hour",
        "ad_slot_active_until": expires_at
    }), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
