
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgres://postgres:5432@localhost:5432/postgres',
});

async function createDb() {
  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'thebloodonor'");
    if (res.rowCount === 0) {
      console.log("Database 'thebloodonor' does not exist. Creating...");
      await client.query('CREATE DATABASE thebloodonor');
      console.log("Database created successfully.");
    } else {
      console.log("Database 'thebloodonor' already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await client.end();
  }
}

createDb();
