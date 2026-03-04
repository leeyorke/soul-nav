const fs = require('fs');
const path = require('path');

// Create dist directories
const distDir = path.join(__dirname, 'dist', 'chromium');
const appsDir = path.join(distDir, 'apps');
const iconsDir = path.join(distDir, 'icons');

// Create directories if they don't exist
[distDir, appsDir, iconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Files to copy to dist
const filesToCopy = [
  { src: 'manifest.json', dest: path.join(distDir, 'manifest.json') },
  { src: 'newtab.html', dest: path.join(distDir, 'newtab.html') },
  { src: 'newtab.js', dest: path.join(distDir, 'newtab.js') },
  { src: 'soul.js', dest: path.join(distDir, 'soul.js') },
  { src: 'soul.json', dest: path.join(distDir, 'soul.json') },
  { src: 'style.css', dest: path.join(distDir, 'style.css') },
  { src: 'apps/habit-tracker.html', dest: path.join(appsDir, 'habit-tracker.html') },
  { src: 'apps/habit-tracker.js', dest: path.join(appsDir, 'habit-tracker.js') },
];

// Copy files
filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`Source file not found: ${src}`);
  }
});

// Copy icons
const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png', 'habit.svg'];
iconFiles.forEach(icon => {
  const src = path.join('icons', icon);
  const dest = path.join(iconsDir, icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied icon: ${src} -> ${dest}`);
  } else {
    console.warn(`Icon file not found: ${src}`);
  }
});

console.log('\n✅ Build completed successfully!');
console.log(`📦 Extension packaged in: ${distDir}`);