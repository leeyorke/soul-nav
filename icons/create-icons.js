// 创建简单的 SVG 图标并转换为 PNG
const fs = require('fs');

// 简单的图标 SVG - 灵魂/心形/导航概念
const iconSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#58a6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#79c0ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#0d1117"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="none" stroke="url(#grad${size})" stroke-width="${size*0.08}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.15}" fill="url(#grad${size})"/>
</svg>`;

// 保存 SVG 文件
[16, 48, 128].forEach(size => {
  fs.writeFileSync(`icon${size}.svg`, iconSVG(size));
  console.log(`Created icon${size}.svg`);
});

console.log('Icons created. Please convert SVG to PNG using an image tool,');
console.log('or use the extension with SVG files directly in development.');
