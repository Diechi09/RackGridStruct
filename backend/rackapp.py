from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Connect to your SQLite database
conn = sqlite3.connect("inventory.db", check_same_thread=False)
cursor = conn.cursor()

@app.route("/search")
def search_item():
    ean = request.args.get("ean") or request.args.get("barcode")

    if not ean:
        return jsonify({"error": "EAN parameter is required"}), 400

    cursor.execute("""
        SELECT items.ean, brands.name, items.rollout, items.product_group,
               items.style_name, items.color_name,
               inventory.rack, inventory.level, inventory.last_updated
        FROM items
        JOIN brands ON items.brand_id = brands.id
        JOIN inventory ON inventory.ean = items.ean
        WHERE items.ean = ?
    """, (ean,))
    
    rows = cursor.fetchall()

    if not rows:
        return jsonify({"error": "Item not found"}), 404

    item_data = {
        "ean": rows[0][0],
        "brand": rows[0][1],
        "rollout": rows[0][2],
        "product_group": rows[0][3],
        "style_name": rows[0][4],
        "color_name": rows[0][5],
        "locations": [
            {
                "rack": row[6],
                "level": row[7],
                "last_updated": row[8]
            } for row in rows
        ]
    }

    return jsonify(item_data)

@app.route("/rack")
def rack_items():
    rack = request.args.get("rack")
    level = request.args.get("level", "all")

    query = """
        SELECT i.ean, b.name, i.style_name, i.color_name, i.product_group, i.rollout,
               v.rack, v.level, v.is_boxed, v.box_label
        FROM inventory v
        JOIN items i ON i.ean = v.ean
        JOIN brands b ON i.brand_id = b.id
        WHERE v.rack LIKE ?
    """
    params = [f"{rack}%"]

    if level == "Box":
        query += " AND v.is_boxed = 1"
    elif level in ["Alto", "Bajo"]:
        query += " AND v.level = ?"
        params.append(level)

    cursor.execute(query, params)
    rows = cursor.fetchall()

    result = []
    for row in rows:
        result.append({
            "ean": row[0],
            "brand": row[1],
            "style_name": row[2],
            "color_name": row[3],
            "product_group": row[4],
            "rollout": row[5],
            "rack": row[6],
            "level": row[7],
            "is_boxed": bool(row[8]),
            "box_label": row[9]
        })

    return jsonify(result)

@app.route("/filter")
def filter_items():
    brand = request.args.get("brand")
    rollout = request.args.get("rollout")
    product_group = request.args.get("product_group")
    color_name = request.args.get("color_name")

    query = """
        SELECT items.ean, brands.name, items.rollout, items.product_group,
               items.style_name, items.color_name,
               inventory.rack, inventory.level, inventory.last_updated
        FROM items
        JOIN brands ON items.brand_id = brands.id
        JOIN inventory ON items.ean = inventory.ean
        WHERE 1=1
    """
    params = []

    if brand:
        query += " AND brands.name = ?"
        params.append(brand)
    if rollout:
        query += " AND items.rollout = ?"
        params.append(rollout)
    if product_group:
        query += " AND items.product_group = ?"
        params.append(product_group)
    if color_name:
        query += " AND items.color_name = ?"
        params.append(color_name)

    cursor.execute(query, params)
    rows = cursor.fetchall()

    results = []
    for row in rows:
        results.append({
            "ean": row[0],
            "brand": row[1],
            "rollout": row[2],
            "product_group": row[3],
            "style_name": row[4],
            "color_name": row[5],
            "rack": row[6],
            "level": row[7],
            "last_updated": row[8],
        })

    return jsonify(results)

@app.route("/rack/brand-logos")
def rack_brand_logos():
    cursor.execute("""
        SELECT rack, b.name
        FROM inventory i
        JOIN items it ON i.ean = it.ean
        JOIN brands b ON it.brand_id = b.id
    """)

    from collections import Counter, defaultdict
    rack_brand_count = defaultdict(Counter)

    for rack, brand in cursor.fetchall():
        rack_brand_count[rack][brand] += 1

    # Return most common brand per rack
    result = {}
    for rack, counter in rack_brand_count.items():
        most_common_brand = counter.most_common(1)[0][0]
        result[rack] = most_common_brand

    return jsonify(result)


@app.route("/filters/options")
def filter_options():
    options = {}

    cursor.execute("SELECT name FROM brands ORDER BY name")
    options["brands"] = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT rollout FROM items ORDER BY rollout")
    options["rollouts"] = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT product_group FROM items ORDER BY product_group")
    options["product_groups"] = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT color_name FROM items ORDER BY color_name")
    options["color_names"] = [row[0] for row in cursor.fetchall()]

    return jsonify(options)


if __name__ == "__main__":
    app.run(debug=True)
