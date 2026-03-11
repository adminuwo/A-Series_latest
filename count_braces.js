const fs = require('fs');
const content = fs.readFileSync('src/pages/AISAWorkSpace.jsx', 'utf8');
const lines = content.split('\n');
let open = 0;
let close = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineOpen = (line.match(/\{/g) || []).length;
    const lineClose = (line.match(/\}/g) || []).length;
    open += lineOpen;
    close += lineClose;
    if (i % 500 === 0 || i === lines.length - 1) {
        console.log(`Line ${i}: Total {: ${open}, Total }: ${close}, Diff: ${open - close}`);
    }
}
