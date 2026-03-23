import fs from 'fs';
const content = fs.readFileSync('c:/Users/LENOVO/Desktop/hire/frontend/src/pages/AISAWorkSpace.jsx', 'utf8');
let open = 0, close = 0;
let line = 1;
let lastOpenLine = 0;
for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\n') line++;
    if (char === '{') {
        open++;
        lastOpenLine = line;
    }
    if (char === '}') close++;
}
console.log(`Braces: {=${open}, }=${close}. Difference: ${open - close}`);
if (open !== close) {
    console.log(`Potential imbalance detected. Last open brace found around line ${lastOpenLine}`);
}
