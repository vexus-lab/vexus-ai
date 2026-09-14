import 'dotenv/config';
import crypto from 'node:crypto';
import pg from 'pg';
const { Pool } = pg;
if(!process.env.DATABASE_URL){console.error('DATABASE_URL is required.');process.exit(1);}
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
const q=(text,params=[])=>pool.query(text,params);
const hashPassword=(password)=>{const salt=crypto.randomBytes(16).toString('hex');const key=crypto.scryptSync(password,salt,64).toString('hex');return `${salt}:${key}`;};
await q(`CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,tier TEXT NOT NULL DEFAULT 'free',role TEXT NOT NULL DEFAULT 'user',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE TABLE IF NOT EXISTS gift_codes (code TEXT PRIMARY KEY,tier TEXT NOT NULL,active BOOLEAN NOT NULL DEFAULT TRUE,redeemed_by BIGINT REFERENCES users(id),redeemed_at TIMESTAMPTZ);`);
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();const password=process.env.ADMIN_PASSWORD;
if(email&&password){const exists=(await q('SELECT id FROM users WHERE email=$1',[email])).rows[0];if(!exists)await q('INSERT INTO users(email,password_hash,tier,role) VALUES($1,$2,$3,$4)',[email,hashPassword(password),'pro','admin']);console.log(`Admin ready: ${email}`);}
const codes=(process.env.SEED_GIFT_CODES||'').split(',').map(s=>s.trim()).filter(Boolean);
for(const code of codes)await q('INSERT INTO gift_codes(code,tier) VALUES($1,$2) ON CONFLICT (code) DO NOTHING',[code,'pro']);
if(codes.length)console.log(`Seeded ${codes.length} gift code(s).`);
await pool.end();
