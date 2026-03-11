const fs = require('fs');
let code = fs.readFileSync('src/agents/AIHIRE/AiHire.jsx', 'utf8');

// The file has duplicate calls to generateChatResponse and systemInstruction declarations because of a bad merge.
// We will locate the block and remove the duplicate.

// Replace duplicate const vStyle
code = code.replace(
/const vStyle = c\.verdict === 'HIRE' \? 'bg-blue-500 ring-\[\#3b82f6\]'.*?\n\s+const vStyle = c\.verdict === 'HIRE' \? 'bg-emerald-500/g,
"const vStyle = c.verdict === 'HIRE' ? 'bg-emerald-500"
);

const duplicateSystemInstructionBlock = `                ${currentMode === 'Evaluation' ? 'MANDATORY: For Evaluation mode, you MUST include a SCORECARD_JSON_START ... SCORECARD_JSON_END block after Section 2.' : ''}
                MANDATORY: You must respond in English. Absolutely NO HINDI or other languages allowed. Every single word of your response must be in English.
                \`;

                const response = await generateChatResponse([...messages, userMsg], finalInput, systemInstruction, hireFileAttachments, 'English', null, null, { agentType: 'AIHIRE' });
                aiReply = response.reply || response;
            }`;

const correctSystemInstructionBlock = `            const systemInstruction = \`
            YOU ARE THE AIHIRE AGENT — A PROFESSIONAL TALENT STRATEGIST.
            CURRENT MODE: \${hiringMode}

            GLOBAL CONTEXT:
            - Role: \${hireRole}
            - Dept: \${hireDepartment}
            - Seniority: \${hireSeniority}
            - Budget: ₹\${hireBudget}
            - High Quality Priority: \${hireTradeoff}%
            - Industry: \${hireIndustry}
            - Business Stage: \${hireBusinessStage}

            \${hiringMode === 'Strategy' ? \`
            GOAL: Create a hiring roadmap. Timeline: \${hireTimelineWeeks} weeks. Risk: \${hireRiskTolerance}. Sourcing: \${hireSourcingChannels}.
            NOTES: \${hireExtraNotes}
            SECTIONS: READINESS SCORE, TRADE-OFF ANALYSIS, RISK RADAR, COST FORECAST, VISUALIZATIONS.
            \` : hiringMode === 'Evaluation' ? \`
            GOAL: Rank candidates and check bias. Criteria: \${hireScorecardCriteria}. Bias Check: \${hireBiasCheck}.
            JD: \${hireJobDescription}
            PROFILES: \${hireCandidateProfiles}
            SECTIONS: SCORECARD FRAMEWORK, CANDIDATE RANKING (with SCORECARD_JSON), BIAS REPORT, INTERVIEW FRAMEWORK, VISUALIZATIONS.
            \` : hiringMode === 'Offer' ? \`
            GOAL: Closing strategy. 
            CANDIDATE_DETAILS: \${hireExtraNotes}
            TARGET_OFFER: Salary: ₹\${hireOfferSalary}, Equity: \${hireEquityPercent}%, Perks: \${hireOfferPerks}.
            MARKET_CONTEXT: Competitor: ₹\${hireCompetitorSalary}, Leverage: \${hireCandidateLeverage}.
            SECTIONS: MARKET BENCHMARK, EQUITY ANALYSIS, ACCEPTANCE PROBABILITY, NEGOTIATION PLAYBOOK, VISUALIZATIONS.
            \` : hiringMode === 'Planning' ? \`
            GOAL: Org design and headcount forecasting. 
            CONTEXT: \${hireExtraNotes}
            STRUCTURE: \${hireOrgStructure}. Values: \${hireCulturalValues}.
            SECTIONS: SCALABILITY AUDIT, CAPACITY PLANNING, REPORTING LINES, SUCCESSION PLAN, VISUALIZATIONS.
            \` : \`
            GOAL: Talent Analytics and Funnel Optimization. 
            ANALYSIS_REQUEST: \${hireExtraNotes || 'General funnel efficiency and cost-per-hire analysis.'}
            SECTIONS: FUNNEL PERFORMANCE, BUDGET ATTRIBUTION, TURNOVER PREDICTION, DATA VISUALIZATIONS.
            \`}

            MANDATORY: Use SECTION N: TITLE format. Provide JSON at the end for Section 5 (Visualizations).
            For Evaluation mode, you MUST include a SCORECARD_JSON_START ... SCORECARD_JSON_END block after Section 2.
            MANDATORY: You must respond in \${language || 'English'}.
            \`;

            const response = await generateChatResponse([...messages, userMsg], finalInput, systemInstruction, hireFileAttachments, language || 'English', null, null, { agentType: 'AIHIRE' });
            const aiReply = response.reply || response;`;

// We just replace the entire `if (hiringMode === ...) { ... }` that got duplicated.
// It starts around "if (hiringMode === 'Strategy' || hiringMode === 'Evaluation') {"
// Actually let's just use string replace on the aiReply block.

code = code.replace(duplicateSystemInstructionBlock, "");


// also append `\nexport default AiHire;` if it's not present at the bottom
if (!code.includes('export default AiHire;')) {
    code += '\nexport default AiHire;\n';
}

fs.writeFileSync('src/agents/AIHIRE/AiHire.jsx', code);
console.log('Fixed AiHire');
