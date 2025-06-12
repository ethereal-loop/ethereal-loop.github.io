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

// todo: verify, minify.
fs.copySync(
path.join(__dirname, '..', 'data.json'),
path.join(__dirname, '..', 'public','data.json'),
)
// write index.json
// const files = fs.readdirSync(destDir)
//   .filter(file => file.endsWith('.html'))
//   .sort();


// fs.writeFileSync(
//   path.join(destDir, '..', 'index.json'),
//   JSON.stringify(files, null, 2)
// );
