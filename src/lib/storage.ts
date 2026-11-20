import type { SolutionTab } from '../types/course';

const STORAGE_KEYS = {
  SOLVED: 'py_interviews_solved_v1',
  TABS: 'py_interviews_tabs_v1',
  ACTIVE_LESSON: 'py_interviews_active_lesson_v1',
  THEME: 'py_interviews_theme_v1',
  FONT_SIZE: 'py_interviews_font_size_v1',
  SIDEBAR_OPEN: 'py_interviews_sidebar_open_v1',
} as const;

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 22;
const FONT_SIZE_DEFAULT = 14;

/** Debounce window for persisting editor code, which changes on every keystroke. */
const TABS_WRITE_DELAY_MS = 400;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readJson(key: string): unknown {
  const raw = read(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadSolvedIds(): Set<string> {
  const arr = readJson(STORAGE_KEYS.SOLVED);
  return new Set(Array.isArray(arr) ? arr : []);
}

export function saveSolvedIds(solved: Set<string>): void {
  write(STORAGE_KEYS.SOLVED, JSON.stringify([...solved]));
}

// ---------------------------------------------------------------------------
// Per-lesson solution tabs
//
// All lessons' tabs live under one key. The map is parsed once and kept in
// memory; writes are debounced and flushed when the page is hidden, so a
// keystroke costs one in-memory assignment instead of a full parse/serialize.
// ---------------------------------------------------------------------------

let tabsCache: Record<string, SolutionTab[]> | null = null;
let tabsWriteTimer: ReturnType<typeof setTimeout> | null = null;

function getTabsMap(): Record<string, SolutionTab[]> {
  if (!tabsCache) {
    const parsed = readJson(STORAGE_KEYS.TABS);
    tabsCache =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, SolutionTab[]>)
        : {};
  }
  return tabsCache;
}

function flushTabs(): void {
  if (tabsWriteTimer === null) return;
  clearTimeout(tabsWriteTimer);
  tabsWriteTimer = null;
  write(STORAGE_KEYS.TABS, JSON.stringify(getTabsMap()));
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushTabs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushTabs();
  });
}

export function defaultTabs(starterCode: string): SolutionTab[] {
  return [{ id: 'tab-1', name: 'Solution 1', code: starterCode }];
}

export function loadLessonTabs(lessonId: string, starterCode: string): SolutionTab[] {
  const saved = getTabsMap()[lessonId];
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultTabs(starterCode);
}

export function saveLessonTabs(lessonId: string, tabs: SolutionTab[]): void {
  getTabsMap()[lessonId] = tabs;
  if (tabsWriteTimer === null) {
    tabsWriteTimer = setTimeout(flushTabs, TABS_WRITE_DELAY_MS);
  }
}

export function loadActiveLessonId(): string | null {
  return read(STORAGE_KEYS.ACTIVE_LESSON);
}

export function saveActiveLessonId(lessonId: string): void {
  write(STORAGE_KEYS.ACTIVE_LESSON, lessonId);
}

export function loadTheme(): 'dark' | 'light' {
  return read(STORAGE_KEYS.THEME) === 'light' ? 'light' : 'dark';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  write(STORAGE_KEYS.THEME, theme);
}

export function loadFontSize(): number {
  const parsed = Number(read(STORAGE_KEYS.FONT_SIZE) ?? FONT_SIZE_DEFAULT);
  return Number.isFinite(parsed) && parsed >= FONT_SIZE_MIN && parsed <= FONT_SIZE_MAX
    ? parsed
    : FONT_SIZE_DEFAULT;
}

export function saveFontSize(size: number): void {
  write(STORAGE_KEYS.FONT_SIZE, String(size));
}

export function loadSidebarOpen(): boolean {
  const val = read(STORAGE_KEYS.SIDEBAR_OPEN);
  return val === null || val === 'true';
}

export function saveSidebarOpen(open: boolean): void {
  write(STORAGE_KEYS.SIDEBAR_OPEN, String(open));
}

export function clearAllProgress(): void {
  if (tabsWriteTimer !== null) {
    clearTimeout(tabsWriteTimer);
    tabsWriteTimer = null;
  }
  tabsCache = {};
  remove(STORAGE_KEYS.SOLVED);
  remove(STORAGE_KEYS.TABS);
}
