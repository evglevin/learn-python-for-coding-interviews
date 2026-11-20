import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  LESSONS,
  SECTIONS,
  getLessonById,
  getLessonsBySection,
  getSectionById,
} from './data';
import type { RunResult, SolutionTab } from './types/course';
import { pyodideRunner } from './lib/pyodideRunner';
import {
  clearAllProgress,
  defaultTabs,
  loadCollapsedSections,
  loadFontSize,
  loadLessonTabs,
  loadSidebarOpen,
  loadSolvedIds,
  loadWelcomeSeen,
  saveActiveLessonId,
  saveCollapsedSections,
  saveFontSize,
  saveLessonTabs,
  saveSidebarOpen,
  saveSolvedIds,
  saveTheme,
  saveWelcomeSeen,
} from './lib/storage';
import { lessonIdFromUrl, pushLessonUrl, showLessonInUrl } from './lib/lessonUrl';
import { TopBar } from './components/TopBar';
import { LessonPane } from './components/LessonPane';
import { CodeEditor, type CodeEditorHandle } from './components/CodeEditor';
import { ConsolePanel } from './components/ConsolePanel';
import { CurriculumSidebar } from './components/CurriculumSidebar';
import { WelcomeDialog } from './components/WelcomeDialog';

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
    <div className="h-10 w-1 rounded-full bg-[var(--border-strong)] transition-colors group-hover:bg-accent" />
  </div>
);

