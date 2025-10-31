// Upload CSS files to Supabase Storage
// Run this once to upload your CSS files

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCSS() {
  console.log('📤 Uploading CSS files to Supabase Storage...');

  try {
    // Read CSS files
    const mainCSS = fs.readFileSync(path.join(process.cwd(), 'styles/main.css'), 'utf8');
    const componentsCSS = fs.readFileSync(path.join(process.cwd(), 'styles/components.css'), 'utf8');

    console.log('✅ CSS files read successfully');
    console.log(`   - main.css: ${(mainCSS.length / 1024).toFixed(2)} KB`);
    console.log(`   - components.css: ${(componentsCSS.length / 1024).toFixed(2)} KB`);

    // Create assets bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const assetsBucket = buckets?.find(b => b.name === 'assets');
    
    if (!assetsBucket) {
      console.log('📦 Creating assets bucket...');
      await supabase.storage.createBucket('assets', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['text/css', 'application/javascript', 'image/*']
      });
      console.log('✅ Assets bucket created');
    }

    // Upload main.css
    console.log('📤 Uploading main.css...');
    const { error: mainError } = await supabase.storage
      .from('assets')
      .upload('styles/main.css', new Blob([mainCSS], { type: 'text/css' }), {
        cacheControl: '3600',
        upsert: true,
        contentType: 'text/css'
      });

    if (mainError) {
      console.error('❌ Error uploading main.css:', mainError);
    } else {
      console.log('✅ main.css uploaded successfully');
    }

    // Upload components.css
    console.log('📤 Uploading components.css...');
    const { error: componentsError } = await supabase.storage
      .from('assets')
      .upload('styles/components.css', new Blob([componentsCSS], { type: 'text/css' }), {
        cacheControl: '3600',
        upsert: true,
        contentType: 'text/css'
      });

    if (componentsError) {
      console.error('❌ Error uploading components.css:', componentsError);
    } else {
      console.log('✅ components.css uploaded successfully');
    }

    // Get public URLs
    const { data: mainUrl } = supabase.storage
      .from('assets')
      .getPublicUrl('styles/main.css');
    
    const { data: componentsUrl } = supabase.storage
      .from('assets')
      .getPublicUrl('styles/components.css');

    console.log('\n🎉 Upload complete!');
    console.log('\n📋 Public URLs:');
    console.log(`   - main.css: ${mainUrl.publicUrl}`);
    console.log(`   - components.css: ${componentsUrl.publicUrl}`);
    console.log('\n💡 Use these URLs in your edge function!');

  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

// Run upload
uploadCSS();
