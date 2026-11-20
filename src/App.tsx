import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LESSONS,
  SECTIONS,
  getLessonById,
  getLessonsBySection,
  getSectionById,
} from './data';
import type { RunResult, RuntimeStatus, SolutionTab } from './types/course';
import { pyodideRunner } from './lib/pyodideRunner';
import {
  clearAllProgress,
  loadActiveLessonId,
  loadFontSize,
  loadLessonTabs,
  loadSidebarOpen,
  loadSolvedIds,
  loadTheme,
  saveActiveLessonId,
  saveFontSize,
  saveLessonTabs,
  saveSidebarOpen,
  saveSolvedIds,
  saveTheme,
} from './lib/storage';
import { TopBar } from './components/TopBar';
import { LessonPane } from './components/LessonPane';
import { CodeEditor } from './components/CodeEditor';
import { ConsolePanel } from './components/ConsolePanel';
import { CurriculumSidebar } from './components/CurriculumSidebar';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());
  const [fontSize, setFontSize] = useState<number>(() => loadFontSize());
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => loadSolvedIds());

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    const saved = loadActiveLessonId();
    if (saved && LESSONS.some((l) => l.id === saved)) return saved;
    return LESSONS[0].id;
  });

  const currentLesson = useMemo(() => getLessonById(activeLessonId), [activeLessonId]);
  const currentSection = useMemo(
    () => getSectionById(currentLesson.sectionId),
    [currentLesson.sectionId]
  );
  const sectionLessons = useMemo(
    () => getLessonsBySection(currentLesson.sectionId),
    [currentLesson.sectionId]
  );
  const positionInSection =
    sectionLessons.findIndex((l) => l.id === currentLesson.id) + 1;

  // Per-lesson solution tabs
  const [tabs, setTabs] = useState<SolutionTab[]>(() =>
    loadLessonTabs(currentLesson.id, currentLesson.starterCode)
  );
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id ?? 'tab-1');

  // Lessons sidebar
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => loadSidebarOpen());
  const [sidebarWidth, setSidebarWidth] = useState<number>(268);

  // Runtime + console state
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus>('loading');
  const [runtimeError, setRuntimeError] = useState<string | undefined>();
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // Split pane state
  const [leftWidthPct, setLeftWidthPct] = useState(44);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const contentSplitRef = useRef<HTMLDivElement | null>(null);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Subscribe to Pyodide Web Worker status
  useEffect(() => {
    return pyodideRunner.subscribe((status, err) => {
      setRuntimeStatus(status);
      setRuntimeError(err);
    });
  }, []);

  // Load tabs when lesson changes
  useEffect(() => {
    saveActiveLessonId(currentLesson.id);
    const loadedTabs = loadLessonTabs(currentLesson.id, currentLesson.starterCode);
    setTabs(loadedTabs);
    setActiveTabId(loadedTabs[0].id);
    setRunResult(null);
  }, [currentLesson.id, currentLesson.starterCode]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId]
  );

  const handleChangeCode = useCallback(
    (newCode: string) => {
      setTabs((prev) => {
        const next = prev.map((t) =>
          t.id === activeTabId ? { ...t, code: newCode } : t
        );
        saveLessonTabs(currentLesson.id, next);
        return next;
      });
    },
    [activeTabId, currentLesson.id]
  );

  const handleAddTab = useCallback(() => {
    setTabs((prev) => {
      const nextNum = prev.length + 1;
      const newTab: SolutionTab = {
        id: `tab-${Date.now()}`,
        name: `Solution ${nextNum}`,
        code: currentLesson.starterCode,
      };
      const next = [...prev, newTab];
      saveLessonTabs(currentLesson.id, next);
      setActiveTabId(newTab.id);
      return next;
    });
  }, [currentLesson.id, currentLesson.starterCode]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((t) => t.id !== tabId);
        saveLessonTabs(currentLesson.id, next);
        if (tabId === activeTabId) {
          setActiveTabId(next[0].id);
        }
        return next;
      });
    },
    [activeTabId, currentLesson.id]
  );

  const handleResetCode = useCallback(() => {
    handleChangeCode(currentLesson.starterCode);
  }, [currentLesson.starterCode, handleChangeCode]);

  const handleApplySolution = useCallback(
    (solutionCode: string) => {
      handleChangeCode(solutionCode);
    },
    [handleChangeCode]
  );

  const executeCode = useCallback(
    async (mode: 'run' | 'submit') => {
      if (runtimeStatus === 'loading' || runtimeStatus === 'running') return;
      setConsoleOpen(true);
      const res = await pyodideRunner.execute({
        mode,
        code: activeTab.code,
        expectedOutput: currentLesson.expectedOutput,
        testCases: currentLesson.testCases,
      });
      setRunResult(res);

      if (mode === 'submit' && res.allTestsPassed) {
        setSolvedIds((prev) => {
          if (prev.has(currentLesson.id)) return prev;
          const next = new Set(prev);
          next.add(currentLesson.id);
          saveSolvedIds(next);
          return next;
        });
      }
    },
    [activeTab.code, currentLesson, runtimeStatus]
  );

  const handleRun = useCallback(() => {
    void executeCode('run');
  }, [executeCode]);

  const handleSubmit = useCallback(() => {
    void executeCode('submit');
  }, [executeCode]);

  const handleStop = useCallback(() => {
    pyodideRunner.stopExecution();
  }, []);

  const currentIdx = currentLesson.index;
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < LESSONS.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) setActiveLessonId(LESSONS[currentIdx - 1].id);
  }, [hasPrev, currentIdx]);

  const goToNext = useCallback(() => {
    if (hasNext) setActiveLessonId(LESSONS[currentIdx + 1].id);
  }, [hasNext, currentIdx]);

  const handleResetProgress = useCallback(() => {
    clearAllProgress();
    setSolvedIds(new Set());
    const fresh = [{ id: 'tab-1', name: 'Solution 1', code: currentLesson.starterCode }];
    setTabs(fresh);
    setActiveTabId('tab-1');
    setRunResult(null);
  }, [currentLesson.starterCode]);

  const handleChangeFontSize = useCallback((size: number) => {
    setFontSize(size);
    saveFontSize(size);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      saveSidebarOpen(next);
      return next;
    });
  }, []);

  // Sidebar width drag
  const handleSidebarDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setSidebarWidth(Math.min(400, Math.max(210, startWidth + delta)));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Horizontal split drag (LessonPane vs CodeEditor)
  const handleHorizontalDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = contentSplitRef.current;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const pct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(68, Math.max(26, pct)));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Vertical console drag
  const handleConsoleDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      setConsoleHeight(Math.min(500, Math.max(130, startHeight + delta)));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'row-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <TopBar
        lesson={currentLesson}
        section={currentSection}
        positionInSection={positionInSection}
        sectionTotal={sectionLessons.length}
        totalLessons={LESSONS.length}
        solvedCount={solvedIds.size}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goToPrev}
        onNext={goToNext}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Split Workspace */}
      <main className="flex min-h-0 flex-1 overflow-hidden p-2">
        {/* Collapsible & Resizable Lessons Sidebar */}
        {sidebarOpen && (
          <>
            <CurriculumSidebar
              sections={SECTIONS}
              lessons={LESSONS}
              currentLesson={currentLesson}
              solvedIds={solvedIds}
              onSelectLesson={(id) => setActiveLessonId(id)}
              onResetProgress={handleResetProgress}
              onClose={handleToggleSidebar}
              width={sidebarWidth}
            />
            <div
              onMouseDown={handleSidebarDrag}
              className="group flex w-2.5 shrink-0 cursor-col-resize items-center justify-center"
              title="Drag to resize sidebar"
            >
              <div className="h-10 w-1 rounded-full bg-[var(--border-strong)] transition-colors group-hover:bg-indigo-500" />
            </div>
          </>
        )}

        {/* Content Split: Question Pane + Code Editor/Console */}
        <div
          ref={contentSplitRef}
          className="flex h-full min-w-0 flex-1 overflow-hidden"
        >
          {/* Left Pane: Question / Solution / Hints */}
          {!editorExpanded && (
            <div
              className="h-full min-w-0 shrink-0"
              style={{ width: `${leftWidthPct}%` }}
            >
              <LessonPane
                lesson={currentLesson}
                isSolved={solvedIds.has(currentLesson.id)}
                onApplySolution={handleApplySolution}
              />
            </div>
          )}

          {/* Resizable Horizontal Gutter */}
          {!editorExpanded && (
            <div
              onMouseDown={handleHorizontalDrag}
              className="group flex w-2.5 shrink-0 cursor-col-resize items-center justify-center"
              title="Drag to resize panes"
            >
              <div className="h-10 w-1 rounded-full bg-[var(--border-strong)] transition-colors group-hover:bg-indigo-500" />
            </div>
          )}

          {/* Right Pane: Code Editor + Console */}
          <div
            className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-panel)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <CodeEditor
                tabs={tabs}
                activeTabId={activeTab.id}
                onSelectTab={setActiveTabId}
                onAddTab={handleAddTab}
                onCloseTab={handleCloseTab}
                onChangeCode={handleChangeCode}
                onResetCode={handleResetCode}
                onRun={handleRun}
                onSubmit={handleSubmit}
                theme={theme}
                fontSize={fontSize}
                onChangeFontSize={handleChangeFontSize}
                runtimeStatus={runtimeStatus}
                runtimeError={runtimeError}
                isExpanded={editorExpanded}
                onToggleExpand={() => setEditorExpanded((e) => !e)}
              />
            </div>

            <ConsolePanel
              isOpen={consoleOpen}
              onToggleOpen={() => setConsoleOpen((o) => !o)}
              height={consoleHeight}
              onResizeStart={handleConsoleDrag}
              result={runResult}
              runtimeStatus={runtimeStatus}
              onRun={handleRun}
              onSubmit={handleSubmit}
              onStop={handleStop}
              hasNextLesson={hasNext}
              onNextLesson={goToNext}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
