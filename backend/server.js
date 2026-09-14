import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import pg from 'pg';
import { generatorTemplates } from './prompt-templates.js';

dotenv.config();
const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const PORT = Number(process.env.PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
if (JWT_SECRET === 'CHANGE_ME_IN_PRODUCTION') console.warn('WARNING: set a strong JWT_SECRET in production.');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: Number(process.env.PG_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});
const q = (text, params=[]) => pool.query(text, params);
const one = async (text, params=[]) => (await q(text, params)).rows[0] || null;
const many = async (text, params=[]) => (await q(text, params)).rows;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
};
const verifyPassword = (password, stored) => {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
  } catch { return false; }
};
const issueToken = (user) => jwt.sign({ sub: user.id, email: user.email, tier: user.tier, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
const getUserById = async (id) => one('SELECT id,email,tier,role,created_at FROM users WHERE id=$1', [id]);
const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || req.cookies?.vexus_access_token;
  if (!token) return res.status(401).json({ error:'AUTH_REQUIRED' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error:'INVALID_SESSION' }); }
};
const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) { try { req.user = jwt.verify(token, JWT_SECRET); } catch {} }
  next();
};
const tierRank = { free:0, essential:1, pro:2 };
const canAccess = (tier, p) => tierRank[tier || 'free'] >= (p.is_pro_only ? 2 : p.is_premium ? 1 : 0);
const estimateTokens = (text) => Math.ceil(String(text || '').trim().split(/\s+/).filter(Boolean).length * 1.5);

async function initDatabase() {
  await q(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS gift_codes (
      code TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      redeemed_by BIGINT REFERENCES users(id),
      redeemed_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category_key TEXT NOT NULL,
      target_ai TEXT NOT NULL,
      intent TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      author TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      sample_output TEXT,
      token_count INTEGER NOT NULL,
      is_premium BOOLEAN NOT NULL DEFAULT FALSE,
      is_pro_only BOOLEAN NOT NULL DEFAULT FALSE,
      copy_count INTEGER NOT NULL DEFAULT 0,
      upvotes INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 4.8
    );
    CREATE TABLE IF NOT EXISTS user_prompt_votes (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      prompt_id TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
      PRIMARY KEY(user_id, prompt_id)
    );
    CREATE TABLE IF NOT EXISTS custom_prompts (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT,
      prompt_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_ref TEXT UNIQUE,
      tier TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function seedPrompts() {
  const count = Number((await one('SELECT COUNT(*)::int AS c FROM prompts')).c);
  if (count >= 2200) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let idCounter = 1;
    const authors = ['@VexusTeam','@Alex_PromptMaster','@Sarah_AI','@ProCodeLab','@MediaGrowth'];
    for (let i=0; i<384; i++) {
      for (const tmpl of generatorTemplates) {
        const prefixArr = tmpl.titlePrefix.ar || tmpl.titlePrefix.en;
        const nicheArr = tmpl.niche.ar || tmpl.niche.en;
        const prefix = prefixArr[i % prefixArr.length];
        const niche = nicheArr[i % nicheArr.length];
        const promptText = tmpl.promptFn(prefix, niche, 'ar');
        await client.query(`INSERT INTO prompts
          (id,title,category_key,target_ai,intent,tags_json,author,prompt_text,sample_output,token_count,is_premium,is_pro_only,copy_count,upvotes,rating)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
          ON CONFLICT (id) DO NOTHING`, [
          `PRM-${String(idCounter).padStart(4,'0')}`,
          `${prefix} - ${niche} #${Math.floor(i / 5) + 1}`,
          tmpl.category, tmpl.targetAI, tmpl.intent, JSON.stringify(tmpl.tags || ['#AI','#Prompt']),
          authors[idCounter % authors.length], promptText, tmpl.sampleOutput, estimateTokens(promptText),
          idCounter > 1000, idCounter > 1300, 200 + (idCounter * 37) % 700,
          20 + (idCounter * 17) % 300, Number((4.7 + ((idCounter * 13) % 30) / 100).toFixed(1))
        ]);
        idCounter++;
      }
    }
    await client.query('COMMIT');
    console.log('Seeded VEXUS prompt library into PostgreSQL.');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy:false }));
app.use((req,res,next)=>{ res.setHeader('Cache-Control','no-store'); next(); });
const buckets = new Map();
app.use('/api', (req,res,next)=>{
  const key = `${req.ip}:${req.path}`; const now=Date.now();
  const b=buckets.get(key)||{start:now,count:0};
  if(now-b.start>60000){b.start=now;b.count=0;} b.count++; buckets.set(key,b);
  if(b.count>120) return res.status(429).json({error:'RATE_LIMITED'}); next();
});
app.use('/api/webhooks/stripe', express.raw({type:'application/json'}));
app.use(express.json({limit:'256kb'}));
app.use(express.urlencoded({extended:false}));

app.get('/api/health', async (_req,res)=>{
  try { await q('SELECT 1'); res.json({ok:true,service:'vexus-backend',version:'2.2.0',database:'postgresql'}); }
  catch { res.status(503).json({ok:false,error:'DATABASE_UNAVAILABLE'}); }
});

app.post('/api/auth/register', async (req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(); const password=String(req.body.password||'');
  if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8) return res.status(400).json({error:'INVALID_CREDENTIALS'});
  try { const r=await q('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id',[email,hashPassword(password)]); const user=await getUserById(r.rows[0].id); res.json({token:issueToken(user),user}); }
  catch { res.status(409).json({error:'EMAIL_ALREADY_EXISTS'}); }
});
app.post('/api/auth/login', async (req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(); const password=String(req.body.password||'');
  const row=await one('SELECT * FROM users WHERE email=$1',[email]);
  if(!row||!verifyPassword(password,row.password_hash)) return res.status(401).json({error:'INVALID_LOGIN'});
  const user=await getUserById(row.id); res.json({token:issueToken(user),user});
});
app.get('/api/me',auth,async(req,res)=>res.json({user:await getUserById(req.user.sub)}));

