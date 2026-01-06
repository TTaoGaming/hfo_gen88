import duckdb from 'duckdb';

const db = new duckdb.Database(':memory:');
const conn = db.connect();

conn.run('CREATE TABLE test (id INTEGER)', (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created successfully');
    conn.run('INSERT INTO test VALUES (1)', (err) => {
      if (err) {
        console.error('Error inserting data:', err);
      } else {
        console.log('Data inserted successfully');
        conn.all('SELECT * FROM test', (err, rows) => {
          if (err) {
            console.error('Error selecting data:', err);
          } else {
            console.log('Data selected successfully:', rows);
          }
        });
      }
    });
  }
});
