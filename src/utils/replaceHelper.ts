import * as vscode from 'vscode';
import emojiRegex from 'emoji-regex';
import { EMOJI_MAP, IconMapping } from './emojiMap';
import { ensureImports } from './importHelper';
import { loadIgnoreRules, isIgnored } from './ignoreHelper';

export function replaceText(text: string, relPath = '', lineOffset = 0): { updated: string; supportedCount: number; unsupported: string[] } {
  const regex = emojiRegex();
  const ignoreRules = loadIgnoreRules();
  const lines = text.split(/\r?\n/);
  const matches: Array<{ emoji: string; index: number; mapping: IconMapping | null }> = [];
  for (const match of text.matchAll(regex)) {
    const emoji = match[0];
    const index = match.index ?? -1;
    const lineIdx = text.slice(0, index).split(/\r?\n/).length - 1;
    const lineNumber = lineOffset + lineIdx + 1;
    if (isIgnored(ignoreRules, relPath, lineNumber, emoji)) continue;
    matches.push({ emoji, index, mapping: EMOJI_MAP[emoji] ?? null });
  }
  const supported = matches.filter((m) => m.mapping);
  const unsupported = Array.from(new Set(matches.filter((m) => !m.mapping).map((m) => m.emoji)));
  let updated = text;
  for (const match of [...supported].reverse()) {
    updated = updated.slice(0, match.index) + match.mapping!.jsx + updated.slice(match.index + match.emoji.length);
  }
  updated = ensureImports(updated, supported.map((m) => m.mapping!));
  return { updated, supportedCount: supported.length, unsupported };
}

export async function replaceRange(
  editor: vscode.TextEditor,
  range: vscode.Range,
  getChannel: () => vscode.OutputChannel
): Promise<boolean> {
  const original = editor.document.getText(range);
  const relPath = vscode.workspace.asRelativePath(editor.document.uri);
  const lineOffset = range.start.line;
  const result = replaceText(original, relPath, lineOffset);
  if (result.supportedCount === 0 && result.unsupported.length === 0) {
    vscode.window.showInformationMessage('No emoji found.');
    return false;
  }
  const ok = await editor.edit((eb) => eb.replace(range, result.updated));
  if (!ok) {
    const msg = `[EmojiToReactIcons] Failed to apply edit to ${editor.document.fileName}`;
    console.error(msg);
    vscode.window.showErrorMessage('Could not apply emoji replacement. Check the Output panel for details.');
    getChannel().appendLine(msg);
    return false;
  }
  const extra = result.unsupported.length ? ` Unsupported emoji skipped: ${result.unsupported.join(' ')}` : '';
  vscode.window.showInformationMessage(`Replaced ${result.supportedCount} emoji with react-icons JSX.${extra}`);
  return result.supportedCount > 0;
}