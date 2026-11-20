import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
} from 'lucide-react';
import type { Lesson, Section } from '../types/course';

interface CurriculumSidebarProps {
  sections: Section[];
  lessons: Lesson[];
  currentLesson: Lesson;
  solvedIds: Set<string>;
  onSelectLesson: (lessonId: string) => void;
  onResetProgress: () => void;
  width: number;
}

export const CurriculumSidebar = React.memo(function CurriculumSidebar({
  sections,
  lessons,
  currentLesson,
  solvedIds,
  onSelectLesson,
  onResetProgress,
  width,
}: CurriculumSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());
  const [confirmReset, setConfirmReset] = useState(false);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Ensure the active lesson's section is expanded and scroll it into view on lesson switch
  useEffect(() => {
    setCollapsedSections((prev) => {
      if (!prev.has(currentLesson.sectionId)) return prev;
      const next = new Set(prev);
      next.delete(currentLesson.sectionId);
      return next;
    });
  }, [currentLesson.sectionId]);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [currentLesson.id]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const lessonsBySection = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map<string, Lesson[]>();
    for (const sec of sections) {
      const matched = lessons.filter((l) => {
        if (l.sectionId !== sec.id) return false;
        if (!q) return true;
        return (
          l.title.toLowerCase().includes(q) ||
          String(l.index) === q ||
          sec.shortTitle.toLowerCase().includes(q)
        );
      });
      if (matched.length > 0) {
        map.set(sec.id, matched);
      }
    }
    return map;
  }, [sections, lessons, searchQuery]);

  const sectionStats = useMemo(() => {
    const stats = new Map<string, { total: number; solved: number }>();
    for (const l of lessons) {
      const s = stats.get(l.sectionId) ?? { total: 0, solved: 0 };
      s.total++;
      if (solvedIds.has(l.id)) s.solved++;
      stats.set(l.sectionId, s);
    }
    return stats;
  }, [lessons, solvedIds]);

  const solvedCount = solvedIds.size;
  const totalCount = lessons.length;
  const progressPct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-hidden rounded-lg border select-none"
      style={{
        width: `${width}px`,
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header + Progress */}
      <div
        className="shrink-0 border-b px-3.5 py-3"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Lessons
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              {solvedCount} of {totalCount} solved ({progressPct}%)
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Search Input */}
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter lessons..."
            className="w-full rounded-md border py-1.5 pr-2.5 pl-8 text-xs outline-none transition-colors focus:border-accent"
            style={{
              backgroundColor: 'var(--bg-code)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Scrollable Sections & Lessons */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {lessonsBySection.size === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
            No lessons matching &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec) => {
              const secLessons = lessonsBySection.get(sec.id);
              if (!secLessons) return null;

              const { total: secTotal, solved: secSolved } = sectionStats.get(sec.id)!;
              const isSectionComplete = secSolved === secTotal;
              const isCollapsed = !searchQuery.trim() && collapsedSections.has(sec.id);

              return (
                <div key={sec.id}>
                  {/* Section Header Banner */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border px-2 py-2 text-left transition-colors hover:border-[var(--border-strong)] cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10.5px] font-mono font-bold ${
                          isSectionComplete
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-accent/15 text-accent'
                        }`}
                      >
                        {sec.number}
                      </span>
                      <span className="truncate text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        {sec.shortTitle}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          isSectionComplete
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'text-[var(--text-muted)]'
                        }`}
                        style={
                          isSectionComplete
                            ? undefined
                            : { backgroundColor: 'var(--bg-code)' }
                        }
                      >
                        {secSolved}/{secTotal}
                      </span>
                      {isCollapsed ? (
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </button>

                  {/* Nested Section Lesson Rows */}
                  {!isCollapsed && (
                    <div
                      className="mt-1 ml-3 space-y-0.5 border-l pl-2"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {secLessons.map((lesson) => {
                        const isSolved = solvedIds.has(lesson.id);
                        const isCurrent = lesson.id === currentLesson.id;

                        return (
                          <button
                            key={lesson.id}
                            ref={isCurrent ? activeItemRef : undefined}
                            type="button"
                            onClick={() => onSelectLesson(lesson.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${
                              isCurrent
                                ? 'ring-1 ring-inset ring-accent/60 font-semibold text-[var(--text-primary)]'
                                : 'font-normal text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }`}
                            style={{
                              backgroundColor: isCurrent
                                ? isSolved
                                  ? 'rgba(34, 197, 94, 0.16)'
                                  : 'color-mix(in srgb, var(--accent) 14%, transparent)'
                                : isSolved
                                ? 'var(--accent-green-bg)'
                                : undefined,
                            }}
                          >
                            <span
                              className={`w-5 shrink-0 text-right font-mono text-[11px] ${
                                isSolved
                                  ? 'text-emerald-500'
                                  : isCurrent
                                  ? 'text-accent'
                                  : 'text-[var(--text-muted)]'
                              }`}
                            >
                              {lesson.index}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {lesson.title}
                            </span>
                            {isSolved && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Reset Progress */}
      <div
        className="flex shrink-0 items-center justify-between border-t px-3 py-2 text-xs"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        {confirmReset ? (
          <div className="flex w-full items-center justify-between gap-1.5">
            <span className="text-[11px] text-rose-400">Reset all?</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-rose-500 cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded px-1.5 py-0.5 text-[11px] hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[11.5px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-rose-400 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Progress</span>
          </button>
        )}
      </div>
    </aside>
  );
});
