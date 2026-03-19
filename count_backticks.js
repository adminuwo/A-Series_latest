const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOVO/Desktop/hire/frontend/src/pages/AISAWorkSpace.jsx', 'utf8');
const count = (content.match(/`/g) || []).length;
console.log('Backtick count:', count);
const lineArray = content.split('\n');
for (let i = 0; i < lineArray.length; i++) {
    const c = (lineArray[i].match(/`/g) || []).length;
    if (c % 2 !== 0) {
        console.log(`Line ${i + 1}: ${c} backticks`);
    }
}
