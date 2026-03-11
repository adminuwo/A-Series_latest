export const buildAISalesPrompt = (data) => {
    const {
        salesMode, targetPersona, PERSONAS, companySize, accountSize, leadType,
        outreachChannel, engagementLevel, dealValue, dealStage, competitorInvolved,
        lastContactDate, targetAccount, personaGoals, personaPainPoints, ctaType,
        generateVariants, prospectObjection, prospectReply, playbookType,
        mainCompetitor, competitorStrength, yourPrice, competitorPrice, valueProps,
        subjectLine, stakeholders, followUpReminders, excelFile, scriptType,
        stakeholderMap, roiCalc
    } = data;

    let aisalesPrompt = `
    SPECIALIZED AISALES MODE: ${salesMode}
    GLOBAL CONTEXT:
    - Target Role: ${targetPersona} (Focus: ${PERSONAS[targetPersona]?.focus})
    - Company Size: ${companySize}
    - Account Size: ${accountSize}
    - Lead Type: ${leadType}
    - Outreach Channel: ${outreachChannel}
    - Engagement Level: ${engagementLevel}
    `;
    if (dealValue || dealStage || engagementLevel) {
        aisalesPrompt += `
        DEAL INTELLIGENCE CONTEXT:
        - Deal Value: ₹${dealValue || 'Unknown'}
        - Stage: ${dealStage}
        - Probability Factors: Competitor (${competitorInvolved ? 'Yes' : 'No'}), Last Contact (${lastContactDate || 'None'})
        - Lead Scoring: ${leadType} account, ${outreachChannel} channel
        MANDATORY: Regardless of the specific task, you must keep the "Lead Score" and "Deal Probability" in mind.
        `;
    }
    if (salesMode === 'Write Email') {
        aisalesPrompt += `
        TASK: Generate a COMPLETE, ready-to-send sales email sequence.
        - Target Company: ${targetAccount || 'a leading company in ' + leadType}
        - Your Role: AI Sales Specialist
        - Persona Goals: ${personaGoals || 'Not specified'}
        - Persona Pain Points: ${personaPainPoints || 'Not specified'}
        - CTA Commitment: ${ctaType}
        INSTRUCTIONS:
        1. SUBJECT LINES: Write 3 subject line options with predicted open rates.
        2. EMAIL BODY: Write the core message. Use "Dynamic CTA" optimized for ${dealStage} stage.
        3. SEQUENCE: Outline a 3-step follow-up plan.
        4. VARIANTS: Generate ${generateVariants ? '3 distinct versions' : '1 optimized version'}.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: SUBJECT LINE OPTIONS
        SECTION 2: PRIMARY EMAIL DRAFT
        SECTION 3: MULTI-CHANNEL SEQUENCE
        SECTION 4: A/B VARIANTS
        `;
    } else if (salesMode === 'Analyze Reply') {
        aisalesPrompt += `
        TASK: Analyze a prospect's reply and generate a strategic counter-response.
        INPUT:
        - Prospect Reply: "${prospectObjection || prospectReply}"
        - Detected Objection: ${prospectObjection || 'None specified'}
        - Current Deal Stage: ${dealStage}
        INSTRUCTIONS:
        1. INTENT CLASSIFICATION: Classify as Interested / Objection / Not Interested / Referral.
        2. OBJECTION ANALYSIS: Identify the Root Cause (Price, Authority, Trust, Need) and psychological trigger.
        3. FUNNEL UPDATE: Recommend if we should move them to the next stage or nurture.
        4. DRAFT RESPONSE: Write a "Turnaround Script" using proven techniques.
        5. STRATEGY: Provide Deal Probability update and Lead Score update.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: INTENT CLASSIFICATION
        SECTION 2: OBJECTION ANALYSIS
        SECTION 3: FUNNEL UPDATE
        SECTION 4: DRAFT RESPONSE
        SECTION 5: STRATEGY
        `;
    } else if (salesMode === 'Strategy') {
        aisalesPrompt += `
        TASK: Generate high-level sales strategy and intelligence.
        SELECTED TOOL: ${playbookType || 'General Strategy'}
        INPUTS:
        - Competitor: ${mainCompetitor}
        - Competitor Strength: ${competitorStrength || 'Unknown'}
        - Pricing: Us (₹${yourPrice}) vs Them (₹${competitorPrice})
        - Target Account: ${targetAccount}
        - Stakeholders: ${JSON.stringify(stakeholders)}
        - Value Props: ${valueProps || 'None provided'}
        INSTRUCTIONS:
        `;
        if (targetAccount) {
            aisalesPrompt += `
            - ABM CAMPAIGN PLAN (Feature 13):
              1. Map out stakeholders for ${targetAccount}.
              2. Create a "Why Us, Why Now" narrative.
              3. 30-60-90 day engagement plan.
            `;
        }
        if (mainCompetitor) {
            aisalesPrompt += `
            - COMPETITOR BATTLECARD (Feature 11):
              1. Kill Points (Where we win).
              2. Landmines (What to warn the prospect about).
              3. Depositioning Script.
              - Main Competitor: ${mainCompetitor}
              - Competitor Strength: ${competitorStrength}
            `;
        }
        if (yourPrice || competitorPrice) {
            aisalesPrompt += `
            - PRICING INTELLIGENCE (Feature 10):
              1. ROI Calculator Logic.
              2. Cost of Inaction (COI) script.
              3. Negotiation trade-offs.
            `;
        }
        if (subjectLine) {
            aisalesPrompt += `
            - OPEN RATE PREDICTION (Feature 12):
              1. Score (0-100).
              2. Fixes for spam triggers.
              3. Emotional impact score.
            `;
        }
        aisalesPrompt += `
        - DEAL & LEAD SCORING (Feature 1 & 2):
          1. Calculate Win Probability based on context.
          2. Assign a Lead Quality Score (A/B/C) based on engagement.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: STRATEGY SUMMARY
        SECTION 2: COMPETITOR INFO
        SECTION 3: ACTION PLAN
        SECTION 4: SAVINGS & ROI
        SECTION 5: VISUALIZATIONS
        (MANDATORY: Provide JSON data for charts inside Section 5. Do not use code blocks.)
        {
            "marketShare": [{"name": "Our Solution", "value": 60, "color": "#3b82f6"}, {"name": "Competitor", "value": 40, "color": "#ef4444"}],
            "growthProjection": [{"year": "Month 1", "revenue": 20}, {"year": "Month 2", "revenue": 45}, {"year": "Month 3", "revenue": 80}],
            "mindMap": [{"id": "1", "label": "Growth Strategy", "children": ["Inbound", "Outbound", "Referrals"]}]
        }
        `;
    } else if (salesMode === 'Bot') {
        aisalesPrompt += `
        TASK: Act as an Intelligent Sales Automation Bot.
        INPUT:
        - Pending Follow-ups: ${JSON.stringify(followUpReminders)}
        - Data Source: ${excelFile ? 'Uploaded Excel: ' + excelFile.name : 'No file uploaded'}
        INSTRUCTIONS:
        1. DATA ANALYSIS: If an Excel file is present, analyze the prospect list and identify high-value targets.
        2. REMINDER STRATEGY: Review pending follow-ups and suggest optimal times/messages for each.
        3. AUTOMATION PLAN: Create a 7-day automated outreach calendar for the target account ${targetAccount}.
        4. BOT INSIGHTS: Provide a specialized "Automation Report" with predicted conversion lift.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: PROSPECT LIST ANALYSIS
        SECTION 2: FOLLOW-UP OPTIMIZATION
        SECTION 3: 7-DAY OUTREACH PLAN
        SECTION 4: BOT RECOMMENDATIONS
        `;
    } else if (salesMode === 'Scripts') {
        aisalesPrompt += `
        TASK: Generate High-Impact Sales Scripts and Objection Handlers.
        INPUT:
        - Script Type: ${scriptType}
        - Target Persona: ${targetPersona} (Goals: ${personaGoals}, Pains: ${personaPainPoints})
        - Tone: ${data.tone}
        INSTRUCTIONS:
        1. OPENING: Write a 10-second "Pattern Interrupt" opening.
        2. CORE VALUE: Pitch the value prop focused on ${personaGoals}.
        3. OBJECTION BATTLECARD: Provide 3 common objections for this persona and "Wolf-style" rebuttals.
        4. CTA: A low-friction close for a discovery call.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: BEST CALL OPENER
        SECTION 2: CORE PITCH
        SECTION 3: QUICK REPLIES
        SECTION 4: CALL CLOSING
        `;
    } else if (salesMode === 'Network') {
        aisalesPrompt += `
        TASK: Generate a Power Map and Stakeholder Influence Strategy.
        INPUT:
        - Current Stakeholders: ${JSON.stringify(stakeholderMap)}
        INSTRUCTIONS:
        1. INFLUENCE ANALYSIS: Identify the economic buyer, technical buyer, and potential blocker.
        2. RELATIONSHIP STRATEGY: Provide a plan to move "Neutral" or "Negative" stakeholders to "Positive".
        3. POWER MAP: Create a visual roadmap of how to navigate the organization to reach the decision-maker.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: KEY CONTACTS MAP
        SECTION 2: HOW TO WIN THEM OVER
        SECTION 3: MAKING A FAN
        `;
    } else if (salesMode === 'Value') {
        aisalesPrompt += `
        TASK: Perform a deep ROI and Value-Realization Analysis.
        INPUT:
        - Current Costs: ₹${roiCalc.currentCost}
        - Expected Efficiency Gain: ${roiCalc.expectedEfficiency}%
        INSTRUCTIONS:
        1. HARD ROI: Calculate exact annual savings in Rupees.
        2. SOFT ROI: Identify non-monetary gains like team morale or brand equity.
        3. PAYBACK ANALYSIS: Confirm the payback period and break-even point.

        MANDATORY OUTPUT FORMAT:
        SECTION 1: SAVINGS BREAKDOWN
        SECTION 2: STEPS TO SUCCESS
        SECTION 3: COST OF INACTION (COI)
        `;
    }
    aisalesPrompt += `
    FINAL OUTPUT GUARDRAILS:
    - OUTPUT MUST BE A FULL EMAIL, NOT A TEMPLATE (if in Write Email mode).
    - SECTION 5 MUST CONTAIN VALID JSON FOR STRATEGY MODE.
    - ZERO PLACEHOLDERS: If you use [ ] or { } in the final text (outside JSON), you have FAILED.
    - Be concise, actionable, and "wolf of wall street" style confident.
    - Use professional formatting (bullet points, bold text).
    - OUTPUT ONLY what is asked for in the user's selected mode (${salesMode}).
    `;

    return aisalesPrompt;
}
