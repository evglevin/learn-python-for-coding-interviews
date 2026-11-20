import { python, pythonLanguage } from '@codemirror/lang-python';
import { HighlightStyle, LanguageSupport } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { StyleModule } from 'style-mod';

export const pythonLanguageSupport = new LanguageSupport(
  pythonLanguage.configure({ props: [styleTags({ in: t.keyword })] }),
  python().support
);

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

export const pythonHighlighting = {
  dark: { style: darkHighlightStyle, foreground: '#e4e4e7' },
  light: { style: lightHighlightStyle, foreground: '#18181b' },
};

export function mountPythonHighlighting(root: Document): void {
  // The read-only code blocks also render when the editor is hidden.
  const modules = [darkHighlightStyle.module, lightHighlightStyle.module].filter(
    (module) => module !== null
  );
  StyleModule.mount(root, modules);
}
