import sqlite3

conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS inventory")
cursor.execute("DROP TABLE IF EXISTS items")
cursor.execute("DROP TABLE IF EXISTS brands")

cursor.execute("""
CREATE TABLE brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
)
""")

cursor.execute("""
CREATE TABLE items (
    ean TEXT PRIMARY KEY,
    brand_id INTEGER,
    rollout TEXT,
    product_group TEXT,
    style_name TEXT,
    color_name TEXT,
    FOREIGN KEY (brand_id) REFERENCES brands(id)
)
""")

cursor.execute("""
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ean TEXT,
    rack TEXT,
    level TEXT,
    is_boxed INTEGER DEFAULT 0,
    box_label TEXT,
    last_updated TEXT,
    FOREIGN KEY (ean) REFERENCES items(ean)
)
""")

conn.commit()
conn.close()
print("✅ Database initialized with box_label.")
