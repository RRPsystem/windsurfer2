// Production config for Vercel deployment
// Public anon key is safe to expose client-side. Do NOT put service role keys here.
window.BOLT_DB = {
  url: "https://huaaogdxxdcakxryecnw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzY3MzMsImV4cCI6MjA3NDIxMjczM30.EqZK_6xjEAVwUtsYj6nENe4x8-7At_oRAVsPMDvJBSI"
};

// Load media API keys from environment (Vercel)
(async function loadMediaConfig() {
  try {
    const response = await fetch('/api/config/media');
    if (response.ok) {
      const config = await response.json();
      window.MEDIA_CONFIG = window.MEDIA_CONFIG || {};
      if (config.pexelsKey) window.MEDIA_CONFIG.pexelsKey = config.pexelsKey;
      if (config.unsplashKey) window.MEDIA_CONFIG.unsplashKey = config.unsplashKey;
      if (config.youtubeKey) window.MEDIA_CONFIG.youtubeKey = config.youtubeKey;
      console.log('[Config] Media API keys loaded from environment');
    }
  } catch (error) {
    console.warn('[Config] Could not load media keys from environment:', error.message);
  }
})();
