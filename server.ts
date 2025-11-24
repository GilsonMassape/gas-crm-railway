"app.get('/api/customers', async (req,res)=>{const {rows}=await pool.query('SELECT * FROM public.customers ORDER BY created_at DESC');res.json(rows);});" 
"app.get('/api/templates', async (req,res)=>{const {rows}=await pool.query('SELECT * FROM public.message_templates ORDER BY created_at DESC');res.json(rows);});" 
