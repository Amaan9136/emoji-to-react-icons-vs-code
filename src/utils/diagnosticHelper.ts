import * as vscode from 'vscode';
import { IconMapping } from './emojiMap';
import { WorkspaceMatch } from './scanHelper';

let workspaceScanChannel: vscode.OutputChannel | undefined;

export function getOrCreateScanChannel(): vscode.OutputChannel {
  if (!workspaceScanChannel) workspaceScanChannel = vscode.window.createOutputChannel('Emoji to React Icons — Workspace');
  return workspaceScanChannel;
}

export function buildDiagnostic(range: vscode.Range, emoji: string, mapping: IconMapping | null): vscode.Diagnostic {
  const message = mapping
    ? `Emoji ${emoji} → replace with <${mapping.importName} /> from react-icons/${mapping.importFrom}`
    : `Emoji ${emoji} has no react-icons mapping`;
  const severity = mapping ? vscode.DiagnosticSeverity.Information : vscode.DiagnosticSeverity.Hint;
  const diag = new vscode.Diagnostic(range, message, severity);
  diag.source = 'Emoji to React Icons';
  diag.code = mapping ? { value: mapping.importName, target: vscode.Uri.parse(`https://react-icons.github.io/react-icons/search?q=${mapping.importName}`) } : undefined;
  return diag;
}

export function updateDiagnostics(matches: WorkspaceMatch[], diagnosticCollection: vscode.DiagnosticCollection) {
  diagnosticCollection.clear();
  const byUri = new Map<string, { uri: vscode.Uri; diagnostics: vscode.Diagnostic[] }>();
  for (const m of matches) {
    const key = m.uri.toString();
    if (!byUri.has(key)) byUri.set(key, { uri: m.uri, diagnostics: [] });
    const range = new vscode.Range(
      new vscode.Position(m.line - 1, m.col - 1),
      new vscode.Position(m.line - 1, m.col - 1 + [...m.emoji].length)
    );
    byUri.get(key)!.diagnostics.push(buildDiagnostic(range, m.emoji, m.mapping));
  }
  for (const { uri, diagnostics } of byUri.values()) diagnosticCollection.set(uri, diagnostics);
}