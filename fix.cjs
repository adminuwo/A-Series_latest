const fs = require('fs');
let code = fs.readFileSync('src/pages/AISAWorkSpace.jsx', 'utf8');

code = code.replace(
/(\{ id: 2, type: 'Sentiment', source: 'Email', message: 'Replied with "Send more info"', time: '1m ago', intensity: 'Medium' \}\s+)((?:\/\/[^\n]*\n\s*)*if \(activeAgent\.id)/,
"$1    ]);\n\n    useEffect(() => {\n        $2"
);

code = code.replace(
/(\{ id: 2, title: 'Auto-Write New Topics', schedule: 'On Topic Added', active: false, type: 'auto' \}\s*)\n(\s*const \[automationDeadlines)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ id: 1, topic: 'Machine Learning Ethics', date: '2026-03-05', status: 'Pending' \}\s*)\n(\s*const \[isMultiOutputEnabled)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ date: 'W4', value: 82\.8 \}\s*)\n(\s*const \[reportHistory)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ date: 'Mar', anomalies: 1 \}\s*)\n(\s*const \[symptomHistory)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ date: 'Thu', risk: 4 \}\s*)\n(\s*const \[treatmentHistory)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ date: 'W4', scans: 8 \}\s*)\n(\s*\/\/ AIHEALTH Treatment Advisor States)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ id: 3, type: 'Decision', message: 'Scheduled preventative report analysis based on recent glucose logs', time: 'Just now', severity: 'High' \}\s*)\n(\s*const \[healthAlerts)/,
"$1    ]);\n$2"
);

code = code.replace(
/(\{ id: 1, title: 'Health Risk Warning', message: 'High sodium intake detected from recent dinner logs\.', date: '2026-02-25', status: 'unread' \}\s*)\n(\s*const \[automationResult)/,
"$1    ]);\n$2"
);

const toRemoveUseEffect = `    useEffect(() => {
        const initWorkspace = async () => {
            const agentFromUrl = AGENTS.find(a => a.id === sessionId);
            if (agentFromUrl) {
                setActiveAgent(agentFromUrl);
                setMessages([]);
                setCurrentSessionId('new');
            } else if (sessionId && sessionId !== 'new') {
                const history = await chatStorageService.getHistory(sessionId);
                setMessages(history || []);
                setCurrentSessionId(sessionId);`;

code = code.replace(toRemoveUseEffect, "    useEffect(() => {\n        const initWorkspace = async () => {\n            // 1. Clear all previous result states to prevent stale data showing in the new session");

const duplicateAction = `    const handleAction = async (e, customPrompt = null) => {
        if (e) e.preventDefault();

        // Build the prompt from input
        let finalInput = customPrompt || inputValue;

        if (!finalInput || !finalInput.trim() || isProcessing) return;`;

code = code.replace(duplicateAction, "");

fs.writeFileSync('src/pages/AISAWorkSpace.jsx', code);
console.log('Fixed AISAWorkSpace');