app.post('/api/redeem',auth,async(req,res)=>{
  const code=String(req.body.code||'').trim().toUpperCase(); const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const row=(await client.query('SELECT * FROM gift_codes WHERE code=$1 AND active=TRUE FOR UPDATE',[code])).rows[0];
    if(!row) throw new Error('INVALID_CODE');
    if(row.redeemed_by && Number(row.redeemed_by)!==Number(req.user.sub)) throw new Error('CODE_ALREADY_REDEEMED');
    await client.query('UPDATE gift_codes SET redeemed_by=$1,redeemed_at=NOW(),active=FALSE WHERE code=$2',[req.user.sub,code]);
    await client.query('UPDATE users SET tier=$1 WHERE id=$2',[row.tier,req.user.sub]);
    await client.query('COMMIT'); const user=await getUserById(req.user.sub); res.json({user,token:issueToken(user)});
  } catch(e) { await client.query('ROLLBACK'); res.status(400).json({error:e.message}); } finally { client.release(); }
});

function mapPrompt(p,tier){return {id:p.id,categoryKey:p.category_key,category:p.category_key,targetAI:p.target_ai,intent:p.intent,tags:JSON.parse(p.tags_json),author:p.author,title:p.title,promptText:canAccess(tier,p)?p.prompt_text:null,sampleOutput:p.sample_output,tokenCount:p.token_count,isPremium:!!p.is_premium,isProOnly:!!p.is_pro_only,copyCount:p.copy_count,upvotes:p.upvotes,rating:p.rating,locked:!canAccess(tier,p)};}
app.get('/api/prompts',optionalAuth,async(req,res)=>{
  const tier=req.user?(await getUserById(req.user.sub))?.tier||'free':'free';
  const qv=String(req.query.q||'').trim(), category=String(req.query.category||'').trim(), targetAI=String(req.query.targetAI||'').trim(), intent=String(req.query.intent||'').trim();
  const limit=Math.min(Math.max(Number(req.query.limit)||120,1),5000); const where=[]; const args=[];
  if(qv){args.push(`%${qv}%`); where.push(`(title ILIKE $${args.length} OR category_key ILIKE $${args.length} OR prompt_text ILIKE $${args.length})`);}
  if(category&&category!=='All'){args.push(category);where.push(`category_key=$${args.length}`);}
  if(targetAI&&targetAI!=='All'){args.push(targetAI);where.push(`target_ai=$${args.length}`);}
  if(intent&&intent!=='All'){args.push(intent);where.push(`intent=$${args.length}`);}
  args.push(limit); const rows=await many(`SELECT * FROM prompts ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY id LIMIT $${args.length}`,args);
  res.json({tier,prompts:rows.map(p=>mapPrompt(p,tier))});
});
app.get('/api/prompts/:id',optionalAuth,async(req,res)=>{
  const p=await one('SELECT * FROM prompts WHERE id=$1',[req.params.id]); if(!p)return res.status(404).json({error:'PROMPT_NOT_FOUND'});
  const tier=req.user?(await getUserById(req.user.sub))?.tier||'free':'free'; if(!canAccess(tier,p))return res.status(403).json({error:'UPGRADE_REQUIRED',requiredTier:p.is_pro_only?'pro':'essential'});
  res.json({prompt:mapPrompt(p,tier)});
});
app.post('/api/prompts/:id/copy',optionalAuth,async(req,res)=>{await q('UPDATE prompts SET copy_count=copy_count+1 WHERE id=$1',[req.params.id]);res.json({ok:true});});
app.post('/api/prompts/:id/vote',auth,async(req,res)=>{
  const exists=await one('SELECT 1 FROM user_prompt_votes WHERE user_id=$1 AND prompt_id=$2',[req.user.sub,req.params.id]);
  if(exists){await q('DELETE FROM user_prompt_votes WHERE user_id=$1 AND prompt_id=$2',[req.user.sub,req.params.id]);await q('UPDATE prompts SET upvotes=GREATEST(upvotes-1,0) WHERE id=$1',[req.params.id]);return res.json({upvoted:false});}
  try{await q('INSERT INTO user_prompt_votes(user_id,prompt_id) VALUES($1,$2)',[req.user.sub,req.params.id]);await q('UPDATE prompts SET upvotes=upvotes+1 WHERE id=$1',[req.params.id]);res.json({upvoted:true});}catch{res.status(400).json({error:'VOTE_FAILED'});}
});
app.post('/api/custom-prompts',auth,async(req,res)=>{const title=String(req.body.title||'').trim(),category=String(req.body.category||'').trim(),promptText=String(req.body.promptText||'').trim();if(!title||!promptText)return res.status(400).json({error:'TITLE_AND_PROMPT_REQUIRED'});const r=await q('INSERT INTO custom_prompts(user_id,title,category,prompt_text) VALUES($1,$2,$3,$4) RETURNING id',[req.user.sub,title,category,promptText]);res.status(201).json({id:r.rows[0].id,title,category,promptText});});
app.get('/api/custom-prompts',auth,async(req,res)=>res.json({prompts:await many('SELECT id,title,category,prompt_text AS "promptText",created_at FROM custom_prompts WHERE user_id=$1 ORDER BY id DESC',[req.user.sub])}));

