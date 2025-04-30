import sqlite3
import pandas as pd
from datetime import datetime
import os

# === SETTINGS ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # folder of this script
EXCEL_FOLDER = os.path.join(BASE_DIR, "data")          # always points to backend/data
SHEET_NAME = "Ecom ret"
DB_FILE = os.path.join(BASE_DIR, "inventory.db")       # absolute DB path

# === LOAD ALL EXCEL FILES ===
all_data = []

for filename in os.listdir(EXCEL_FOLDER):
    if filename.endswith(".xlsx") and not filename.startswith("~$"):
        filepath = os.path.join(EXCEL_FOLDER, filename)
        print(f"📥 Loading {filename} (sheet: {SHEET_NAME})...")
        df = pd.read_excel(filepath, sheet_name=SHEET_NAME)
        df = df[df["EAN"].notna() & df["Rack"].notna()]
        all_data.append(df)

# Merge all data
if all_data:
    df = pd.concat(all_data, ignore_index=True)
else:
    print("❌ No valid Excel files found. Exiting...")
    exit()

# === CONNECT TO DATABASE ===
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# === HELPER: get or insert brand ===
def get_brand_id(brand_name):
    cursor.execute("SELECT id FROM brands WHERE name = ?", (brand_name,))
    row = cursor.fetchone()
    if row:
        return row[0]
    cursor.execute("INSERT INTO brands (name) VALUES (?)", (brand_name,))
    return cursor.lastrowid

# === CLEAR OLD DATA ===
cursor.execute("DELETE FROM inventory")
cursor.execute("DELETE FROM items")

# === PROCESS ROWS ===
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

    # Determine rack and level
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

    # Insert into items (only once per EAN)
    if ean not in seen_eans:
        cursor.execute("""
            INSERT INTO items (ean, brand_id, rollout, product_group, style_name, color_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ean, brand_id, rollout, product_group, style_name, color_name))
        seen_eans.add(ean)

    # Insert into inventory
    cursor.execute("""
        INSERT INTO inventory (ean, rack, level, is_boxed, box_label, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (ean, rack, level, is_boxed, box_label, now))

# === DONE ===
conn.commit()
conn.close()
print("✅ All Excel files imported successfully!")
