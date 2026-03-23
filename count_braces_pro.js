import fs from 'fs';

const content = fs.readFileSync('c:/Users/LENOVO/Desktop/hire/frontend/src/pages/AISAWorkSpace.jsx', 'utf8');

let open = 0, close = 0;
let line = 1;
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = ''; // 'single' or 'multi'

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '\n') line++;

    if (inComment) {
        if (commentType === 'single' && char === '\n') {
            inComment = false;
        } else if (commentType === 'multi' && char === '*' && nextChar === '/') {
            inComment = false;
            i++;
        }
        continue;
    }

    if (inString) {
        if (char === stringChar && content[i - 1] !== '\\') {
            inString = false;
        }
        continue;
    }

    // Start of string
    if (char === "'" || char === '"' || char === '`') {
        inString = true;
        stringChar = char;
        continue;
    }

    // Start of comment
    if (char === '/' && nextChar === '/') {
        inComment = true;
        commentType = 'single';
        i++;
        continue;
    }
    if (char === '/' && nextChar === '*') {
        inComment = true;
        commentType = 'multi';
        i++;
        continue;
    }

    if (char === '{') open++;
    if (char === '}') close++;
}

console.log(`Code Braces (ignoring strings/comments): {=${open}, }=${close}. Difference: ${open - close}`);
