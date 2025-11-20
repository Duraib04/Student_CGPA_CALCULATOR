const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TARGET_BASE = 'https://www.ksrceresults.com/';

app.get('/api/results', async (req, res) => {
  const reg = (req.query.reg || '').trim();
  if (!reg) return res.status(400).json({ error: 'Missing reg query parameter' });

  try {
    // Construct a likely URL. If the target site uses a different endpoint this may need adjusting.
    const targetUrl = `${TARGET_BASE}?reg=${encodeURIComponent(reg)}`;

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 15000
    });

    const html = response.data;

    // Try to extract a meaningful result section
    const $ = cheerio.load(html);

    // Heuristics: find elements that look like result tables or containers
    let extracted = '';
    const selectors = ['#result', '.result', '.marks', '#marks', 'table', '.table'];
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el && el.length > 0) {
        extracted = el.prop('outerHTML');
        break;
      }
    }

    // Fallback to full body if nothing found
    if (!extracted) {
      const body = $('body').html() || html;
      extracted = `<div>${body}</div>`;
    }

    // Wrap with a minimal HTML document to make srcdoc rendering reliable
    const wrapped = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Result for ${reg}</title></head><body>${extracted}</body></html>`;

    res.json({ ok: true, html: wrapped });
  } catch (err) {
    console.error('Error fetching target site:', err.message || err);
    res.status(500).json({ ok: false, error: 'Failed to fetch remote result', details: err.message });
  }
});

// Serve the front-end static files when running the server from the project root
app.use(express.static('../'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy server listening on http://localhost:${port}`));
