const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/save-calculation', async (req, res) => {
  const { user_id, expression, result } = req.body;

  if (!user_id || !expression || !result) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { error: insertError } = await supabase.from('calculations').insert([{ user_id, expression, result }]);

    if (insertError) throw insertError;

    const { count, error: countError } = await supabase.from('calculations').select('*', { count: 'exact', head: true }) .eq('user_id', user_id);

    if (countError) throw countError;

    if (count > 10) {
      const { data: recordsToDelete } = await supabase.from('calculations').select('id').eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .range(10, count);

      if (recordsToDelete && recordsToDelete.length > 0) {
        const idsToDelete = recordsToDelete.map(r => r.id);
        await supabase.from('calculations').delete().in('id', idsToDelete);
      }
    }

    res.json({ message: "Saved and history trimmed to 10 records" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/get-history', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) return res.status(400).json({ error: "User ID missing" });

  const { data, error } = await supabase.from('calculations').select('*').eq('user_id', user_id).order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});