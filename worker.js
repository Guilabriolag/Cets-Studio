/**
 * LABRIOLAG · Cloudflare Worker — Lightning Checkout
 * 
 * Deploy: wrangler deploy
 * Variáveis de ambiente (wrangler secret put):
 *   BIPA_TOKEN   → Bearer token da Bipa API
 *   BIPA_ADDRESS → seu Lightning Address (ex: labriolag@bipa.app)
 * 
 * Endpoints:
 *   GET  /invoice        → { pr, payment_hash, amount_sat }
 *   GET  /check?hash=... → { paid: bool }
 *   GET  /health         → { ok: true, version: "v12W" }
 */

export default {
  async fetch(request, env, ctx) {
    const url    = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    const cors = {
      'Access-Control-Allow-Origin':  origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Powered-By':                 'LABRIOLAG · lab:// · v12W',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // ── /health ──────────────────────────────────────────
    if (url.pathname === '/health') {
      return json({ ok: true, version: 'v12W', address: env.BIPA_ADDRESS || 'labriolag@bipa.app' }, cors);
    }

    // ── /invoice ─────────────────────────────────────────
    if (url.pathname === '/invoice') {
      const amount_sat = parseInt(url.searchParams.get('sats') || '1');

      try {
        // Opção A: LNURL-pay via Lightning Address
        const [user, domain] = (env.BIPA_ADDRESS || 'labriolag@bipa.app').split('@');
        const lnurlRes = await fetch(`https://${domain}/.well-known/lnurlp/${user}`);
        const lnurlData = await lnurlRes.json();

        if (!lnurlData.callback) throw new Error('LNURL sem callback');

        const msats = amount_sat * 1000;
        const invoiceRes = await fetch(`${lnurlData.callback}?amount=${msats}`);
        const invoiceData = await invoiceRes.json();

        if (!invoiceData.pr) throw new Error('Invoice não gerado');

        // Extrair payment_hash do bolt11 (bytes 1-33 após a parte humana)
        const payment_hash = bolt11Hash(invoiceData.pr);

        // Cachear status de pagamento no Workers KV (se disponível)
        if (env.KV) {
          await env.KV.put(`ln:${payment_hash}`, 'pending', { expirationTtl: 3600 });
        }

        return json({
          pr:           invoiceData.pr,
          payment_hash: payment_hash,
          amount_sat:   amount_sat,
          expires_in:   3600,
          address:      env.BIPA_ADDRESS || 'labriolag@bipa.app',
        }, cors);

      } catch (e) {
        // Fallback: retorna um invoice demo para desenvolvimento
        const demoHash = crypto.randomUUID().replace(/-/g, '');
        return json({
          pr:           'lnbc10n1demo_' + demoHash.slice(0, 20),
          payment_hash: demoHash,
          amount_sat:   1,
          demo:         true,
          error:        e.message,
          address:      env.BIPA_ADDRESS || 'labriolag@bipa.app',
        }, cors);
      }
    }

    // ── /check ───────────────────────────────────────────
    if (url.pathname === '/check') {
      const hash = url.searchParams.get('hash');
      if (!hash) return json({ error: 'hash obrigatório' }, cors, 400);

      try {
        // Verificar via Bipa API se disponível
        if (env.BIPA_TOKEN) {
          const r = await fetch(`https://api.bipa.app/v1/payments/${hash}`, {
            headers: { Authorization: `Bearer ${env.BIPA_TOKEN}` }
          });
          if (r.ok) {
            const d = await r.json();
            const paid = d.status === 'paid' || d.settled === true;
            if (paid && env.KV) {
              await env.KV.put(`ln:${hash}`, 'paid', { expirationTtl: 86400 });
            }
            return json({ paid, status: d.status || 'unknown' }, cors);
          }
        }

        // Fallback: checar KV cache
        if (env.KV) {
          const status = await env.KV.get(`ln:${hash}`);
          return json({ paid: status === 'paid', status: status || 'pending' }, cors);
        }

        // Demo: hash começando com 'demo' → nunca pago (aguarda simulação)
        return json({ paid: false, status: 'pending', demo: true }, cors);

      } catch (e) {
        return json({ paid: false, error: e.message }, cors);
      }
    }

    // ── 404 ──────────────────────────────────────────────
    return json({ error: 'Endpoint não encontrado', routes: ['/health', '/invoice', '/check'] }, cors, 404);
  }
};

// ── Helpers ──────────────────────────────────────────────
function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

// Extrai payment_hash de um bolt11 invoice (simplificado)
function bolt11Hash(pr) {
  try {
    // O payment_hash está nos bytes 1–33 após decodificar o bech32
    // Para uso real, use uma lib bech32 — aqui extraímos como fingerprint
    const stripped = pr.replace('lnbc', '').slice(0, 64);
    return stripped + Math.random().toString(36).slice(2, 10);
  } catch {
    return crypto.randomUUID().replace(/-/g, '');
  }
}
