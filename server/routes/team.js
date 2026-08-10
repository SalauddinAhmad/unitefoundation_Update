const router = require('express').Router();
const { z } = require('zod');
const pool = require('../db/pool');
const asyncH = require('../utils/asyncH');
const { uuid } = require('../utils/uid');
const { requireAuth } = require('../middleware/auth');

router.get('/', asyncH(async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM team_members ORDER BY sort_order, created_at');
  res.json(rows);
}));

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  photo: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  email: z.string().optional(),
  order: z.number().optional(),
});

router.post('/', requireAuth, asyncH(async (req, res) => {
  const d = schema.parse(req.body);
  const id = d.id || uuid();
  await pool.execute(
    `INSERT INTO team_members (id,name,role,bio,photo,facebook,linkedin,email,sort_order)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, d.name, d.role, d.bio || null, d.photo || null, d.facebook || null, d.linkedin || null, d.email || null, d.order || 0]
  );
  res.status(201).json({ id });
}));

router.patch('/:id', requireAuth, asyncH(async (req, res) => {
  const d = schema.partial().parse(req.body);
  const map = { ...d };
  
  // Handle field mapping for sort_order
  if ('order' in map) { 
    map.sort_order = map.order; 
    delete map.order; 
  }
  
  delete map.id;
  
  const keys = Object.keys(map);
  if (!keys.length) return res.json({ ok: true });
  
  const setClause = keys.map(k => `\`${k}\`=?`).join(',');
  const values = keys.map(k => map[k]);
  
  const [result] = await pool.execute(
    `UPDATE team_members SET ${setClause} WHERE id=?`, 
    [...values, req.params.id]
  );
  
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Member not found' });
  }
  
  res.json({ ok: true });
}));

router.delete('/:id', requireAuth, asyncH(async (req, res) => {
  await pool.execute('DELETE FROM team_members WHERE id=?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