app.post('/api/copilot',auth,async(req,res)=>{const message=String(req.body.message||'').trim();if(!message)return res.status(400).json({error:'MESSAGE_REQUIRED'});if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'GEMINI_NOT_CONFIGURED'});const model=process.env.GEMINI_MODEL||'gemini-1.5-flash';try{const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:`Act as VEXUS AI Prompt Engineering Co-Pilot. Respond concisely in Arabic unless the user asks for another language. User request:\n${message}`}]}]})});const data=await r.json();if(!r.ok)return res.status(502).json({error:'GEMINI_UPSTREAM_ERROR',detail:data?.error?.message});res.json({reply:data?.candidates?.[0]?.content?.parts?.[0]?.text||'لم يتم توليد رد.'});}catch{res.status(502).json({error:'GEMINI_CONNECTION_FAILED'});}});

app.post('/api/checkout',auth,async(req,res)=>{const tier=String(req.body.tier||'pro').toLowerCase();const prices={essential:{amount:99,name:'VEXUS Essential'},pro:{amount:499,name:'VEXUS Pro'}};const plan=prices[tier];if(!plan)return res.status(400).json({error:'INVALID_PLAN'});if(!process.env.STRIPE_SECRET_KEY)return res.status(503).json({error:'STRIPE_NOT_CONFIGURED'});try{const stripeModule=await import('stripe');const Stripe=stripeModule.default;const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);const user=await getUserById(req.user.sub);const session=await stripe.checkout.sessions.create({mode:'payment',customer_email:user.email,line_items:[{price_data:{currency:'usd',product_data:{name:plan.name},unit_amount:plan.amount},quantity:1}],success_url:process.env.STRIPE_SUCCESS_URL||'http://localhost:8787/?checkout=success',cancel_url:process.env.STRIPE_CANCEL_URL||'http://localhost:8787/?checkout=cancel',metadata:{userId:String(req.user.sub),tier}});await q('INSERT INTO payments(user_id,provider,provider_ref,tier,amount,currency,status) VALUES($1,$2,$3,$4,$5,$6,$7)',[req.user.sub,'stripe',session.id,tier,plan.amount,'usd','pending']);res.json({url:session.url,id:session.id});}catch(e){res.status(502).json({error:'STRIPE_CHECKOUT_FAILED',detail:e.message});}});
app.post('/api/webhooks/stripe',async(req,res)=>{if(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET)return res.status(503).send('Stripe webhook not configured');try{const stripeModule=await import('stripe');const Stripe=stripeModule.default;const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);const event=stripe.webhooks.constructEvent(req.body,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);if(event.type==='checkout.session.completed'){const s=event.data.object,userId=Number(s.metadata?.userId),tier=s.metadata?.tier;if(userId&&tier){await q('UPDATE users SET tier=$1 WHERE id=$2',[tier,userId]);await q('UPDATE payments SET status=\'paid\' WHERE provider_ref=$1',[s.id]);}}res.json({received:true});}catch(e){res.status(400).send(`Webhook Error: ${e.message}`);}});

