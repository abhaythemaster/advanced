// MasterHub sitemap: lists the main pages and every PUBLISHED project.
// The Supabase URL and public key below are the same public values the website uses.
// If the database cannot be reached, the main pages are still listed.
const SUPABASE_URL = 'https://dsugnnwlzojbqnunczld.supabase.co';
const ANON_KEY = 'sb_publishable_1r_WwTpDAHkpx3iOtbD1GQ_pJzWyJyA';
const BASE = 'https://abhaythemasterhub.vercel.app';
const PAGES = ['/', '/discover', '/updates', '/support', '/about', '/faq', '/contact', '/privacy-policy', '/terms-and-conditions', '/copyright', '/licenses'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  let rows = [];
  if (SUPABASE_URL && ANON_KEY && !SUPABASE_URL.startsWith('__')) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=slug,updated_at&status=eq.published&order=updated_at.desc&limit=1000`, { headers: { apikey: ANON_KEY } });
      if (r.ok) rows = await r.json();
    } catch (e) { rows = []; }
  }
  const urls = PAGES.map((p) => `  <url><loc>${esc(BASE + p)}</loc></url>`);
  for (const p of Array.isArray(rows) ? rows : []) {
    if (!p || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug || '')) continue;
    const d = p.updated_at ? new Date(p.updated_at) : null;
    urls.push(`  <url><loc>${esc(`${BASE}/project/${p.slug}`)}</loc>${d && !isNaN(d) ? `<lastmod>${d.toISOString()}</lastmod>` : ''}</url>`);
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
};

