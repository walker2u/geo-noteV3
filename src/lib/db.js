import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;