#!/usr/bin/env node
/**
 * Post-build script for Compass standalone version.
 * Goal: Produce the closest thing possible to a single self-contained HTML file.
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('\n🛠️  Post-processing standalone build...\n');

try {
  // 1. Rename index.html → compass.html (friendlier name)
  const oldHtml = path.join(distDir, 'index.html');
  const newHtml = path.join(distDir, 'compass.html');

  if (fs.existsSync(oldHtml)) {
    fs.renameSync(oldHtml, newHtml);
    console.log('   ✓ Renamed dist/index.html → dist/compass.html');
  }

  // 2. Remove any leftover asset files (we want to be as single-file as possible)
  const files = fs.readdirSync(distDir);
  const assetsToRemove = files.filter(f => 
    f.endsWith('.svg') || 
    f.endsWith('.wasm') || 
    (f.includes('.') && !f.endsWith('.html'))
  );

  let removedCount = 0;
  for (const file of assetsToRemove) {
    const filePath = path.join(distDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✓ Removed leftover asset: ${file}`);
      removedCount++;
    } catch (e) {
      console.warn(`   ⚠ Could not remove ${file}: ${e.message}`);
    }
  }

  // 3. Report final state
  const finalFiles = fs.readdirSync(distDir);
  console.log(`\n   Final files in dist/: ${finalFiles.join(', ')}`);

  const htmlPath = path.join(distDir, 'compass.html');
  if (fs.existsSync(htmlPath)) {
    const stats = fs.statSync(htmlPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`\n✅ Standalone build complete!`);
    console.log(`   File: dist/compass.html`);
    console.log(`   Size: ${sizeKB} KB`);
    console.log(`\n   You can open this file directly in a browser (double-click or drag into browser).`);
  }

} catch (error) {
  console.error('❌ Error during standalone post-processing:', error);
  process.exit(1);
}
