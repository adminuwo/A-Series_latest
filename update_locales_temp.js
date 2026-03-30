const fs = require('fs');
const path = require('path');

const localesDir = 'd:/SSeries/A-Series_latest/src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
    'english.json': 'or continue with',
    'hindi.json': 'या इसके साथ जारी रखें',
    'bengali.json': 'অথবা এটি দিয়ে চালিয়ে যান',
    'gujarati.json': 'અથવા આની સાથે ચાલુ રાખો',
    'marathi.json': 'किंवा यासह सुरू ठेवा',
    'tamil.json': 'அல்லது இதனுடன் தொடரவும்',
    'telugu.json': 'లేదా దీనితో కొనసాగించండి',
    'spanish.json': 'o continuar con',
    'french.json': 'ou continuer avec',
    'arabic.json': 'أو الاستمرار باستخدام',
};

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.auth) {
        data.auth.orContinueWith = translations[file] || 'or continue with';
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Updated ${file}`);
    }
});
