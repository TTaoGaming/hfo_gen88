import duckdb
import json

db_path = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb'

con = duckdb.connect(db_path)

def get_schema():
    tables = con.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'").fetchall()
    schema = {}
    for table in tables:
        table_name = table[0]
        columns = con.execute(f"PRAGMA table_info('{table_name}')").fetchall()
        schema[table_name] = [
            {"name": col[1], "type": col[2], "notnull": col[3], "pk": col[5]}
            for col in columns
        ]
    return schema

print(json.dumps(get_schema(), indent=2))
con.close()
