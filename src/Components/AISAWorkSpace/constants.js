import {
    Target,
    FileText,
    MessageSquare,
    BarChart3,
    Users,
    Heart
} from 'lucide-react';

export const AGENTS = [
    { id: 'AISALES', name: 'Sales Intelligence', icon: Target, category: 'Growth', color: 'blue' },
    { id: 'AIWRITE', name: 'Content Intelligence', icon: FileText, category: 'Marketing', color: 'pink' },
    { id: 'AIDESK', name: 'Service Intelligence', icon: MessageSquare, category: 'Service', color: 'emerald' },
    { id: 'AIBIZ', name: 'Business Intelligence', icon: BarChart3, category: 'Strategy', color: 'red' },
    { id: 'AIHIRE', name: 'Hire Intelligence', icon: Users, category: 'HR', color: 'emerald' },
    { id: 'AIHEALTH', name: 'Health Intelligence', icon: Heart, category: 'Wellness', color: 'rose' },
];

export const DEAL_STAGES = [
    'Closed Won',
    'Closed Lost'
];

