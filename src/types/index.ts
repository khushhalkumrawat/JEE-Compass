import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
label: string
path: string
icon: LucideIcon
}

export interface StudyTask {
id: number
subject: string
title: string
time: string
done: boolean
}

export interface Module {
title: string
description: string
path: string
icon: LucideIcon
color: string
bg: string
label: string
}

export interface DashboardStat {
label: string
value: string
note: string
icon: LucideIcon
color: string
}