export default function App({
  initialTheme,
  initialLessonId,
}: {
  initialTheme: 'dark' | 'light';
  initialLessonId: string;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const [fontSize, setFontSize] = useState<number>(() => loadFontSize());
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => loadSolvedIds());
  const [showWelcome, setShowWelcome] = useState<boolean>(() => !loadWelcomeSeen());

  const [activeLessonId, setActiveLessonId] = useState(initialLessonId);

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

  // CodeMirror can emit multiple edits before React renders the updated tabs.
  const [tabs, setTabs] = useState<SolutionTab[]>(() =>
    loadLessonTabs(currentLesson.id, currentLesson.starterCode)
  );
  const tabsRef = useRef(tabs);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const editorRef = useRef<CodeEditorHandle>(null);

  // Lessons sidebar
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => loadSidebarOpen());
  const [sidebarWidth, setSidebarWidth] = useState<number>(268);
  // The saved state may collapse the restored lesson's section; keep it visible on load.
  const [collapsedSections, setCollapsedSections] = useState(() => {
    const collapsed = loadCollapsedSections();
    collapsed.delete(currentLesson.sectionId);
    return collapsed;
  });

  // Runtime + console state
  const { status: runtimeStatus, error: runtimeError } = useSyncExternalStore(
    pyodideRunner.subscribe,
    pyodideRunner.getSnapshot
  );
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // Split pane state
  const [leftWidthPct, setLeftWidthPct] = useState(44);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const contentSplitRef = useRef<HTMLDivElement | null>(null);

  const updateTabs = useCallback((next: SolutionTab[]) => {
    tabsRef.current = next;
    setTabs(next);
  }, []);

  const persistTabs = useCallback((next: SolutionTab[]) => {
    updateTabs(next);
    saveLessonTabs(activeLessonId, next);
  }, [activeLessonId, updateTabs]);

  const openTab = useCallback((tab: SolutionTab) => {
    setActiveTabId(tab.id);
    editorRef.current?.openDocument(tab.code);
  }, []);

  const setSectionCollapsed = useCallback((sectionId: string, collapsed: boolean) => {
    if (collapsedSections.has(sectionId) === collapsed) return;
    const next = new Set(collapsedSections);
    if (collapsed) next.add(sectionId);
    else next.delete(sectionId);
    setCollapsedSections(next);
    saveCollapsedSections(next);
  }, [collapsedSections]);

  /** Opens a lesson. `fromHistory` means the URL already points at it (Back/Forward). */
  const selectLesson = useCallback(
    (lessonId: string, fromHistory = false) => {
      if (lessonId === activeLessonId) return;
      const lesson = getLessonById(lessonId);
      if (lesson.sectionId !== currentLesson.sectionId) {
        setSectionCollapsed(lesson.sectionId, false);
      }
      setActiveLessonId(lesson.id);
      saveActiveLessonId(lesson.id);
      if (!fromHistory) pushLessonUrl(lesson.id);
      const nextTabs = loadLessonTabs(lesson.id, lesson.starterCode);
      updateTabs(nextTabs);
      openTab(nextTabs[0]);
      setRunResult(null);
    },
    [activeLessonId, currentLesson.sectionId, openTab, setSectionCollapsed, updateTabs]
  );

  // Browser Back/Forward changes the URL; open the lesson it now names.
  useEffect(() => {
    const onPopState = () => {
      const lessonId = lessonIdFromUrl();
      if (lessonId) selectLesson(lessonId, true);
      else showLessonInUrl(activeLessonId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeLessonId, selectLesson]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const handleChangeCode = useCallback(
    (newCode: string) => {
      persistTabs(
        tabsRef.current.map((t) => (t.id === activeTabId ? { ...t, code: newCode } : t))
      );
    },
    [activeTabId, persistTabs]
  );

  const handleSelectTab = useCallback((tabId: string) => {
    if (tabId === activeTabId) return;
    const tab = tabsRef.current.find((tab) => tab.id === tabId);
    if (tab) openTab(tab);
  }, [activeTabId, openTab]);

  const handleAddTab = useCallback(() => {
    const tabs = tabsRef.current;
    const newTab: SolutionTab = {
      id: `tab-${Date.now()}`,
      name: `Solution ${tabs.length + 1}`,
      code: currentLesson.starterCode,
    };
    persistTabs([...tabs, newTab]);
    openTab(newTab);
  }, [currentLesson.starterCode, openTab, persistTabs]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      const tabs = tabsRef.current;
      if (tabs.length <= 1) return;
      const next = tabs.filter((t) => t.id !== tabId);
      persistTabs(next);
      if (tabId === activeTabId) openTab(next[0]);
    },
    [activeTabId, openTab, persistTabs]
  );

  const handleApplyCode = useCallback((code: string) => {
    editorRef.current?.replaceCode(code);
    handleChangeCode(code);
  }, [handleChangeCode]);

  const handleResetCode = useCallback(() => {
    handleApplyCode(currentLesson.starterCode);
  }, [currentLesson.starterCode, handleApplyCode]);

  const executeCode = useCallback(
    async (mode: 'run' | 'submit') => {
      if (runtimeStatus === 'loading' || runtimeStatus === 'running') return;
      setConsoleOpen(true);
      const tabs = tabsRef.current;
      const tab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
      const res = await pyodideRunner.execute({
        mode,
        code: tab.code,
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
    [activeTabId, currentLesson, runtimeStatus]
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
    const next = defaultTabs(currentLesson.starterCode);
    updateTabs(next);
    if (activeTabId === next[0].id) editorRef.current?.replaceCode(next[0].code);
    else openTab(next[0]);
    setRunResult(null);
  }, [activeTabId, currentLesson.starterCode, openTab, updateTabs]);

  const handleChangeFontSize = useCallback((size: number) => {
    if (size === fontSize) return;
    setFontSize(size);
    saveFontSize(size);
    editorRef.current?.configureAppearance(theme, size);
  }, [fontSize, theme]);

  const handleToggleSidebar = useCallback(() => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    saveSidebarOpen(next);
  }, [sidebarOpen]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setSectionCollapsed(sectionId, !collapsedSections.has(sectionId));
  }, [collapsedSections, setSectionCollapsed]);

  const handleToggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    saveTheme(next);
    editorRef.current?.configureAppearance(next, fontSize);
  }, [fontSize, theme]);

  const handleCloseWelcome = useCallback(() => {
    saveWelcomeSeen();
    setShowWelcome(false);
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
              collapsedSections={collapsedSections}
              onSelectLesson={selectLesson}
              onToggleSection={handleToggleSection}
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
                  onApplySolution={handleApplyCode}
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
                initialCode={activeTab.code}
                editorRef={editorRef}
                onSelectTab={handleSelectTab}
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

      {showWelcome && (
        <WelcomeDialog
          totalLessons={LESSONS.length}
          totalSections={SECTIONS.length}
          onClose={handleCloseWelcome}
        />
      )}
    </div>
  );
}
