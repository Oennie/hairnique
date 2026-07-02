export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let body = req.body

  // Parse body if it came in as a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }

  const { to, subject, html, resendKey } = body || {}

  if (!to || !subject || !html || !resendKey) {
    return res.status(400).json({
      error: 'Missing fields',
      received: { to: !!to, subject: !!subject, html: !!html, resendKey: !!resendKey }
    })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hairnique <orders@hairniqueng.com>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      return res.status(response.status).json({ error: data })
    }

    return res.status(200).json({ success: true, id: data.id })

  } catch (err) {
    console.error('Handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
