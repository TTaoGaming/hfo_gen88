import duckdb
import json

db_path = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb'

con = duckdb.connect(db_path)

def get_stats():
    stats = con.execute("""
        SELECT generation, COUNT(*) as count, MIN(created_at) as earliest, MAX(created_at) as latest
        FROM artifacts
        GROUP BY generation
        ORDER BY generation ASC
    """).fetchall()
    
    result = []
    for row in stats:
        result.append({
            "generation": row[0],
            "count": row[1],
            "earliest": str(row[2]),
            "latest": str(row[3])
        })
    return result

print(json.dumps(get_stats(), indent=2))
con.close()
