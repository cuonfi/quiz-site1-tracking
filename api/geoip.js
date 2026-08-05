// Endpoint de geolocalização do servidor para evitar problemas de CORS no frontend.
// Usa os headers automáticos de geolocalização da Vercel (grátis e instantâneo).

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const country = req.headers['x-vercel-ip-country'] || '';
  const region = req.headers['x-vercel-ip-country-region'] || '';
  const city = req.headers['x-vercel-ip-city'] || '';

  // Se estiver na Vercel e for do Brasil, usa os headers da Edge
  if (country === 'BR' && region) {
    return res.status(200).json({
      success: true,
      region_code: region.toUpperCase(),
      city: city ? decodeURIComponent(city) : ''
    });
  }

  // Fallback usando ipwho.is do lado do servidor (evita CORS)
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();
    return res.status(200).json({
      success: true,
      region_code: data.region_code || 'SP',
      city: data.city || ''
    });
  } catch (e) {
    return res.status(200).json({
      success: true,
      region_code: 'SP',
      city: ''
    });
  }
};
