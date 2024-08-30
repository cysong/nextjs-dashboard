import pool from "../lib/mysql";

import bcrypt from 'bcrypt';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

async function seedUsers() {
    await executeQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    const insertedUsers = await Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return executeQuery(`
          INSERT INTO users (id, name, email, password)
          VALUES (?, ?, ?, ?)
          ON CONFLICT (id) DO NOTHING;
        `, [user.id, user.name, user.email, hashedPassword]);
        })
    );

    return insertedUsers;
}



async function executeQuery(query: string, params: any[] = []) {
    const db = await pool.getConnection();
    try {
        const [result] = await db.execute(query, params);
        return result;
    } finally {
        db.release();
    }
}

await seedUsers();
