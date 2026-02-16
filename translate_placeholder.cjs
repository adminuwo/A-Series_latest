const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

const translations = {
    "hindi": { "placeholder": "आइसा से पूछें..." }, // Keeping Hindi transliteration if correct, or change if needed. "Aiva" -> "आइवा"? User said "Asia" -> "Aiva". "Aisa" -> "Aiva".
    // "Aisa" in Hindi is "आइसा". "Aiva" is "आइवा".
    // I will replace "AISA" -> "AIVA" in English/French/Spanish.
    // I will also update the transliterations to be safe: "आइवा" (Aiva).
    "hindi": { "placeholder": "आइवा से पूछें..." },
    "bengali": { "placeholder": "আইভাকে জিজ্ঞাসা করুন..." },
    "marathi": { "placeholder": "आइवाला विचारा..." },
    "gujarati": { "placeholder": "આઈવાને પૂછો..." },
    "tamil": { "placeholder": "ஐவாவிடம் கேளுங்கள்..." },
    "telugu": { "placeholder": "ఐవాను అడగండి..." },
    "arabic": { "placeholder": "اسأل آيفا..." },
    "english": { "placeholder": "Ask AIVA..." },
    "french": { "placeholder": "Demandez à AIVA..." },
    "spanish": { "placeholder": "Pregunta a AIVA..." }
};

Object.keys(translations).forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const tx = translations[lang];

            // Navigate to chatPage.inputPlaceholder
            if (!content.chatPage) content.chatPage = {};
            content.chatPage.inputPlaceholder = tx.placeholder;

            fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
            console.log(`Updated placeholder in ${lang}.json`);
        } catch (e) {
            console.error(`Error updating ${lang}.json`, e);
        }
    }
});
