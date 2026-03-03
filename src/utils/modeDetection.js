/**
 * Mode Detection Utility for AIVA Frontend
 * Mirrors backend mode detection for UI consistency
 */

export const MODES = {
    NORMAL_CHAT: 'NORMAL_CHAT',
    FILE_ANALYSIS: 'FILE_ANALYSIS',
    CONTENT_WRITING: 'CONTENT_WRITING',
    CODING_HELP: 'CODING_HELP',
    TASK_ASSISTANT: 'TASK_ASSISTANT',
    DEEP_SEARCH: 'DEEP_SEARCH',
    FILE_CONVERSION: 'FILE_CONVERSION',
    IMAGE_GEN: 'IMAGE_GEN',
    VIDEO_GEN: 'VIDEO_GEN',
    AUDIO_GEN: 'AUDIO_GEN',
    IMAGE_EDIT: 'IMAGE_EDIT'
};

const CODING_KEYWORDS = [
    'code', 'function', 'class', 'debug', 'error', 'bug', 'programming',
    'javascript', 'python', 'java', 'react', 'node', 'api', 'algorithm',
    'syntax', 'compile', 'runtime', 'variable', 'loop', 'array', 'object',
    'database', 'sql', 'html', 'css', 'typescript', 'component', 'import',
    'export', 'async', 'await', 'promise', 'callback', 'fix this code',
    'write a function', 'create a script', 'implement', 'refactor'
];

const WRITING_KEYWORDS = [
    'write', 'article', 'blog', 'essay', 'content', 'draft', 'compose',
    'create a post', 'write about', 'paragraph', 'story', 'letter',
    'email template', 'description', 'summary', 'report', 'document',
    'copywriting', 'marketing copy', 'social media post', 'caption',
    'headline', 'slogan', 'tagline', 'press release'
];

const TASK_KEYWORDS = [
    'task', 'todo', 'plan', 'schedule', 'organize', 'goal', 'objective',
    'steps', 'how to', 'guide me', 'help me plan', 'breakdown', 'roadmap',
    'timeline', 'priority', 'checklist', 'action items', 'strategy',
    'project plan', 'workflow', 'process', 'milestone'
];

export function detectMode(message = '', attachments = []) {
    const lowerMessage = message.toLowerCase().trim();

    // Priority 1: Image/Video Generation Intent (DEACTIVATED AUTO-DETECTION - Requires Explicit Selection)
    /*
    if (
        (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('pic') || lowerMessage.includes('draw')) &&
        (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('show'))
    ) {
        console.log(`[MODE DETECTION] Detected IMAGE_GEN for: "${message}"`);
        return MODES.IMAGE_GEN;
    }

    if (lowerMessage.includes('video') && (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('make'))) {
        return MODES.VIDEO_GEN;
    }

    // Audio Generation Intent
    if (
        (lowerMessage.includes('audio') || lowerMessage.includes('sound') || lowerMessage.includes('music') || lowerMessage.includes('voice') || lowerMessage.includes('song')) &&
        (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('compose'))
    ) {
        return MODES.AUDIO_GEN;
    }
    */

    // Priority 2: File Analysis / Image Edit
    if (attachments && attachments.length > 0) {
        const lowerInput = lowerMessage;
        const isImageAttachment = attachments.some(a => a.type === 'image' || (a.name && a.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)));

        if (isImageAttachment && (
            lowerInput.includes('edit') || lowerInput.includes('modify') || lowerInput.includes('change') ||
            lowerInput.includes('background') || lowerInput.includes('retouch') || lowerInput.includes('fix') ||
            lowerInput.includes('badlo') || lowerInput.includes('editing')
        )) {
            return MODES.IMAGE_EDIT;
        }

        // Simple check for conversion intent if files are present
        if (lowerMessage.includes('convert') || lowerMessage.includes('to pdf') || lowerMessage.includes('to doc') ||
            lowerMessage.includes('to word') || lowerMessage.includes('pptx to') || lowerMessage.includes('excel to') ||
            lowerMessage.includes('image to')) {
            return MODES.FILE_CONVERSION;
        }
        return MODES.FILE_ANALYSIS;
    }

    const hasCodingKeywords = CODING_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword)
    );

    const hasCodePattern = /```|function\s*\(|const\s+\w+\s*=|class\s+\w+|import\s+.*from|<\w+>|{\s*\w+:|\/\/|\/\*/.test(message);

    if (hasCodingKeywords || hasCodePattern) {
        return MODES.CODING_HELP;
    }

    const hasWritingKeywords = WRITING_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword)
    );

    if (hasWritingKeywords) {
        return MODES.CONTENT_WRITING;
    }

    const hasTaskKeywords = TASK_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword)
    );

    if (hasTaskKeywords) {
        return MODES.TASK_ASSISTANT;
    }

    return MODES.NORMAL_CHAT;
}

export function getModeName(mode) {
    const names = {
        [MODES.NORMAL_CHAT]: 'Chat',
        [MODES.FILE_ANALYSIS]: 'Analysis',
        [MODES.CONTENT_WRITING]: 'Writing',
        [MODES.CODING_HELP]: 'Coding',
        [MODES.TASK_ASSISTANT]: 'Tasks',
        [MODES.DEEP_SEARCH]: 'Deep Search',
        [MODES.FILE_CONVERSION]: 'Conversion',
        [MODES.IMAGE_GEN]: 'Image Gen',
        [MODES.VIDEO_GEN]: 'Video Gen',
        [MODES.AUDIO_GEN]: 'Audio Gen',
        [MODES.IMAGE_EDIT]: 'Image Edit'
    };
    return names[mode] || 'Chat';
}

export function getModeIcon(mode) {
    const icons = {
        [MODES.NORMAL_CHAT]: '💬',
        [MODES.FILE_ANALYSIS]: '📊',
        [MODES.CONTENT_WRITING]: '✍️',
        [MODES.CODING_HELP]: '💻',
        [MODES.TASK_ASSISTANT]: '📋',
        [MODES.DEEP_SEARCH]: '🔍',
        [MODES.FILE_CONVERSION]: '🔄',
        [MODES.IMAGE_GEN]: '🎨',
        [MODES.VIDEO_GEN]: '🎬',
        [MODES.AUDIO_GEN]: '🎵',
        [MODES.IMAGE_EDIT]: '🪄'
    };
    return icons[mode] || '💬';
}

export function getModeColor(mode) {
    const colors = {
        [MODES.NORMAL_CHAT]: '#6366f1', // Indigo
        [MODES.FILE_ANALYSIS]: '#8b5cf6', // Violet
        [MODES.CONTENT_WRITING]: '#f43f5e', // Rose
        [MODES.CODING_HELP]: '#10b981', // Emerald
        [MODES.TASK_ASSISTANT]: '#f59e0b', // Amber
        [MODES.DEEP_SEARCH]: '#0ea5e9', // Sky
        [MODES.FILE_CONVERSION]: '#ec4899', // Pink
        [MODES.IMAGE_GEN]: '#f43f5e', // Rose
        [MODES.VIDEO_GEN]: '#8b5cf6',  // Violet
        [MODES.AUDIO_GEN]: '#06b6d4',  // Cyan
        [MODES.IMAGE_EDIT]: '#8b5cf6'  // Violet
    };
    return colors[mode] || '#6366f1';
}
