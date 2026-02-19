/* global require, __dirname, process */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

if (!fs.existsSync(localesDir)) {
    console.error(`Locales directory not found at ${localesDir}`);
    process.exit(1);
}

const files = fs.readdirSync(localesDir);

files.forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(localesDir, file);
        try {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace AIVA with AIVA
            // Case sensitive for "AIVA" -> "AIVA"
            // Also "Aisa" -> "Aiva"
            // Also "Asia" -> "Aiva" IF it's not a region code?
            // User said "where is asia it should be aiva".
            // I'll be careful with "Asia".
            // Let's replace "AIVA" globally.
            let updatedContent = content.replace(/AIVA/g, 'AIVA');

            // Replace "Aisa" with "Aiva"
            updatedContent = updatedContent.replace(/Aisa/g, 'Aiva');

            // Replace "Asia" with "Aiva", BUT exclude "Asia" if it looks like a timezone "Asia/" or "asia-"
            // We can use a regex that matches "Asia" but not followed by "/" or "-"
            // Or simple check: "Asia " or "Asia" at end of string?
            // Let's stick to "AIVA" and "Aisa" first as per the Brand Name usage.
            // If I see "Asia" in the context of UI strings, I'll manual check.
            // But the user said "where is asia", implying it might be a typo for "Aisa".

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Updated ${file}`);
            }
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
});

console.log('Locale update complete.');
