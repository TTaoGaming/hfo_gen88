import duckdb
import sys

db_path = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb'
query = sys.argv[1] if len(sys.argv) > 1 else 'Cold Start Protocol'

con = duckdb.connect(db_path)

# Try FTS if possible, otherwise fallback to LIKE
try:
    # Check if FTS index exists (usually creates tables like fts_main_artifacts_...)
    fts_tables = con.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'fts_%'").fetchall()
    if fts_tables:
        print(f"FTS tables found: {fts_tables}")
        # Example FTS query (adjust based on actual FTS setup if known)
        # results = con.execute(f"SELECT filename, path, score FROM (SELECT *, fts_main_artifacts.match_bm25(id, '{query}') AS score FROM artifacts) WHERE score IS NOT NULL ORDER BY score DESC LIMIT 10").fetchall()
    
    # Fallback to LIKE for now to be safe
    if query.startswith('FILE:'):
        filename = query[5:]
        results = con.execute("SELECT filename, path, content FROM artifacts WHERE filename = ?", (filename,)).fetchall()
        if results:
            print(f"Content of {results[0][0]} ({results[0][1]}):")
            print("-" * 40)
            print(results[0][2])
            print("-" * 40)
        else:
            print(f"File '{filename}' not found.")
    else:
        results = con.execute("SELECT filename, path, era, generation FROM artifacts WHERE content ILIKE ? OR filename ILIKE ? LIMIT 20", (f'%{query}%', f'%{query}%')).fetchall()
        
        if not results:
            print(f"No results found for '{query}'")
        else:
            print(f"Results for '{query}':")
            for row in results:
                print(f"- {row[0]} ({row[1]}) [Era: {row[2]}, Gen: {row[3]}]")

except Exception as e:
    print(f"Error: {e}")
finally:
    con.close()
