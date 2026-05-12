import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log('Dropping tables...');
  await sql`DROP TABLE IF EXISTS parentage CASCADE`;
  await sql`DROP TABLE IF EXISTS unions CASCADE`;
  await sql`DROP TABLE IF EXISTS persons CASCADE`;
  await sql`DROP TABLE IF EXISTS trees CASCADE`;
  await sql`DROP TABLE IF EXISTS accounts CASCADE`;
  await sql`DROP TABLE IF EXISTS sessions CASCADE`;
  await sql`DROP TABLE IF EXISTS verification_tokens CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`DROP TABLE IF EXISTS "user" CASCADE`;
  await sql`DROP TABLE IF EXISTS "session" CASCADE`;
  await sql`DROP TABLE IF EXISTS "account" CASCADE`;
  await sql`DROP TABLE IF EXISTS "verification" CASCADE`;
  console.log('Tables dropped.');
}

main().catch(console.error);
