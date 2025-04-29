import sqlite3

conn = sqlite3.connect("inventory.db")
cursor = conn.cursor()

cursor.execute("SELECT * FROM items LIMIT 10")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
