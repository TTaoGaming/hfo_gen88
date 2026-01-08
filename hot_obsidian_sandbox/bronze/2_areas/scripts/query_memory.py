import duckdb
import os

dbs = [
    r"C:\Dev\active\hfo_gen88\hot_obsidian_sandbox\bronze\quarantine\hot_obsidian_sandbox\silver\P6_KRAKEN_KEEPER\kraken.db",
    r"C:\Dev\active\hfo_gen88\hot_obsidian_sandbox\bronze\infra\hot_obsidian_sandbox\bronze\infra\kraken.db"
]

for db_path in dbs:
    print(f"\n=== Analyzing Database: {db_path} ===")
    if not os.path.exists(db_path):
        print("Path does not exist.")
        continue
        
    try:
        con = duckdb.connect(db_path)
        tables = con.execute("PRAGMA show_tables;").fetchall()
        for t in tables:
            t_name = t[0]
            count = con.execute(f"SELECT COUNT(*) FROM {t_name}").fetchone()[0]
            print(f"Table: {t_name} | Rows: {count}")
            if t_name == 'grudges':
                print("  Sample Grudges:")
                samples = con.execute("SELECT type, message FROM grudges LIMIT 10").fetchall()
                for s in samples:
                    print(f"    [{s[0]}] {s[1]}")
            if t_name == 'artifacts' and count > 0:
                print("  Sample Artifact titles:")
                samples = con.execute("SELECT filename FROM artifacts LIMIT 5").fetchall()
                for s in samples:
                    print(f"    - {s[0]}")
        con.close()
    except Exception as e:
        print(f"Error accessing {db_path}: {e}")
