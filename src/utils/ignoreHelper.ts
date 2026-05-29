import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export type IgnoreRule =
  | { type: 'file'; filePath: string }
  | { type: 'line'; filePath: string; line: number };

function getIgnoreFilePath(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) return undefined;
  return path.join(folders[0].uri.fsPath, '.vscode', '.emoji-ignore');
}

export function loadIgnoreRules(): IgnoreRule[] {
  const ignorePath = getIgnoreFilePath();
  if (!ignorePath || !fs.existsSync(ignorePath)) return [];
  const rules: IgnoreRule[] = [];
  for (const raw of fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
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

export function isIgnored(rules: IgnoreRule[], relPath: string, lineNumber: number): boolean {
  const normalizedRel = relPath.replace(/\\/g, '/');
  for (const rule of rules) {
    const normalizedRule = rule.filePath.replace(/\\/g, '/');
    if (rule.type === 'file' && normalizedRel === normalizedRule) return true;
    if (rule.type === 'line' && normalizedRel === normalizedRule && rule.line === lineNumber) return true;
  }
  return false;
}

export async function addIgnoreEntry(entry: string): Promise<void> {
  const ignorePath = getIgnoreFilePath();
  if (!ignorePath) { vscode.window.showWarningMessage('No workspace folder open.'); return; }
  const dir = path.dirname(ignorePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existing = fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, 'utf8') : '';
  const lines = existing.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
  if (lines.includes(entry)) { vscode.window.showInformationMessage(`Already ignored: ${entry}`); return; }
  fs.writeFileSync(ignorePath, (existing.endsWith('\n') || existing === '' ? existing : existing + '\n') + entry + '\n', 'utf8');
  vscode.window.showInformationMessage(`Added to .emoji-ignore: ${entry}`);
}