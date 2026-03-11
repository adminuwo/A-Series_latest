const fs = require('fs');
let text = fs.readFileSync('src/pages/AISAWorkSpace.jsx', 'utf8');
let lines = text.split(/\r?\n/);

let startIndex = lines.findIndex(l => l.includes('const handleAction = async (e, customPrompt = null) => {'));
if (startIndex !== -1) {
    let endIndex = startIndex + 7;
    lines.splice(startIndex, 8); // Removing 8 lines starting from 770
    fs.writeFileSync('src/pages/AISAWorkSpace.jsx', lines.join('\n'));
    console.log('Removed 8 lines starting at', startIndex);
} else {
    console.log('Could not find target line');
}