const admin=(req,res,next)=>{if(!req.user||req.user.role!=='admin')return res.status(403).json({error:'ADMIN_REQUIRED'});next();};
app.get('/api/admin/users',auth,admin,async(_req,res)=>res.json({users:await many('SELECT id,email,tier,role,created_at FROM users ORDER BY id DESC')}));
app.post('/api/admin/gift-codes',auth,admin,async(req,res)=>{const code=String(req.body.code||'').trim().toUpperCase(),tier=String(req.body.tier||'pro');if(!/^[A-Z0-9-]{6,64}$/.test(code)||!tierRank[tier])return res.status(400).json({error:'INVALID_GIFT_CODE'});try{await q('INSERT INTO gift_codes(code,tier) VALUES($1,$2)',[code,tier]);res.status(201).json({code,tier});}catch{res.status(409).json({error:'CODE_EXISTS'});}});
app.get('/api/admin/gift-codes',auth,admin,async(_req,res)=>res.json({codes:await many('SELECT code,tier,active,redeemed_by,redeemed_at FROM gift_codes ORDER BY code')}));

app.use(express.static(FRONTEND,{extensions:['html']}));
app.get('/{*splat}',(req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'NOT_FOUND'});res.sendFile(path.join(FRONTEND,'index.html'));});

async function main(){await initDatabase();await seedPrompts();app.listen(PORT,()=>console.log(`VEXUS backend running on http://localhost:${PORT}`));}
main().catch(err=>{console.error('VEXUS startup failed:',err);process.exit(1);});
