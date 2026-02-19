/* global require, __dirname, process */
const fs = require('fs');

const filePath = 'g:\\A_Series\\A-Series\\src\\context\\LanguageContext.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const hindiTrans = {
    myTransactions: "मेरे लेन-देन",
    transactionsDesc: "अपना खरीदारी इतिहास और भुगतान विवरण देखें",
    date: "तारीख",
    appAgent: "ऐप / एजेंट",
    plan: "योजना",
    amount: "राशि",
    status: "स्थिति",
    actions: "कार्रवाई",
    details: "विवरण",
    loadingTransactions: "लेन-देन लोड हो रहा है...",
    noTransactions: "अभी तक कोई लेन-देन नहीं मिला।",
    subscribeToSeeHistory: "अपना खरीदारी इतिहास यहां देखने के लिए किसी एजेंट की सदस्यता लें।",
    transactionDetails: "लेन-देन का विवरण",
    transactionId: "लेन-देन आईडी",
    amountPaid: "भुगतान की गई राशि",
    totalAmount: "कुल राशि",
    paymentStatus: "भुगतान की स्थिति",
    close: "बंद करें",
    success: "सफल",
    pending: "लंबित",
    adminRole: "एडमिन",
    userRole: "उपयोगकर्ता",
    developerRole: "डेवलपर",
    accountType: "खाता प्रकार",
    showAll: "सभी दिखाएं",
    hideAll: "सभी छुपाएं",
    confirmNewPassword: "नए पासवर्ड की पुष्टि करें",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    enterNewPassword: "नया पासवर्ड दर्ज करें",
    newPassword: "नया पासवर्ड",
    enterCurrentPassword: "वर्तमान पासवर्ड दर्ज करें",
    currentPassword: "वर्तमान पासवर्ड",
    failedToUpdate: "अपडेट करने में विफल",
    passwordUpdated: "पासवर्ड सफलतापूर्वक अपडेट किया गया",
    updatingPassword: "पासवर्ड अपडेट किया जा रहा है...",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    passwordTooShort: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    failedToDelete: "खाता हटाने में विफल",
    accountDeleted: "खाता सफलतापूर्वक हटा दिया गया",
    deletingAccount: "खाता हटाया जा रहा है...",
    deletionConfirmation: "क्या आप वाकई अपना खाता हटाना चाहते हैं? यह कार्रवाई स्थायी है।"
};

const baseTrans = {
    myTransactions: "My Transactions",
    transactionsDesc: "View your purchase history and payment details",
    date: "Date",
    appAgent: "App / Agent",
    plan: "Plan",
    amount: "Amount",
    status: "Status",
    actions: "Actions",
    details: "Details",
    loadingTransactions: "Loading transactions...",
    noTransactions: "No transactions found yet.",
    subscribeToSeeHistory: "Subscribe to an agent to see your purchase history here.",
    transactionDetails: "Transaction Details",
    transactionId: "Transaction ID",
    amountPaid: "Amount Paid",
    totalAmount: "Total Amount",
    paymentStatus: "Payment Status",
    close: "Close",
    success: "Success",
    pending: "Pending",
    adminRole: "Admin",
    userRole: "User",
    developerRole: "Developer",
    accountType: "Account Type",
    showAll: "Show All",
    hideAll: "Hide All",
    confirmNewPassword: "Confirm new password",
    confirmPassword: "Confirm Password",
    enterNewPassword: "Enter new password",
    newPassword: "New Password",
    enterCurrentPassword: "Enter current password",
    currentPassword: "Current Password",
    failedToUpdate: "Failed to update",
    passwordUpdated: "Password updated successfully",
    updatingPassword: "Updating password...",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    failedToDelete: "Failed to delete account",
    accountDeleted: "Account deleted successfully",
    deletingAccount: "Deleting account...",
    deletionConfirmation: "Are you sure you want to delete your account? This action is permanent."
};

let languages = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*"([^"]+)":\s*{/);
    if (match && !line.includes('timezoneKeywords') && !line.includes('features') && !line.includes('policies') && !line.includes('faqHelp')) {
        // Check for displayLanguage inside
        let foundDisplay = false;
        for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
            if (lines[j].includes('displayLanguage:')) {
                foundDisplay = true;
                break;
            }
        }
        if (foundDisplay) {
            languages.push({ name: match[1], startIndex: i });
        }
    }
}

let result = lines.slice(0, languages[0].startIndex).join('\n');

for (let l = 0; l < languages.length; l++) {
    const lang = languages[l];
    let nextStart = (l < languages.length - 1) ? languages[l + 1].startIndex : lines.length - 1;

    // Find the end of this block
    let endIndex = nextStart - 1;
    while (endIndex > lang.startIndex && !lines[endIndex].trim().endsWith('},')) {
        endIndex--;
    }

    let blockLines = lines.slice(lang.startIndex, endIndex + 1);
    const trans = (lang.name === "Hindi") ? hindiTrans : baseTrans;

    // Create map of existing keys in this block to avoid duplicates
    let keyIndices = {};
    blockLines.forEach((line, i) => {
        const kMatch = line.match(/^\s*([a-zA-Z0-9]+):/);
        if (kMatch) {
            keyIndices[kMatch[1]] = i;
        }
    });

    Object.entries(trans).forEach(([key, val]) => {
        if (keyIndices.hasOwnProperty(key)) {
            // Update existing if it's currently English and we're Hindi, or just general normalize
            blockLines[keyIndices[key]] = blockLines[keyIndices[key]].replace(/: ".*"/, `: "${val}"`);
        } else {
            // Add before the last line of the block
            blockLines.splice(blockLines.length - 1, 0, `            ${key}: "${val}",`);
            // Update indices after splice if needed, but not necessary here as we don't use it again for same key
        }
    });

    result += '\n' + blockLines.join('\n');
}

// Add remaining lines
let finalEnd = lines.length - 1;
result += '\n' + lines[finalEnd];

fs.writeFileSync(filePath, result);
console.log("Global keys update complete with accurate CommonJS script.");
