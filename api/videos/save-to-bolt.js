/**
 * API endpoint to save video metadata to Supabase (BOLT)
 * POST /api/videos/save-to-bolt
 * 
 * After video is uploaded to Vercel Blob Storage, this saves the metadata to Supabase
 * so BOLT can display and manage the videos.
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      brand_id,
      trip_id,
      title,
      video_url,
      thumbnail_url,
      duration,
      width,
      height,
      template,
      theme,
      file_size
    } = req.body;

    // Validate required fields
    if (!brand_id) {
      return res.status(400).json({ error: 'brand_id is required' });
    }

    if (!video_url) {
      return res.status(400).json({ error: 'video_url is required' });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[save-to-bolt] Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare video record
    const videoRecord = {
      brand_id,
      trip_id: trip_id || null,
      title: title || 'Untitled Video',
      video_url,
      thumbnail_url: thumbnail_url || null,
      duration: duration || 0,
      width: width || 1920,
      height: height || 1080,
      template: template || null,
      theme: theme || null,
      file_size: file_size || null,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    console.log('[save-to-bolt] Saving video metadata:', {
      brand_id,
      trip_id,
      title,
      video_url: video_url.substring(0, 50) + '...'
    });

    // Insert into Supabase videos table
    const { data, error } = await supabase
      .from('videos')
      .insert([videoRecord])
      .select()
      .single();

    if (error) {
      console.error('[save-to-bolt] Supabase error:', error);
      
      // Check if table doesn't exist
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'Videos table does not exist in Supabase. Please create it first.',
          details: error.message
        });
      }
      
      return res.status(500).json({ error: error.message });
    }

    console.log('[save-to-bolt] Video saved successfully:', data.id);

    return res.status(200).json({
      success: true,
      video: data,
      message: 'Video metadata saved to BOLT'
    });

  } catch (error) {
    console.error('[save-to-bolt] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
