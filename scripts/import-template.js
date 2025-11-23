#!/usr/bin/env node

/**
 * Template Import Script
 * Imports a ThemeForest template into the database
 * 
 * Usage:
 *   node scripts/import-template.js --name="TravelTemplate" --path="./templates/TravelTemplate" --category="travel-template"
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value?.replace(/['"]/g, '');
  return acc;
}, {});

const TEMPLATE_NAME = args.name;
const TEMPLATE_PATH = args.path;
const TEMPLATE_CATEGORY = args.category || args.name?.toLowerCase().replace(/\s+/g, '-');

if (!TEMPLATE_NAME || !TEMPLATE_PATH) {
  console.error('❌ Usage: node import-template.js --name="TemplateName" --path="./templates/Folder"');
  process.exit(1);
}

// Supabase config (from environment)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Main import function
async function importTemplate() {
  console.log('🚀 Starting template import...');
  console.log(`📦 Template: ${TEMPLATE_NAME}`);
  console.log(`📁 Path: ${TEMPLATE_PATH}`);
  console.log(`🏷️  Category: ${TEMPLATE_CATEGORY}`);
  console.log('');

  // Check if path exists
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`❌ Template path does not exist: ${TEMPLATE_PATH}`);
    process.exit(1);
  }

  // Find all HTML files
  const htmlFiles = findHtmlFiles(TEMPLATE_PATH);
  console.log(`📄 Found ${htmlFiles.length} HTML files`);
  console.log('');

  const imports = [];

  for (const file of htmlFiles) {
    const pageName = getPageName(file);
    const htmlContent = fs.readFileSync(file, 'utf-8');
    const previewUrl = getPreviewUrl(file, TEMPLATE_CATEGORY);

    console.log(`📝 Processing: ${pageName} (${formatBytes(htmlContent.length)})`);

    imports.push({
      template_name: pageName,
      category: TEMPLATE_CATEGORY,
      cached_html: htmlContent,
      preview_image_url: previewUrl,
      description: `${pageName} page from ${TEMPLATE_NAME} template`,
      is_active: true
    });
  }

  // Insert into database
  console.log('');
  console.log('💾 Inserting into database...');

  const { data, error } = await supabase
    .from('website_page_templates')
    .insert(imports)
    .select();

  if (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }

  console.log('');
  console.log('✅ Import complete!');
  console.log(`📊 Imported ${data.length} pages`);
  console.log('');
  console.log('📋 Summary:');
  data.forEach(page => {
    console.log(`   - ${page.template_name} (${page.category})`);
  });
  console.log('');
  console.log('🎉 Template is now available in BOLT Quick Start!');
}

// Helper functions
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip common non-page directories
      if (!['node_modules', 'assets', 'css', 'js', 'images', 'fonts', '.git'].includes(item)) {
        files.push(...findHtmlFiles(fullPath));
      }
    } else if (stat.isFile() && item.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getPageName(filePath) {
  const fileName = path.basename(filePath, '.html');
  
  // Convert filename to readable name
  const nameMap = {
    'index': 'Home',
    'index-2': 'Home 2',
    'index-3': 'Home 3',
    'index-4': 'Home 4',
    'about': 'About',
    'about-us': 'About Us',
    'contact': 'Contact',
    'blog': 'Blog',
    'blog-details': 'Blog Details',
    'blog-grid': 'Blog Grid',
    'blog-list': 'Blog List',
    'services': 'Services',
    'portfolio': 'Portfolio',
    'gallery': 'Gallery',
    'team': 'Team',
    'testimonials': 'Testimonials',
    'pricing': 'Pricing',
    'faq': 'FAQ',
    '404': '404',
    'tours': 'Tours',
    'tour-details': 'Tour Details',
    'destinations': 'Destinations',
    'destination-details': 'Destination Details',
    'shop': 'Shop',
    'product-details': 'Product Details',
    'checkout': 'Checkout',
    'cart': 'Cart'
  };

  if (nameMap[fileName]) {
    return nameMap[fileName];
  }

  // Capitalize and replace dashes/underscores with spaces
  return fileName
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPreviewUrl(filePath, category) {
  const fileName = path.basename(filePath, '.html');
  return `https://www.ai-websitestudio.nl/templates/${category}/previews/${fileName}.jpg`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Run import
importTemplate().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
