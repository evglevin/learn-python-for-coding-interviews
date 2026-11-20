import React, { useEffect, useRef, useState } from 'react';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  tooltips,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  python,
} from '@codemirror/lang-python';
import {
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  HighlightStyle,
  indentUnit,
} from '@codemirror/language';
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { tags as t } from '@lezer/highlight';
import { pythonCompletionSource, pythonSignatureHelp } from '../lib/pythonCompletions';
import {
  RotateCcw,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Minus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { RuntimeStatus, SolutionTab } from '../types/course';

interface CodeEditorProps {
  tabs: SolutionTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onChangeCode: (code: string) => void;
  onResetCode: () => void;
  onRun: () => void;
  onSubmit: () => void;
  theme: 'dark' | 'light';
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  runtimeStatus: RuntimeStatus;
  runtimeError?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const darkHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#c586c0' },
  { tag: [t.name, t.deleted, t.character, t.macroName], color: '#9cdcfe' },
  { tag: [t.propertyName], color: '#9cdcfe' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#dcdcaa' },
  { tag: [t.labelName], color: '#dcdcaa' },
  { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#4fc1ff' },
  { tag: [t.definition(t.name), t.separator], color: '#d4d4d4' },
  { tag: [t.typeName, t.className, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#4ec9b0' },
  { tag: [t.number, t.bool], color: '#b5cea8' },
  { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link], color: '#d4d4d4' },
  { tag: [t.meta, t.comment], color: '#6a9955', fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: [t.atom, t.special(t.variableName)], color: '#569cd6' },
  { tag: [t.processingInstruction, t.string, t.inserted], color: '#ce9178' },
  { tag: t.invalid, color: '#f44747' },
]);

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#7c3aed' },
  { tag: [t.name, t.propertyName], color: '#1e293b' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#b45309' },
  { tag: [t.typeName, t.className, t.self, t.namespace], color: '#0284c7' },
  { tag: [t.number, t.bool], color: '#059669' },
  { tag: [t.comment], color: '#15803d', fontStyle: 'italic' },
  { tag: [t.string, t.inserted], color: '#c2410c' },
  { tag: [t.atom, t.special(t.variableName)], color: '#2563eb' },
  { tag: t.invalid, color: '#dc2626' },
]);

function makeEditorTheme(theme: 'dark' | 'light', fontSize: number) {
  const isDark = theme === 'dark';
  return EditorView.theme(
    {
      '&': {
        backgroundColor: isDark ? '#1e1e22' : '#ffffff',
        color: isDark ? '#e4e4e7' : '#18181b',
        fontSize: `${fontSize}px`,
      },
      '.cm-content': {
        caretColor: isDark ? '#e4e4e7' : '#18181b',
        padding: '10px 0 24px 0',
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: isDark ? '#e4e4e7' : '#18181b',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.30)' : 'rgba(99, 102, 241, 0.18)',
      },
      '.cm-gutters': {
        backgroundColor: isDark ? '#1e1e22' : '#fafafa',
        color: isDark ? '#63636e' : '#9ca3af',
        borderRight: isDark ? '1px solid #2a2a30' : '1px solid #e5e7eb',
        paddingRight: '4px',
      },
      '.cm-activeLineGutter': {
        backgroundColor: isDark ? '#26262c' : '#f1f5f9',
        color: isDark ? '#c4c4cc' : '#334155',
      },
      '.cm-activeLine': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(99, 102, 241, 0.04)',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: isDark ? '#2e2e36' : '#e5e7eb',
        border: 'none',
        color: isDark ? '#a1a1aa' : '#52525b',
        padding: '0 4px',
        borderRadius: '3px',
      },
      '.cm-matchingBracket': {
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)',
        outline: isDark ? '1px solid rgba(129, 140, 248, 0.6)' : '1px solid rgba(99, 102, 241, 0.5)',
      },
      '.cm-tooltip': {
        backgroundColor: isDark ? '#25252b' : '#ffffff',
        border: isDark ? '1px solid #3c3c46' : '1px solid #d4d7de',
        borderRadius: '8px',
        boxShadow: isDark
          ? '0 10px 28px rgba(0, 0, 0, 0.5)'
          : '0 8px 24px rgba(15, 23, 42, 0.14)',
        overflow: 'hidden',
        zIndex: '100',
      },
      '.cm-tooltip.cm-tooltip-autocomplete > ul': {
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
        fontSize: '12.5px',
        maxHeight: '240px',
        minWidth: '240px',
        padding: '4px',
      },
      '.cm-tooltip-autocomplete ul li': {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '5px',
        color: isDark ? '#e4e4e7' : '#18181b',
      },
      '.cm-tooltip-autocomplete ul li[aria-selected]': {
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.30)' : 'rgba(99, 102, 241, 0.14)',
        color: isDark ? '#ffffff' : '#1e1b4b',
      },
      '.cm-completionDetail': {
        marginLeft: 'auto',
        paddingLeft: '14px',
        fontStyle: 'normal',
        fontSize: '11.5px',
        opacity: '0.65',
      },
      '.cm-completionMatchedText': {
        textDecoration: 'none',
        fontWeight: '700',
        color: isDark ? '#a5b4fc' : '#4f46e5',
      },
      '.cm-tooltip.cm-completionInfo': {
        padding: '8px 10px',
        fontSize: '12px',
        lineHeight: '1.45',
        color: isDark ? '#c4c4cc' : '#374151',
        maxWidth: '300px',
      },
      '.cm-signature-tooltip': {
        padding: '6px 10px',
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
        fontSize: '12px',
        lineHeight: '1.45',
        maxWidth: '460px',
      },
      '.cm-signature-line': {
        whiteSpace: 'pre-wrap',
      },
      '.cm-signature-name': {
        fontWeight: '700',
        color: isDark ? '#dcdcaa' : '#b45309',
      },
      '.cm-signature-params': {
        color: isDark ? '#e4e4e7' : '#18181b',
      },
      '.cm-signature-doc': {
        marginTop: '3px',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '11.5px',
        color: isDark ? '#a1a1aa' : '#6b7280',
      },
    },
    { dark: isDark }
  );
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onChangeCode,
  onResetCode,
  onRun,
  onSubmit,
  theme,
  fontSize,
  onChangeFontSize,
  runtimeStatus,
  runtimeError,
  isExpanded,
  onToggleExpand,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const highlightCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChangeCode);
  const onRunRef = useRef(onRun);
  const onSubmitRef = useRef(onSubmit);
  const isExternalUpdateRef = useRef(false);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  onChangeRef.current = onChangeCode;
  onRunRef.current = onRun;
  onSubmitRef.current = onSubmit;

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  // Mount CodeMirror once
  useEffect(() => {
    if (!containerRef.current) return;

    const runShortcut = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          onRunRef.current();
          return true;
        },
      },
      {
        key: 'Mod-Shift-Enter',
        run: () => {
          onSubmitRef.current();
          return true;
        },
      },
    ]);

    const state = EditorState.create({
      doc: activeTab.code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        indentUnit.of('    '),
        bracketMatching(),
        closeBrackets(),
        tooltips({ position: 'fixed' }),
        pythonSignatureHelp,
        autocompletion({
          activateOnTyping: true,
          override: [pythonCompletionSource],
          maxRenderedOptions: 30,
          icons: true,
        }),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        python(),
        runShortcut,
        Prec.high(
          keymap.of([
            { key: 'Tab', run: acceptCompletion },
            ...completionKeymap,
          ])
        ),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
        ]),
        themeCompartment.current.of(makeEditorTheme(theme, fontSize)),
        highlightCompartment.current.of(
          syntaxHighlighting(theme === 'dark' ? darkHighlightStyle : lightHighlightStyle)
        ),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isExternalUpdateRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet || update.docChanged) {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            setCursorPos({
              line: line.number,
              col: head - line.from + 1,
            });
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external code changes (switching lesson, switching tab, resetting, loading solution)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== activeTab.code) {
      isExternalUpdateRef.current = true;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: activeTab.code },
      });
      isExternalUpdateRef.current = false;
    }
  }, [activeTab.code, activeTab.id]);

  // Reconfigure theme & font size dynamically
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        themeCompartment.current.reconfigure(makeEditorTheme(theme, fontSize)),
        highlightCompartment.current.reconfigure(
          syntaxHighlighting(theme === 'dark' ? darkHighlightStyle : lightHighlightStyle)
        ),
      ],
    });
  }, [theme, fontSize]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top Editor Toolbar */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-3 py-1.5"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
            <span>Python 3</span>
          </div>

          <span className="h-3.5 w-px bg-[var(--border-subtle)]" />

          {/* Runtime status indicator */}
          <div
            className="flex items-center gap-1.5 text-xs"
            title={runtimeError || 'In-browser Python WebAssembly (Pyodide)'}
          >
            {runtimeStatus === 'loading' && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span className="text-[var(--text-muted)]">Loading Python...</span>
              </>
            )}
            {runtimeStatus === 'ready' && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[var(--text-muted)]">Pyodide Ready</span>
              </>
            )}
            {runtimeStatus === 'running' && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span className="text-indigo-400">Running...</span>
              </>
            )}
            {runtimeStatus === 'error' && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-rose-400">Runtime Error</span>
              </>
            )}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1">
          <div
            className="mr-1 flex items-center rounded border px-1 py-0.5 text-xs"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.max(12, fontSize - 1))}
              className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Decrease font size"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[26px] text-center font-mono text-[11px] text-[var(--text-secondary)]">
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => onChangeFontSize(Math.min(22, fontSize + 1))}
              className="rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Increase font size"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={onResetCode}
            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Reset code to starter template"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleExpand}
            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title={isExpanded ? 'Restore split view' : 'Maximize editor pane'}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Solution Tabs Bar */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-2 py-1"
        style={{
          borderColor: 'var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)',
        }}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span>{tab.name}</span>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="rounded p-0.5 opacity-60 hover:bg-[var(--bg-hover)] hover:opacity-100 cursor-pointer"
                    title="Close tab"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
          {tabs.length < 5 && (
            <button
              type="button"
              onClick={onAddTab}
              className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Add new scratchpad tab"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="shrink-0 pr-2 font-mono text-[11px] text-[var(--text-muted)]">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </div>
      </div>

      {/* CodeMirror Mount */}
      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" />
    </div>
  );
};
