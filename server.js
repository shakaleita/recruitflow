const express=require('express'),Database=require('better-sqlite3');const app=express(),db=new Database(process.env.DB_FILE||'app.db');db.pragma('foreign_keys=ON');db.exec(`CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY,title TEXT NOT NULL,department TEXT,location TEXT,open INTEGER NOT NULL DEFAULT 1);CREATE TABLE IF NOT EXISTS candidates(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,job_id INTEGER NOT NULL REFERENCES jobs(id),stage TEXT NOT NULL DEFAULT 'applied',created_at TEXT DEFAULT CURRENT_TIMESTAMP);CREATE TABLE IF NOT EXISTS interview_notes(id INTEGER PRIMARY KEY,candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,note TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);app.disable('x-powered-by');app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','no-referrer');res.set('X-Frame-Options','DENY');next()});app.use(express.json({limit:'32kb'}));app.use(express.static('public'));

const crypto = require('node:crypto');
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  const required = process.env.API_TOKEN;
  if (!required && process.env.APP_ENV !== 'production') return next();
  if (!required) return res.status(503).json({error:'API authentication must be configured in production'});
  const actual = req.get('x-api-token') || '';
  const expectedBytes = Buffer.from(required, 'utf8');
  const actualBytes = Buffer.from(actual, 'utf8');
  if (expectedBytes.length !== actualBytes.length || !crypto.timingSafeEqual(expectedBytes, actualBytes)) {
    return res.status(401).json({error:'Unauthorized'});
  }
  next();
});

const wrap=fn=>(req,res)=>{try{res.json(fn(req))}catch(e){res.status(400).json({error:e.message})}};
app.get('/api/jobs',wrap(()=>db.prepare('SELECT * FROM jobs ORDER BY id DESC').all()));app.post('/api/jobs',wrap(req=>{if(!req.body.title?.trim())throw Error('Title required');return db.prepare('INSERT INTO jobs(title,department,location) VALUES(?,?,?)').run(req.body.title.trim(),req.body.department||null,req.body.location||null)}));
app.get('/api/candidates',wrap(req=>db.prepare('SELECT candidates.*,jobs.title job FROM candidates JOIN jobs ON jobs.id=candidates.job_id WHERE (? IS NULL OR job_id=?) ORDER BY candidates.id DESC').all(req.query.job_id||null,req.query.job_id||null)));
app.post('/api/candidates',wrap(req=>{const {name,email,job_id}=req.body;if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email||'')||!job_id)throw Error('Name, email and job required');return db.prepare('INSERT INTO candidates(name,email,job_id) VALUES(?,?,?)').run(name.trim(),email,job_id)}));
app.patch('/api/candidates/:id/stage',wrap(req=>{if(!['applied','screening','interview','offer','hired','rejected'].includes(req.body.stage))throw Error('Invalid stage');const r=db.prepare('UPDATE candidates SET stage=? WHERE id=?').run(req.body.stage,req.params.id);if(!r.changes)throw Error('Candidate not found');return {updated:true}}));
app.get('/api/candidates/:id/notes',wrap(req=>db.prepare('SELECT * FROM interview_notes WHERE candidate_id=? ORDER BY id DESC').all(req.params.id)));app.post('/api/candidates/:id/notes',wrap(req=>{if(!req.body.note?.trim())throw Error('Note required');return db.prepare('INSERT INTO interview_notes(candidate_id,note) VALUES(?,?)').run(req.params.id,req.body.note.trim())}));
// Lightweight service introspection: intentionally no secrets or database contents.
app.get('/api/health',(_req,res)=>{try{db.prepare('SELECT 1').get();res.json({status:'ok',service:process.env.npm_package_name||'portfolio-service'})}catch(_e){res.status(503).json({status:'unavailable'})}});
app.get('/api/insights',(_req,res)=>{try{res.json((()=>{ const stages=db.prepare('SELECT stage,COUNT(*) count FROM candidates GROUP BY stage ORDER BY stage').all();const open_jobs=db.prepare('SELECT COUNT(*) n FROM jobs WHERE open=1').get().n;const interviews=db.prepare('SELECT COUNT(*) n FROM interview_notes').get().n;return {candidates_by_stage:stages,open_jobs,interview_notes:interviews}; })())}catch(_e){res.status(500).json({error:'Unable to load insights'})}});
app.use((err,req,res,next)=>{if(err&&err.type==='entity.too.large')return res.status(413).json({error:'Request body too large'});if(err instanceof SyntaxError && 'body' in err)return res.status(400).json({error:'Malformed JSON'});return res.status(500).json({error:'Unexpected server error'})});
app.listen(Number(process.env.PORT)||3000);
