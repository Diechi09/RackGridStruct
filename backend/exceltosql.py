import sqlite3
import pandas as pd
from datetime import datetime

EXCEL_FILE = "PJL AW25 Returns COPY.xlsx"
SHEET_NAME = "Ecom ret"
DB_FILE = "inventory.db"

df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME)
df = df[df["EAN"].notna() & df["Rack"].notna()]

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

def get_brand_id(brand_name):
    cursor.execute("SELECT id FROM brands WHERE name = ?", (brand_name,))
    row = cursor.fetchone()
    if row:
        return row[0]
    cursor.execute("INSERT INTO brands (name) VALUES (?)", (brand_name,))
    return cursor.lastrowid

cursor.execute("DELETE FROM inventory")
cursor.execute("DELETE FROM items")

now = datetime.now().isoformat()
seen_eans = set()

for _, row in df.iterrows():
    ean = str(row["EAN"]).strip()
    brand = str(row["Brand"]).strip()
    rollout = str(row["Roll out"]).strip()
    product_group = str(row["Product group"]).strip()
    style_name = str(row["Style name"]).strip()
    color_name = str(row["Color name"]).strip()
    rack_str = str(row["Rack"]).strip()

    # Parse: RACK [BOX]
    parts = rack_str.split()
    rack_full = parts[0]
    box_label = parts[1] if len(parts) == 2 else None
    is_boxed = 1 if box_label else 0

    # Rack & Level extraction from rack_full
    if rack_full.endswith("A"):
        level = "Alto"
        rack = rack_full[:-1]
    elif rack_full.endswith("B"):
        level = "Bajo"
        rack = rack_full[:-1]
    else:
        level = "Alto"
        rack = rack_full

    brand_id = get_brand_id(brand)

    if ean not in seen_eans:
        cursor.execute("""
            INSERT INTO items (ean, brand_id, rollout, product_group, style_name, color_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ean, brand_id, rollout, product_group, style_name, color_name))
        seen_eans.add(ean)

    cursor.execute("""
        INSERT INTO inventory (ean, rack, level, is_boxed, box_label, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (ean, rack, level, is_boxed, box_label, now))

conn.commit()
conn.close()
print("✅ Excel imported with proper rack + level + box label.")
