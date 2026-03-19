const fs = require('fs');
const content = fs.readFileSync('c:/Users/LENOVO/Desktop/hire/frontend/src/pages/AISAWorkSpace.jsx', 'utf8');
let open = 0, close = 0;
for (let char of content) {
    if (char === '{') open++;
    if (char === '}') close++;
}
console.log(`Braces: {=${open}, }=${close}. Difference: ${open - close}`);
