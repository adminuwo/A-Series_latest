const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

const translations = {
    "hindi": { "aisaName": "आइवा" },
    "bengali": { "aisaName": "আইভা" },
    "marathi": { "aisaName": "आइवा" },
    "gujarati": { "aisaName": "આઈવા" },
    "tamil": { "aisaName": "ஐவா" },
    "telugu": { "aisaName": "ఐవా" },
    "arabic": { "aisaName": "آيفا" },
    "english": { "aisaName": "AIVA" },
    "french": { "aisaName": "AIVA" },
    "spanish": { "aisaName": "AIVA" }
};

Object.keys(translations).forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const tx = translations[lang];

            Object.assign(content, tx);

            fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
            console.log(`Updated aisaName in ${lang}.json`);
        } catch (e) {
            console.error(`Error updating ${lang}.json`, e);
        }
    }
});
