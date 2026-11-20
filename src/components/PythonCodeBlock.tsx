import React, { useMemo, useState } from 'react';
import { Check, Copy, ArrowDownToLine } from 'lucide-react';

interface PythonCodeBlockProps {
  code: string;
  caption?: string;
  onApplyToEditor?: () => void;
  maxHeight?: string;
}

const KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

const BUILTINS = new Set([
  'print', 'len', 'range', 'int', 'float', 'str', 'bool', 'list', 'dict',
  'set', 'tuple', 'abs', 'min', 'max', 'sum', 'sorted', 'reversed',
  'enumerate', 'zip', 'type', 'isinstance', 'all', 'any', 'map', 'filter',
  'List', 'Dict', 'Set', 'Tuple', 'Deque', 'Counter', 'SortedDict', 'SortedSet',
  'deque', 'defaultdict', 'heapq',
]);

interface Token {
  type: 'comment' | 'string' | 'keyword' | 'builtin' | 'number' | 'func' | 'plain';
  text: string;
}

function tokenizePython(code: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /(#[^\n]*|f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let prevKeyword = '';

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', text: code.slice(lastIndex, match.index) });
    }
    const text = match[0];
    if (text.startsWith('#')) {
      tokens.push({ type: 'comment', text });
      prevKeyword = '';
    } else if (
      text.startsWith('"') ||
      text.startsWith("'") ||
      text.startsWith('f"') ||
      text.startsWith("f'")
    ) {
      tokens.push({ type: 'string', text });
      prevKeyword = '';
    } else if (/^\d/.test(text)) {
      tokens.push({ type: 'number', text });
      prevKeyword = '';
    } else if (KEYWORDS.has(text)) {
      tokens.push({ type: 'keyword', text });
      prevKeyword = text;
    } else if (prevKeyword === 'def' || prevKeyword === 'class') {
      tokens.push({ type: 'func', text });
      prevKeyword = '';
    } else if (BUILTINS.has(text)) {
      tokens.push({ type: 'builtin', text });
      prevKeyword = '';
    } else {
      tokens.push({ type: 'plain', text });
      prevKeyword = '';
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', text: code.slice(lastIndex) });
  }
  return tokens;
}

const TOKEN_COLORS: Record<Token['type'], string> = {
  comment: 'text-[#6a9955]',
  string: 'text-[#b45309] dark:text-[#ce9178]',
  keyword: 'text-[#7c3aed] dark:text-[#c586c0]',
  builtin: 'text-[#0284c7] dark:text-[#4ec9b0]',
  number: 'text-[#059669] dark:text-[#b5cea8]',
  func: 'text-[#b45309] dark:text-[#dcdcaa]',
  plain: 'text-[var(--text-primary)]',
};

export const PythonCodeBlock: React.FC<PythonCodeBlockProps> = ({
  code,
  caption,
  onApplyToEditor,
  maxHeight,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };

  const tokens = useMemo(() => tokenizePython(code.trimEnd()), [code]);

  return (
    <div
      className="my-3 overflow-hidden rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-code)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-1.5 text-xs"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <span className="font-medium">{caption ?? 'Python'}</span>
        <div className="flex items-center gap-1.5">
          {onApplyToEditor && (
            <button
              type="button"
              onClick={onApplyToEditor}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Load solution into editor"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Load in Editor
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <pre
        className="overflow-x-auto p-3.5 font-mono text-[13.5px] leading-[1.65]"
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        <code>
          {tokens.map((tok, i) => (
            <span key={i} className={TOKEN_COLORS[tok.type]}>
              {tok.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};
