import type { SolutionTab } from '../types/course';

const STORAGE_KEYS = {
  SOLVED: 'py_interviews_solved_v1',
  TABS: 'py_interviews_tabs_v1',
  ACTIVE_LESSON: 'py_interviews_active_lesson_v1',
  THEME: 'py_interviews_theme_v1',
  FONT_SIZE: 'py_interviews_font_size_v1',
  SIDEBAR_OPEN: 'py_interviews_sidebar_open_v1',
} as const;

export function loadSolvedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOLVED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveSolvedIds(solved: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOLVED, JSON.stringify([...solved]));
  } catch {
    // ignore quota errors
  }
}

export function loadLessonTabs(lessonId: string, starterCode: string): SolutionTab[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABS);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, SolutionTab[]>;
      if (Array.isArray(map[lessonId]) && map[lessonId].length > 0) {
        return map[lessonId];
      }
    }
  } catch {
    // fallback to default
  }
  return [{ id: 'tab-1', name: 'Solution 1', code: starterCode }];
}

export function saveLessonTabs(lessonId: string, tabs: SolutionTab[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TABS);
    const map: Record<string, SolutionTab[]> = raw ? JSON.parse(raw) : {};
    map[lessonId] = tabs;
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}

export function loadActiveLessonId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_LESSON);
  } catch {
    return null;
  }
}

export function saveActiveLessonId(lessonId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LESSON, lessonId);
  } catch {
    // ignore
  }
}

export function loadTheme(): 'dark' | 'light' {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.THEME);
    return val === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // ignore
  }
}

export function loadFontSize(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    const parsed = raw ? Number(raw) : 14;
    return Number.isFinite(parsed) && parsed >= 12 && parsed <= 22 ? parsed : 14;
  } catch {
    return 14;
  }
}

export function saveFontSize(size: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(size));
  } catch {
    // ignore
  }
}

export function loadSidebarOpen(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveSidebarOpen(open: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(open));
  } catch {
    // ignore
  }
}

export function clearAllProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SOLVED);
    localStorage.removeItem(STORAGE_KEYS.TABS);
  } catch {
    // ignore
  }
}
