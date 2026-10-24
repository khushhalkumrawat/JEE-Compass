import { initialStudyTasks } from "../data/dashboard";
import type { StudyTask } from "../types";

export type DailyTask = StudyTask & {
  id: number;
};

export type DailyHistory = {
  date: string;
  tasks: DailyTask[];
  completed: number;
  total: number;
  progress: number;
};

const STORAGE_PREFIX = "jee-compass-daily-tasks-";

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${STORAGE_PREFIX}${year}-${month}-${day}`;
}

export function getDateString(date = new Date()): string {
  return getDateKey(date).replace(STORAGE_PREFIX, "");
}

function createInitialTasks(): DailyTask[] {
  return initialStudyTasks.map((task, index) => ({
    ...task,
    id: Date.now() + index,
    done: false,
  }));
}

export function getTasksForDate(date: string): DailyTask[] {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${date}`);

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as DailyTask[]) : [];
    }

    return [];
  } catch {
    return [];
  }
}

export function getDailyTasks(): DailyTask[] {
  const key = getDateKey();

  try {
    const saved = localStorage.getItem(key);

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as DailyTask[];
      }
    }

    const tasks = createInitialTasks();
    localStorage.setItem(key, JSON.stringify(tasks));

    return tasks;
  } catch {
    return createInitialTasks();
  }
}

export function saveDailyTasks(tasks: DailyTask[]) {
  try {
    localStorage.setItem(getDateKey(), JSON.stringify(tasks));
  } catch (error) {
    console.error("Unable to save daily tasks:", error);
  }
}

export function getDailyHistory(): DailyHistory[] {
  const history: DailyHistory[] = [];

  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (!key?.startsWith(STORAGE_PREFIX)) continue;

      const date = key.slice(STORAGE_PREFIX.length);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

      const tasks = getTasksForDate(date);
      const completed = tasks.filter((task) => task.done).length;
      const total = tasks.length;

      history.push({
        date,
        tasks,
        completed,
        total,
        progress: total ? Math.round((completed / total) * 100) : 0,
      });
    }
  } catch (error) {
    console.error("Unable to load daily history:", error);
  }

  return history.sort((a, b) => b.date.localeCompare(a.date));
}

export function formatHistoryDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}