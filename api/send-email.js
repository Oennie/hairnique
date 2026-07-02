export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS headers — allow your domain only
  res.setHeader('Access-Control-Allow-Origin', 'https://hairniqueng.com')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { to, subject, html, resendKey } = req.body

  if (!to || !subject || !html || !resendKey) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html, resendKey' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hairnique <orders@contact.hairniqueng.com>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return res.status(response.status).json({ error: data })
    }

    return res.status(200).json({ success: true, id: data.id })

  } catch (err) {
    console.error('Send email handler error:', err)
    return res.status(500).json({ error: err.message })
  }
}
