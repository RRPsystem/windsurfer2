// Vercel Serverless Function: POST /api/videos/upload-to-supabase
// Upload video to Supabase Storage using service role key

import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // We'll handle the body ourselves for streaming
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('[UploadToSupabase] SUPABASE_SERVICE_ROLE_KEY not configured');
      return res.status(500).json({ 
        error: 'Supabase niet geconfigureerd',
        detail: 'Voeg SUPABASE_SERVICE_ROLE_KEY toe aan Vercel environment variables'
      });
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Collect request body chunks
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const { videoUrl, title, brandId } = body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Geen video URL' });
    }

    console.log('[UploadToSupabase] Downloading video from:', videoUrl.substring(0, 50) + '...');

    // Download video from Shotstack
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status}`);
    }

    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    console.log('[UploadToSupabase] Video size:', Math.round(videoBuffer.length / 1024 / 1024) + 'MB');

    // Generate filename
    const timestamp = Date.now();
    const safeTitle = (title || 'video').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${timestamp}-${safeTitle}.mp4`;
    const filePath = brandId ? `${brandId}/${filename}` : `public/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (error) {
      console.error('[UploadToSupabase] Storage error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('[UploadToSupabase] Uploaded to:', publicUrl);

    // Save metadata to database
    if (brandId) {
      // Generate slug from title
      const slug = (title || 'video').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + timestamp;
      
      const { error: dbError } = await supabase
        .from('brand_videos')
        .insert({
          brand_id: brandId,
          title: title || 'Untitled Video',
          slug: slug,
          video_url: publicUrl,
          status: 'published'
        });

      if (dbError) {
        console.warn('[UploadToSupabase] DB warning:', dbError);
      }
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: filePath
    });

  } catch (error) {
    console.error('[UploadToSupabase] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Upload failed'
    });
  }
}
