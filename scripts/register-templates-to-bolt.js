// Register AI Website Studio templates to BOLT
// Run with: node scripts/register-templates-to-bolt.js

const fs = require('fs');
const path = require('path');

const BOLT_API = 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/register-external-templates';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzY3MzMsImV4cCI6MjA3NDIxMjczM30.EqZK_6xjEAVwUtsYj6nENe4x8-7At_oRAVsPMDvJBSI';

// Template configurations
const TEMPLATES = [
  {
    category: 'gowild',
    display_name: 'GoWild',
    folder: 'Gowild',
    preview_url: 'https://www.ai-websitestudio.nl/templates/Gowild/previews/gowild-preview.png',
    pages: [
      { slug: 'index', name: 'Home', file: 'index.html', order: 0 },
      { slug: 'index-2', name: 'Home 2', file: 'index-2.html', order: 1 },
      { slug: 'index-3', name: 'Home 3', file: 'index-3.html', order: 2 },
      { slug: 'index-4', name: 'Home 4', file: 'index-4.html', order: 3 },
      { slug: 'about', name: 'About', file: 'about.html', order: 4 },
      { slug: 'destination', name: 'Destinations', file: 'destination.html', order: 5 },
      { slug: 'destination-details', name: 'Destination Details', file: 'destination-details.html', order: 6 },
      { slug: 'tour', name: 'Tours', file: 'tour.html', order: 7 },
      { slug: 'tour-details', name: 'Tour Details', file: 'tour-details.html', order: 8 },
      { slug: 'events', name: 'Events', file: 'events.html', order: 9 },
      { slug: 'gallery', name: 'Gallery', file: 'gallery.html', order: 10 },
      { slug: 'shop', name: 'Shop', file: 'shop.html', order: 11 },
      { slug: 'product-details', name: 'Product Details', file: 'product-details.html', order: 12 },
      { slug: 'blog-list', name: 'Blog List', file: 'blog-list.html', order: 13 },
      { slug: 'blog-details', name: 'Blog Details', file: 'blog-details.html', order: 14 },
      { slug: 'contact', name: 'Contact', file: 'contact.html', order: 15 }
    ]
  },
  {
    category: 'tripex',
    display_name: 'Tripex',
    folder: 'tripex',
    preview_url: 'https://www.ai-websitestudio.nl/templates/tripex/previews/tripex-preview.png',
    pages: [
      { slug: 'index', name: 'Home', file: 'index.html', order: 0 },
      { slug: 'index-02', name: 'Home 2', file: 'index-02.html', order: 1 },
      { slug: 'index-03', name: 'Home 3', file: 'index-03.html', order: 2 },
      { slug: 'index-04', name: 'Home 4', file: 'index-04.html', order: 3 },
      { slug: 'index-05', name: 'Home 5', file: 'index-05.html', order: 4 },
      { slug: 'index-06', name: 'Home 6', file: 'index-06.html', order: 5 },
      { slug: 'about', name: 'About', file: 'about.html', order: 6 },
      { slug: 'service', name: 'Services', file: 'service.html', order: 7 },
      { slug: 'service-details', name: 'Service Details', file: 'service-details.html', order: 8 },
      { slug: 'team', name: 'Team', file: 'team.html', order: 9 },
      { slug: 'team-details', name: 'Team Details', file: 'team-details.html', order: 10 },
      { slug: 'tour-grid', name: 'Tour Grid', file: 'tour-grid.html', order: 11 },
      { slug: 'tour-list', name: 'Tour List', file: 'tour-list.html', order: 12 },
      { slug: 'tour-details', name: 'Tour Details', file: 'tour-details.html', order: 13 },
      { slug: 'destination', name: 'Destinations', file: 'destination.html', order: 14 },
      { slug: 'destination-details', name: 'Destination Details', file: 'destination-details.html', order: 15 },
      { slug: 'gallery-01', name: 'Gallery 1', file: 'gallery-01.html', order: 16 },
      { slug: 'gallery-02', name: 'Gallery 2', file: 'gallery-02.html', order: 17 },
      { slug: 'faq', name: 'FAQ', file: 'faq.html', order: 18 },
      { slug: 'contact', name: 'Contact', file: 'contact.html', order: 19 },
      { slug: 'shop', name: 'Shop', file: 'shop.html', order: 20 },
      { slug: 'shop-details', name: 'Shop Details', file: 'shop-details.html', order: 21 },
      { slug: 'blog-standard', name: 'Blog Standard', file: 'blog-standard.html', order: 22 },
      { slug: 'blog-details', name: 'Blog Details', file: 'blog-details.html', order: 23 },
      { slug: 'error', name: 'Error 404', file: 'error.html', order: 24 }
    ]
  }
];

async function registerTemplates() {
  console.log('🚀 Starting template registration to BOLT...\n');

  const payload = {
    builder_name: 'AI Website Studio',
    builder_url: 'https://www.ai-websitestudio.nl',
    templates: []
  };

  for (const template of TEMPLATES) {
    console.log(`📦 Processing template: ${template.display_name}`);
    
    const templateData = {
      category: template.category,
      category_preview_url: template.preview_url,
      pages: []
    };

    for (const page of template.pages) {
      const filePath = path.join(__dirname, '..', 'templates', template.folder, page.file);
      
      console.log(`  📄 Reading: ${page.name} (${page.file})`);
      
      try {
        if (!fs.existsSync(filePath)) {
          console.log(`  ⚠️  File not found: ${filePath}`);
          continue;
        }

        // Read HTML content
        let htmlContent = fs.readFileSync(filePath, 'utf-8');

        // Fix asset paths to absolute URLs
        htmlContent = htmlContent
          .replace(/href="assets\//g, `href="https://www.ai-websitestudio.nl/templates/${template.folder}/assets/`)
          .replace(/src="assets\//g, `src="https://www.ai-websitestudio.nl/templates/${template.folder}/assets/`)
          .replace(/src="images\//g, `src="https://www.ai-websitestudio.nl/templates/${template.folder}/images/`)
          .replace(/href="images\//g, `href="https://www.ai-websitestudio.nl/templates/${template.folder}/images/`);

        templateData.pages.push({
          template_name: page.name,
          page_slug: page.slug,
          preview_image_url: `https://www.ai-websitestudio.nl/templates/${template.folder}/previews/${page.slug}-preview.png`,
          html_content: htmlContent,
          order_index: page.order
        });

        console.log(`  ✅ Added: ${page.name}`);
      } catch (error) {
        console.error(`  ❌ Error reading ${page.file}:`, error.message);
      }
    }

    payload.templates.push(templateData);
    console.log(`✅ ${template.display_name}: ${templateData.pages.length} pages\n`);
  }

  // Send to BOLT - ONE TEMPLATE AT A TIME to avoid timeout
  console.log('📡 Sending to BOLT API (one template per request)...\n');

  for (const template of payload.templates) {
    const singlePayload = {
      builder_name: payload.builder_name,
      builder_url: payload.builder_url,
      templates: [template]
    };

    console.log(`📤 Registering ${template.category}: ${template.pages.length} pages...`);

    try {
      const response = await fetch(BOLT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(singlePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ ${template.category} registered successfully!`);
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ FAILED to register ${template.category}:`, error.message);
    }
  }

  console.log('\n🎉 ALL DONE!');
}

// Run
registerTemplates().catch(console.error);
