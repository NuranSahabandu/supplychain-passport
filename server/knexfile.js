import 'dotenv/config'; // loads the values from .env into process.env

export default {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Return DATE/DATETIME columns as plain text like '2027-12-31'.
    // Without this, mysql2 turns them into JS Date objects in your local
    // timezone (UTC+5:30), and '2027-12-31' can come back as the 30th.
    dateStrings: true,
    timezone: 'Z', // treat stored times as UTC
  },
  migrations: { directory: './src/db/migrations', extension: 'mjs', loadExtensions: ['.mjs'] },
  seeds: { directory: './src/db/seeds', extension: 'mjs', loadExtensions: ['.mjs'] },
};