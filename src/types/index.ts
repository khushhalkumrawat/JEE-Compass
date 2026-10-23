import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface DashboardStat {
  label: string
  value: string
  change?: string
  helper?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
}

export interface Module {
  id: string
  title: string
  description: string
  icon: LucideIcon
  path: string
  accent: string
  status: string
}

export interface StudyTask {
  id: number
  title: string
  subject: string
  time: string
  done: boolean
}