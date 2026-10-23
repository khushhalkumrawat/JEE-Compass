import {
BookOpen,
BrainCircuit,
ChartNoAxesCombined,
Clock3,
FileText,
LayoutDashboard,
Target,
Flame,
} from 'lucide-react'

import type {
DashboardStat,
Module,
NavigationItem,
StudyTask,
} from '../types'

export const navigationItems: NavigationItem[] = [
{ label: 'Dashboard', path: '/', icon: LayoutDashboard },
{ label: 'Study Material', path: '/materials', icon: BookOpen },
{ label: 'Daily Practice', path: '/dpp', icon: FileText },
{ label: 'AI Doubt Solver', path: '/doubts', icon: BrainCircuit },
{ label: 'Mock Tests', path: '/tests', icon: Clock3 },
{ label: 'Performance Analysis', path: '/analysis', icon: ChartNoAxesCombined },
]

export const modules: Module[] = [
{
title: 'Study Material',
description: 'Chapter-wise notes, lectures and revision resources.',
path: '/materials',
icon: BookOpen,
color: '#60a5fa',
bg: 'rgba(96,165,250,0.12)',
label: 'EXPLORE LIBRARY',
},
{
title: 'Daily Practice',
description: 'Build consistency with daily practice problems.',
path: '/dpp',
icon: FileText,
color: '#34d399',
bg: 'rgba(52,211,153,0.12)',
label: 'SOLVE DPP',
},
{
title: 'AI Doubt Solver',
description: 'Understand difficult concepts with step-by-step help.',
path: '/doubts',
icon: BrainCircuit,
color: '#c084fc',
bg: 'rgba(192,132,252,0.12)',
label: 'ASK A DOUBT',
},
{
title: 'Mock Tests',
description: 'Practice with a timed computer-based exam interface.',
path: '/tests',
icon: Clock3,
color: '#fb923c',
bg: 'rgba(251,146,60,0.12)',
label: 'TAKE A TEST',
},
{
title: 'Performance Analysis',
description: 'Discover weak chapters and understand your mistakes.',
path: '/analysis',
icon: ChartNoAxesCombined,
color: '#f472b6',
bg: 'rgba(244,114,182,0.12)',
label: 'VIEW ANALYSIS',
},
]

export const dashboardStats: DashboardStat[] = [
{
label: 'Questions Solved',
value: '0',
note: 'Start your first practice',
icon: Target,
color: '#818cf8',
},
{
label: 'Study Streak',
value: '0 days',
note: 'Build your daily habit',
icon: Flame,
color: '#fb923c',
},
{
label: 'Mock Tests',
value: '0',
note: 'Your first test awaits',
icon: Clock3,
color: '#34d399',
},
{
label: 'Accuracy',
value: '—',
note: 'Appears after practice',
icon: ChartNoAxesCombined,
color: '#c084fc',
},
]

export const initialStudyTasks: StudyTask[] = [
{
id: 1,
subject: 'PHYSICS',
title: 'Revise Laws of Motion',
time: '20 min',
done: false,
},
{
id: 2,
subject: 'CHEMISTRY',
title: 'Practice Chemical Bonding',
time: '25 min',
done: false,
},
{
id: 3,
subject: 'MATHEMATICS',
title: 'Solve Quadratic Equations DPP',
time: '30 min',
done: false,
},
]
