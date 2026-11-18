const fs = require('fs'), path = require('path');
const dist = path.join(__dirname, '..', 'dist');
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
console.log('✅ dist/ ready for GitHub Pages (.nojekyll + 404.html)');
