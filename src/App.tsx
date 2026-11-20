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
  defaultTabs,
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

/** Tracks a mouse drag on window until mouseup, with a resize cursor shown meanwhile. */
function startDrag(
  e: React.MouseEvent,
  cursor: 'col-resize' | 'row-resize',
  onMove: (ev: MouseEvent) => void
) {
  e.preventDefault();
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
  };
  document.body.style.cursor = cursor;
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onMouseUp);
}

const ResizeGutter: React.FC<{ onMouseDown: (e: React.MouseEvent) => void; title: string }> = ({
  onMouseDown,
  title,
}) => (
  <div
    onMouseDown={onMouseDown}
    className="group flex w-2.5 shrink-0 cursor-col-resize items-center justify-center"
    title={title}
  >
    <div className="h-10 w-1 rounded-full bg-[var(--border-strong)] transition-colors group-hover:bg-indigo-500" />
  </div>
);

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadTheme());
  const [fontSize, setFontSize] = useState<number>(() => loadFontSize());
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => loadSolvedIds());

  const [activeLessonId, setActiveLessonId] = useState<string>(
    () => getLessonById(loadActiveLessonId() ?? '').id
  );

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

  // Per-lesson solution tabs. `loadedTabsRef` holds the array last read from
  // storage so the save effect below skips it (only real edits are persisted).
  const [tabs, setTabs] = useState<SolutionTab[]>(() =>
    loadLessonTabs(currentLesson.id, currentLesson.starterCode)
  );
  const loadedTabsRef = useRef(tabs);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

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

  useEffect(() => {
    saveActiveLessonId(activeLessonId);
  }, [activeLessonId]);

  const showTabs = useCallback((next: SolutionTab[]) => {
    loadedTabsRef.current = next;
    setTabs(next);
    setActiveTabId(next[0].id);
  }, []);

  const selectLesson = useCallback(
    (lessonId: string) => {
      if (lessonId === activeLessonId) return;
      const lesson = getLessonById(lessonId);
      setActiveLessonId(lesson.id);
      showTabs(loadLessonTabs(lesson.id, lesson.starterCode));
      setRunResult(null);
    },
    [activeLessonId, showTabs]
  );

  // Persist edits. Lesson and tabs always change together (selectLesson), so
  // `activeLessonId` here is always the lesson these tabs belong to.
  useEffect(() => {
    if (tabs !== loadedTabsRef.current) saveLessonTabs(activeLessonId, tabs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Latest code for run/submit, read via ref so those callbacks stay stable while typing.
  const activeCodeRef = useRef(activeTab.code);
  activeCodeRef.current = activeTab.code;

  const handleChangeCode = useCallback(
    (newCode: string) => {
      // Update eagerly so a Run fired before React re-renders still sees this edit.
      activeCodeRef.current = newCode;
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, code: newCode } : t))
      );
    },
    [activeTabId]
  );

  const handleAddTab = useCallback(() => {
    const newTab: SolutionTab = {
      id: `tab-${Date.now()}`,
      name: `Solution ${tabs.length + 1}`,
      code: currentLesson.starterCode,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs, currentLesson.starterCode]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      if (tabs.length <= 1) return;
      const next = tabs.filter((t) => t.id !== tabId);
      setTabs(next);
      if (tabId === activeTabId) setActiveTabId(next[0].id);
    },
    [tabs, activeTabId]
  );

  const handleResetCode = useCallback(() => {
    handleChangeCode(currentLesson.starterCode);
  }, [currentLesson.starterCode, handleChangeCode]);

  const executeCode = useCallback(
    async (mode: 'run' | 'submit') => {
      if (runtimeStatus === 'loading' || runtimeStatus === 'running') return;
      setConsoleOpen(true);
      const res = await pyodideRunner.execute({
        mode,
        code: activeCodeRef.current,
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
    [currentLesson, runtimeStatus]
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
    if (hasPrev) selectLesson(LESSONS[currentIdx - 1].id);
  }, [hasPrev, currentIdx, selectLesson]);

  const goToNext = useCallback(() => {
    if (hasNext) selectLesson(LESSONS[currentIdx + 1].id);
  }, [hasNext, currentIdx, selectLesson]);

  const handleResetProgress = useCallback(() => {
    clearAllProgress();
    setSolvedIds(new Set());
    showTabs(defaultTabs(currentLesson.starterCode));
    setRunResult(null);
  }, [currentLesson.starterCode, showTabs]);

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

  const handleToggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleToggleExpand = useCallback(() => setEditorExpanded((e) => !e), []);
  const handleToggleConsole = useCallback(() => setConsoleOpen((o) => !o), []);

  // Pane resizing
  const handleSidebarDrag = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    startDrag(e, 'col-resize', (ev) => {
      setSidebarWidth(Math.min(400, Math.max(210, startWidth + ev.clientX - startX)));
    });
  };

  const handleHorizontalDrag = (e: React.MouseEvent) => {
    const container = contentSplitRef.current;
    if (!container) return;
    startDrag(e, 'col-resize', (ev) => {
      const rect = container.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(68, Math.max(26, pct)));
    });
  };

  const handleConsoleDrag = useCallback(
    (e: React.MouseEvent) => {
      const startY = e.clientY;
      const startHeight = consoleHeight;
      startDrag(e, 'row-resize', (ev) => {
        setConsoleHeight(Math.min(500, Math.max(130, startHeight + startY - ev.clientY)));
      });
    },
    [consoleHeight]
  );

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <TopBar
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
        onToggleTheme={handleToggleTheme}
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
              onSelectLesson={selectLesson}
              onResetProgress={handleResetProgress}
              width={sidebarWidth}
            />
            <ResizeGutter onMouseDown={handleSidebarDrag} title="Drag to resize sidebar" />
          </>
        )}

        {/* Content Split: Question Pane + Code Editor/Console */}
        <div
          ref={contentSplitRef}
          className="flex h-full min-w-0 flex-1 overflow-hidden"
        >
          {/* Left Pane: Question / Solution / Hints, plus resizable gutter */}
          {!editorExpanded && (
            <>
              <div
                className="h-full min-w-0 shrink-0"
                style={{ width: `${leftWidthPct}%` }}
              >
                <LessonPane
                  key={currentLesson.id}
                  lesson={currentLesson}
                  isSolved={solvedIds.has(currentLesson.id)}
                  onApplySolution={handleChangeCode}
                />
              </div>
              <ResizeGutter onMouseDown={handleHorizontalDrag} title="Drag to resize panes" />
            </>
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
                code={activeTab.code}
                docKey={`${currentLesson.id}/${activeTab.id}`}
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
                onToggleExpand={handleToggleExpand}
              />
            </div>

            <ConsolePanel
              isOpen={consoleOpen}
              onToggleOpen={handleToggleConsole}
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
