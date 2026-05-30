import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import emojiRegex from 'emoji-regex';

export type IgnoreRule =
  | { type: 'file'; filePath: string }
  | { type: 'line'; filePath: string; line: number }
  | { type: 'emoji'; emoji: string };

function getIgnoreFilePath(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) return undefined;
  return path.join(folders[0].uri.fsPath, '.vscode', '.emoji-ignore');
}

export function loadIgnoreRules(): IgnoreRule[] {
  const ignorePath = getIgnoreFilePath();
  if (!ignorePath || !fs.existsSync(ignorePath)) return [];
  const rules: IgnoreRule[] = [];
  const emojiRe = emojiRegex();
  for (const raw of fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const emojiMatches = [...line.matchAll(emojiRe)];
    if (emojiMatches.length === 1 && emojiMatches[0][0] === line) {
      rules.push({ type: 'emoji', emoji: line });
      continue;
    }
    const colonIdx = line.lastIndexOf(':');
    if (colonIdx !== -1) {
      const maybeNum = parseInt(line.slice(colonIdx + 1), 10);
      if (!isNaN(maybeNum)) {
        rules.push({ type: 'line', filePath: line.slice(0, colonIdx), line: maybeNum });
        continue;
      }
    }
    rules.push({ type: 'file', filePath: line });
  }
  return rules;
}

export function isIgnored(rules: IgnoreRule[], relPath: string, lineNumber: number, emoji?: string): boolean {
  const normalizedRel = relPath.replace(/\\/g, '/');
  for (const rule of rules) {
    if (rule.type === 'emoji' && emoji && rule.emoji === emoji) return true;
    if (rule.type === 'file') {
      const normalizedRule = rule.filePath.replace(/\\/g, '/');
      if (normalizedRel === normalizedRule) return true;
    }
    if (rule.type === 'line') {
      const normalizedRule = rule.filePath.replace(/\\/g, '/');
      if (normalizedRel === normalizedRule && rule.line === lineNumber) return true;
    }
  }
  return false;
}

export async function addIgnoreEntry(entry?: string): Promise<void> {
  const ignorePath = getIgnoreFilePath();
  if (!ignorePath) { vscode.window.showWarningMessage('No workspace folder open.'); return; }

  let resolved = entry ?? '';

  if (!resolved) {
    const scope = await vscode.window.showQuickPick(
      [
        { label: 'Ignore an emoji from the entire workspace', value: 'emoji' },
        { label: 'Ignore an entire file', value: 'file' },
        { label: 'Ignore a specific line in a file', value: 'line' },
      ],
      { placeHolder: 'What do you want to ignore?' }
    );
    if (!scope) return;

    if (scope.value === 'emoji') {
      const input = await vscode.window.showInputBox({ placeHolder: 'Enter emoji to ignore (e.g. 🥺)', prompt: 'Emoji to ignore workspace-wide' });
      resolved = input ?? '';
    } else if (scope.value === 'file') {
      const input = await vscode.window.showInputBox({ placeHolder: 'e.g. src/components/Hero.tsx', prompt: 'Relative file path to ignore' });
      resolved = input ?? '';
    } else if (scope.value === 'line') {
      const fileInput = await vscode.window.showInputBox({ placeHolder: 'e.g. src/components/Hero.tsx', prompt: 'Relative file path' });
      if (!fileInput) return;
      const lineInput = await vscode.window.showInputBox({ placeHolder: 'e.g. 42', prompt: 'Line number to ignore' });
      if (!lineInput) return;
      resolved = `${fileInput}:${lineInput}`;
    }
  }

  resolved = resolved.trim();
  if (!resolved) { vscode.window.showWarningMessage('Nothing to add — entry was empty.'); return; }

  const dir = path.dirname(ignorePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existing = fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, 'utf8') : '';
  const lines = existing.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
  if (lines.includes(resolved)) { vscode.window.showInformationMessage(`Already ignored: ${resolved}`); return; }
  fs.writeFileSync(ignorePath, (existing.endsWith('\n') || existing === '' ? existing : existing + '\n') + resolved + '\n', 'utf8');
  vscode.window.showInformationMessage(`Added to .emoji-ignore: ${resolved}`);
}