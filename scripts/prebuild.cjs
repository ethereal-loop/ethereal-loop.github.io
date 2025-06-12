const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'ethereal-data', 'data');
const destDir = path.join(__dirname, '..', 'public', 'data');

// Clean destination
fs.removeSync(destDir);
fs.mkdirpSync(destDir);

// Copy files
fs.copySync(sourceDir, destDir);

console.log('Animations copied.');

const files = fs.readdirSync(destDir)
  .filter(file => file.endsWith('.html'))
  .sort();

fs.writeFileSync(
  path.join(destDir, '..', 'animations.json'),
  JSON.stringify(files, null, 2)
);
