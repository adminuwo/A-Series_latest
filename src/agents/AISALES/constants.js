export const PERSONAS = {
    CEO: {
        focus: 'ROI, strategic vision, competitive advantage, market leadership',
        language: 'Executive, high-level, outcome-focused, strategic',
        painPoints: 'Revenue growth, market share, operational efficiency, competitive threats',
        decisionCriteria: 'Strategic alignment, long-term value, competitive positioning'
    },
    CTO: {
        focus: 'Technical architecture, security, scalability, integration complexity',
        language: 'Technical, detailed, implementation-focused, architecture-oriented',
        painPoints: 'Tech debt, integration challenges, security vulnerabilities, scalability issues',
        decisionCriteria: 'Technical fit, security standards, scalability, vendor reliability'
    },
    'VP Sales': {
        focus: 'Pipeline growth, team productivity, quota attainment, sales velocity',
        language: 'Metrics-driven, practical, results-oriented, performance-focused',
        painPoints: 'Lead quality, sales cycle length, conversion rates, team efficiency',
        decisionCriteria: 'Impact on quota, ease of adoption, ROI timeline, team buy-in'
    },
    'VP Marketing': {
        focus: 'Lead generation, brand awareness, campaign ROI, attribution',
        language: 'Creative yet data-driven, brand-conscious, growth-focused',
        painPoints: 'Lead quality, attribution complexity, budget constraints, proving ROI',
        decisionCriteria: 'Marketing ROI, lead quality improvement, ease of integration'
    },
    CFO: {
        focus: 'Cost reduction, financial ROI, budget optimization, risk management',
        language: 'Financial, analytical, risk-averse, ROI-focused',
        painPoints: 'Budget constraints, proving ROI, cost control, financial risk',
        decisionCriteria: 'Clear ROI, payback period, total cost of ownership, financial risk'
    }
};

export const OBJECTION_TYPES = [
    'Price/Budget',
    'Timing ("Not now")',
    'Authority ("Need to check with...")',
    'Competitor ("Using X already")',
    'Trust ("Never heard of you")',
    'Need ("Don\'t need this")',
    'Implementation ("Too complex")'
];

export const FUNNEL_STAGES = [
    'Awareness (Cold)',
    'Interest (Engaged)',
    'Consideration (Evaluating)',
    'Intent (Demo Requested)',
    'Purchase (Negotiating)',
    'Closed Won',
    'Closed Lost'
];

export const DEAL_STAGES = [
    'Closed Won',
    'Closed Lost'
];

export const STAKEHOLDERS = [
    { role: 'CEO', priority: 'High' },
    { role: 'CTO', priority: 'High' },
    { role: 'CFO', priority: 'High' },
    { role: 'VP Sales', priority: 'Medium' },
    { role: 'VP Marketing', priority: 'Medium' }
];
