#!/usr/bin/env node

/**
 * Interactive Template Import
 * 
 * Usage: npm run import
 * 
 * Asks for template name and path, then imports automatically
 */

const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('');
console.log('🎨 Template Import Wizard');
console.log('═'.repeat(50));
console.log('');

// Ask for template name
rl.question('📦 Template naam (bijv. "Luxury Travel"): ', (templateName) => {
  if (!templateName) {
    console.error('❌ Template naam is verplicht');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('💡 Tip: Gebruik relatief pad vanaf project root');
  console.log('   Bijvoorbeeld: ./templates/LuxuryTravel');
  console.log('   Of: C:/Downloads/travel-template-unzipped');
  console.log('');

  // Ask for template path
  rl.question('📁 Template pad: ', (templatePath) => {
    if (!templatePath) {
      console.error('❌ Template pad is verplicht');
      rl.close();
      process.exit(1);
    }

    // Check if path exists
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Pad bestaat niet: ${templatePath}`);
      rl.close();
      process.exit(1);
    }

    // Generate category from name
    const category = templateName.toLowerCase().replace(/\s+/g, '-');

    console.log('');
    console.log('📋 Samenvatting:');
    console.log(`   Naam: ${templateName}`);
    console.log(`   Pad: ${templatePath}`);
    console.log(`   Categorie: ${category}`);
    console.log('');

    rl.question('✅ Doorgaan met importeren? (ja/nee): ', (confirm) => {
      rl.close();

      if (confirm.toLowerCase() !== 'ja' && confirm.toLowerCase() !== 'j') {
        console.log('❌ Import geannuleerd');
        process.exit(0);
      }

      console.log('');
      console.log('🚀 Starting import...');
      console.log('');

      // Run the actual import script
      const importScript = spawn('node', [
        'scripts/import-template.js',
        `--name=${templateName}`,
        `--path=${templatePath}`,
        `--category=${category}`
      ], {
        stdio: 'inherit',
        shell: true
      });

      importScript.on('close', (code) => {
        if (code === 0) {
          console.log('');
          console.log('✅ Import succesvol!');
          console.log('');
          console.log('📋 Volgende stappen:');
          console.log('   1. Check BOLT → Quick Start dropdown');
          console.log('   2. Template zou zichtbaar moeten zijn!');
          console.log('');
        } else {
          console.error('❌ Import failed with code', code);
          process.exit(code);
        }
      });
    });
  });
});
