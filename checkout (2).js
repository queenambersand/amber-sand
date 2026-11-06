// ==========================================================
// CHECKOUT FUNCTION: POST /api/checkout
// this is the one bit of "server" code on the whole site. it runs free on
// cloudflare pages and creates the stripe checkout page for a cart.
//
// prices are re-figured out HERE from stickers.json, so nobody can
// change what they pay by messing with the page in their browser.
//
// the site itself can live on github pages. just point SITE.checkoutUrl
// in public/site.js at this function's address (see the readme).
// ==========================================================
import data from '../../public/stickers.json';

// countries i'm willing to ship "international" to. add/remove 2-letter codes
const INTL = ['CA','GB','AU','NZ','IE','DE','FR','NL','BE','ES','IT','PT','SE','NO','DK','FI','AT','CH','PL','JP','KR','SG','MX','BR'];


// ---------- who's allowed to use this function ----------
// the cloudflare site itself is always allowed. to let my GITHUB PAGES site
// use it too, add a variable in cloudflare called ALLOWED_ORIGINS with
// the site's address (just the start, no path), like:
//    https://queenambersand.github.io
// (more than one? separate them with commas)
function allowedOrigins(request, env) {
  const own = new URL(request.url).origin;
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return [own, ...extra];
}

// the headers that tell the browser "yes, that website may talk to me"
function corsHeaders(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'origin'
  };
}


// browsers send a quick "is this ok?" check before the real request when a
// different website (github pages) calls us. this answers it
export async function onRequestOptions({ request, env }) {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins(request, env).includes(origin)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}


// ---------- the real checkout request ----------
export async function onRequestPost({ request, env }) {
  const allowed = allowedOrigins(request, env);
  const origin = request.headers.get('origin');

  // a request from a website that isn't on the allowed list = no thanks
  if (origin && !allowed.includes(origin)) {
    return new Response(JSON.stringify({ error: 'not allowed' }), { status: 403 });
  }

  // little helper to send back json (with the cors headers if it's needed)
  const cors = origin ? corsHeaders(origin) : {};
  const json = (b, s = 200) => new Response(JSON.stringify(b), {
    status: s,
    headers: { 'content-type': 'application/json', ...cors }
  });

  // read what the stickers page sent us
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const { items, method } = body, P = data.pricing;
  if (!Array.isArray(items) || !['domestic', 'international', 'pickup'].includes(method)) {
    return json({ error: 'bad request' }, 400);
  }

  // check every sticker is real and count how many total
  let n = 0; const names = [];
  for (const it of items) {
    const s = data.stickers.find(x => x.id === it.id);
    if (!s || !Number.isInteger(it.qty) || it.qty < 1 || it.qty > 100) return json({ error: 'invalid item' }, 400);
    n += it.qty; names.push(`${it.qty} x ${s.name}`);
  }
  if (n < 1 || n > 200) return json({ error: 'invalid quantity' }, 400);

  // the money math (same rules as the stickers page, but the server is the boss)
  const sub = P.first + P.additional * (n - 1);
  const envelopes = Math.ceil(n / P.perEnvelope);
  const summary = names.join(', ').slice(0, 480);

  // where stripe sends people back to after paying / cancelling.
  // it has to be a page on an allowed website, otherwise we use our own stickers page
  let back = new URL('/stickers.html', request.url);
  try {
    const u = new URL(body.returnUrl);
    if (allowed.includes(u.origin)) back = u;
  } catch {}
  back.search = '';
  back.hash = '';

  // build the stripe request
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('success_url', back.toString() + '?success=1');
  p.set('cancel_url', back.toString());
  p.set('metadata[method]', method);
  p.set('metadata[items]', summary);

  // adds one line to the stripe receipt (amount is in cents)
  let i = 0;
  const line = (name, amount, desc) => {
    p.set(`line_items[${i}][quantity]`, '1');
    p.set(`line_items[${i}][price_data][currency]`, 'usd');
    p.set(`line_items[${i}][price_data][unit_amount]`, String(amount));
    p.set(`line_items[${i}][price_data][product_data][name]`, name);
    if (desc) p.set(`line_items[${i}][price_data][product_data][description]`, desc);
    i++;
  };
  line(`stickers (${n})`, sub, summary);

  if (method === 'pickup') {
    // pickup: no address needed, just a phone number so i can set up the handoff
    p.set('phone_number_collection[enabled]', 'true');
    p.set('custom_text[submit][message]', 'Local pickup is coordinated with Amber Sand. You will be contacted to arrange pickup at a show.');
  } else {
    // shipping: add the shipping line + ask for an address in the right countries
    line(`${method} shipping (${envelopes} envelope${envelopes > 1 ? 's' : ''})`, envelopes * P[method]);
    (method === 'domestic' ? ['US'] : INTL).forEach((c, k) => p.set(`shipping_address_collection[allowed_countries][${k}]`, c));
  }

  // send it to stripe (STRIPE_SECRET_KEY is the secret saved in cloudflare, never in the code!)
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: p
  });
  const s = await r.json();
  return s.url ? json({ url: s.url }) : json({ error: 'stripe error' }, 502);
}
