export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE = 'appNZ83jkxz5JQgEE';
  if (!TOKEN) return res.status(500).json({ error: 'AIRTABLE_TOKEN not set' });

  const tables = {
    mentores: 'tbl4z4J4G0l9fU8kd',
    startups: 'tblEkbqUT03SoLQUY',
    eventos: 'tblovE0Ga2S2qhVxL',
    solicitudes: 'tblkkwjbiNnY3mZ8B',
    usuarios: 'tblVFVmfcqNS6xYKp',
    reuniones: 'tblgzlkV38z38u3sb'
  };

  if (req.method === 'GET') {
    try {
      const data = {};
      for (const [key, tableId] of Object.entries(tables)) {
        let all = [];
        let offset = null;
        do {
          const url = `https://api.airtable.com/v0/${BASE}/${tableId}?pageSize=100${offset ? '&offset=' + offset : ''}`;
          const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
          const j = await r.json();
          if (j.records) all = all.concat(j.records);
          offset = j.offset || null;
        } while (offset);
        data[key] = all;
      }
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { table, fields } = req.body;
      const tableId = tables[table];
      if (!tableId) return res.status(400).json({ error: 'Unknown table: ' + table });
      const r = await fetch(`https://api.airtable.com/v0/${BASE}/${tableId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });
      const j = await r.json();
      return res.status(200).json(j);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
