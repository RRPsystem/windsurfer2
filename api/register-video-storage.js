export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const brandId = req.body?.brandId || req.body?.brand_id;
    const videoUrl = req.body?.videoUrl || req.body?.video_url;
    const videoTitle = req.body?.videoTitle || req.body?.video_title;
    const fileSizeBytes = req.body?.fileSizeBytes || req.body?.file_size_bytes;
    const durationSeconds = req.body?.durationSeconds || req.body?.duration_seconds;

    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl required' });
    }

    const authToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || req.headers['x-api-key'];
    if (!authToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return res.status(500).json({
        success: false,
        error: 'SUPABASE_URL not configured'
      });
    }

    const creditEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/deduct-credits`;

    let description = `Video opgeslagen: ${videoUrl}`;
    if (videoTitle) {
      description = `Video "${videoTitle}" opgeslagen`;
    }

    const metadata = {
      brandId,
      videoUrl,
      timestamp: new Date().toISOString()
    };
    if (videoTitle) metadata.videoTitle = videoTitle;
    if (fileSizeBytes) metadata.fileSizeBytes = fileSizeBytes;
    if (durationSeconds) metadata.durationSeconds = durationSeconds;

    const response = await fetch(creditEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        actionType: 'video_storage',
        description,
        metadata
      })
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : { error: await response.text().catch(() => '') };

    if (!response.ok) {
      if (response.status === 402) {
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          required: data.required,
          available: data.available,
          details: data.details
        });
      }

      return res.status(response.status).json({
        success: false,
        error: data.error || 'Failed to deduct credits',
        details: data.details
      });
    }

    return res.status(200).json({
      success: true,
      costCredits: data?.transaction?.credits_deducted,
      creditsRemaining: data?.transaction?.credits_remaining,
      videoUrl,
      transactionId: data?.transaction?.id
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
