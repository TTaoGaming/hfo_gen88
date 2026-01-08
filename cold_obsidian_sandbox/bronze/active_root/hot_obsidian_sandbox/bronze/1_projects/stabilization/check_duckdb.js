import duckdb from 'duckdb';
try {
    const db = new duckdb.Database(':memory:');
    console.log('DUCKDB_CHECK: PASS');
} catch (e) {
    console.error('DUCKDB_CHECK: FAIL - ' + e.message);
}
