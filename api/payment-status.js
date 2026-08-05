const PINPAY_TOKEN = process.env.PINPAY_TOKEN;
const PINPAY_BASE  = 'https://api.usepinpay.com/functions/v1/api-v1';
const PAID_STATUSES = ['paid', 'approved'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!PINPAY_TOKEN) {
    return res.status(500).json({ success: false, error: 'PINPAY_TOKEN (sk_live_...) nao configurada nas variaveis do servidor Vercel.' });
  }

  try {
    const tx = req.query?.tx || req.query?.transactionKey || req.query?.code || req.query?.hash || req.query?.id;
    if (!tx) return res.status(400).json({ success: false, error: 'tx (transactionKey/id) obrigatorio' });

    const apiUrl = PINPAY_BASE + '/pix/' + encodeURIComponent(tx);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + PINPAY_TOKEN.trim(),
        'Accept': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[payment-status] PinPay query erro:', response.status, JSON.stringify(data));
      return res.status(502).json({ success: false, error: 'Erro ao consultar status na PinPay', details: data });
    }

    const paymentStatus = String(data.status || '').toLowerCase();
    const paid = PAID_STATUSES.includes(paymentStatus);

    return res.status(200).json({
      success: true,
      paid,
      status: paid ? 'approved' : paymentStatus,
      raw: data
    });
  } catch (err) {
    console.error('[payment-status] ERRO:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
