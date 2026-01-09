import duckdb
import os
import json
from pathlib import Path

def skeletonize_db(db_path, output_file):
    print(f"Skeletonizing: {db_path}")
    try:
        con = duckdb.connect(str(db_path))
        tables = con.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'").fetchall()
        
        with open(output_file, 'a', encoding='utf-8') as f:
            f.write(f"\n# 🏛️ Database Registry: {db_path.name}\n")
            f.write(f"**Physical Path**: `{db_path}`\n\n")
            
            for table in tables:
                table_name = table[0]
                count = con.execute(f"SELECT count(*) FROM {table_name}").fetchone()[0]
                columns = con.execute(f"PRAGMA table_info('{table_name}')").fetchall()
                col_names = [col[1] for col in columns]
                
                f.write(f"## Table: {table_name} (Total Items: {count})\n")
                f.write("### Structural Schema\n| Name | Type | PK |\n| :--- | :--- | :--- |\n")
                for col in columns:
                    f.write(f"| {col[1]} | {col[2]} | {'Yes' if col[5] else 'No'} |\n")
                
                if count > 0:
                    if table_name == 'artifacts':
                        f.write("\n### Full Artifact Identity Manifest (Dense Bones)\n")
                        f.write("| ID | Era | Gen | Filename | CharCount | Created |\n")
                        f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
                        
                        # Fetch all artifact metadata (No content)
                        # Sorting by Era and Generation to show timeline density
                        artifacts = con.execute("""
                            SELECT id, era, generation, filename, char_count, created_at 
                            FROM artifacts 
                            ORDER BY era DESC, generation DESC, created_at DESC
                        """).fetchall()
                        
                        for art in artifacts:
                            # Clean up potential None/Null for markdown
                            row = [str(val).replace('\n', ' ') if val is not None else 'N/A' for val in art]
                            f.write("| " + " | ".join(row) + " |\n")
                        f.write("\n")
                    
                    elif table_name in ['entities', 'relations']:
                        f.write(f"\n### Full {table_name.capitalize()} Identity Manifest\n")
                        res = con.execute(f"SELECT * FROM {table_name}").fetchall()
                        f.write("| " + " | ".join(col_names) + " |\n")
                        f.write("| " + " | ".join(["---"] * len(col_names)) + " |\n")
                        for row in res:
                            f.write("| " + " | ".join([str(val).replace('\n', ' ') for val in row]) + " |\n")
                        f.write("\n")
                    
                    else:
                        f.write("\n### Data Samples (Top 10)\n")
                        res = con.execute(f"SELECT * FROM {table_name} LIMIT 10").fetchall()
                        f.write("| " + " | ".join(col_names) + " |\n")
                        f.write("| " + " | ".join(["---"] * len(col_names)) + " |\n")
                        for row in res:
                            f.write("| " + " | ".join([str(val).replace('\n', ' ') if val is not None else 'N/A' for val in row]) + " |\n")
                        f.write("\n")
                f.write("---\n")
        con.close()
    except Exception as e:
        print(f"Error processing {db_path}: {e}")

def main():
    root_dir = Path("C:/Dev/active/hfo_gen88/cold_obsidian_sandbox")
    output_path = Path("C:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/3_resources/COLD_DATABASES_SKELETON.md")
    
    if output_path.exists():
        os.remove(output_path)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# 🏛️ Cold Database Skeleton Index (Jan 2025 - Present)\n")
        f.write(f"Generated on: {os.popen('date /t').read().strip()}\n")
    
    # Target detected DuckDB files
    targets = [
        Path("C:/Dev/active/hot_obsidian_sandbox/bronze/quarantine/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb"),
        Path("C:/Dev/active/hot_obsidian_sandbox/bronze/quarantine/hfo_kiro_gen85_1767771836257/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb"),
        # Also check current cold sandbox just in case
        Path("C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/bronze/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb")
    ]
    
    for known_db in targets:
        if known_db.exists():
            skeletonize_db(known_db, output_path)
    
    # Search for others in both active and sibling hot sandbox
    search_dirs = [root_dir, Path("C:/Dev/active/hot_obsidian_sandbox")]
    for s_dir in search_dirs:
        if s_dir.exists():
            for db_file in s_dir.rglob("*.duckdb"):
                if db_file not in targets:
                    skeletonize_db(db_file, output_path)

if __name__ == "__main__":
    main()
