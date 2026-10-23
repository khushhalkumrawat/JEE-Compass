import {
  BookOpen,
  BrainCircuit,
  Calendar,
  ChartNoAxesCombined,
  Clock3,
  FileText,
  Flame,
  LayoutDashboard,
  Target,
} from 'lucide-react'
import type {
  DashboardStat,
  Module,
  NavigationItem,
  StudyTask,
} from '../types'

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Study Plan', path: '/study-plan', icon: Calendar },
  { label: 'Study Material', path: '/materials', icon: BookOpen },
  { label: 'Daily Practice', path: '/dpp', icon: FileText },
  { label: 'AI Doubt Solver', path: '/doubts', icon: BrainCircuit },
  { label: 'Mock Tests', path: '/tests', icon: Clock3 },
  { label: 'Performance Analysis', path: '/analysis', icon: ChartNoAxesCombined },
]

export const stats: DashboardStat[] = [
  {
    label: 'Overall Accuracy',
    value: '74%',
    change: '+3.2% this week',
    helper: '+3.2% this week',
    trend: 'up',
    icon: Target,
  },
  {
    label: 'Questions Solved',
    value: '348',
    change: '+24 today',
    helper: '+24 today',
    trend: 'up',
    icon: FileText,
  },
  {
    label: 'Study Streak',
    value: '12 Days',
    change: 'Personal best',
    helper: 'Personal best',
    trend: 'up',
    icon: Flame,
  },
  {
    label: 'Test Readiness',
    value: 'JEE Main Ready',
    change: 'Next mock in 2 days',
    helper: 'Next mock in 2 days',
    trend: 'neutral',
    icon: Clock3,
  },
]

export const modules: Module[] = [
  {
    id: 'study-plan',
    title: 'Adaptive Study Plan',
    description: 'Prioritized daily schedule addressing your weakest test topics.',
    icon: Calendar,
    path: '/study-plan',
    accent: 'indigo',
    status: 'Personalized',
  },
  {
    id: 'dpp',
    title: 'Daily Practice Problems',
    description: 'Curated JEE-level questions with immediate explanations and hints.',
    icon: FileText,
    path: '/dpp',
    accent: 'cyan',
    status: '15 New Today',
  },
  {
    id: 'doubts',
    title: 'AI Doubt Solver',
    description: 'Instant step-by-step breakdown of difficult concepts and numericals.',
    icon: BrainCircuit,
    path: '/doubts',
    accent: 'emerald',
    status: 'Always Online',
  },
  {
    id: 'materials',
    title: 'Study Library',
    description: 'High-yield formula cheat sheets, revision notes, and concepts.',
    icon: BookOpen,
    path: '/materials',
    accent: 'blue',
    status: 'Updated',
  },
  {
    id: 'tests',
    title: 'CBT Mock Engine',
    description: 'Authentic JEE test simulation with timers and question palette.',
    icon: Clock3,
    path: '/tests',
    accent: 'amber',
    status: 'Ready',
  },
  {
    id: 'analysis',
    title: 'Performance Analytics',
    description: 'Deep-dive insights into accuracy, time per question, and weak topics.',
    icon: ChartNoAxesCombined,
    path: '/analysis',
    accent: 'violet',
    status: 'Insight Ready',
  },
]

export const studyTasks: StudyTask[] = [
  {
    id: 1,
    title: 'Revise Rotational Dynamics & Moment of Inertia',
    subject: 'Physics',
    time: '45 mins',
    done: false,
  },
  {
    id: 2,
    title: 'Practice 15 Numericals on Coordination Compounds',
    subject: 'Chemistry',
    time: '30 mins',
    done: false,
  },
  {
    id: 3,
    title: 'Solve Definite Integrals DPP (Level 2)',
    subject: 'Mathematics',
    time: '60 mins',
    done: false,
  },
]

export const dashboardStats = stats
export const initialStudyTasks = studyTasks