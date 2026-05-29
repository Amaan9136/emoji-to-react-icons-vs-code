import * as vscode from 'vscode';
import emojiRegex from 'emoji-regex';
import { EMOJI_MAP, IconMapping } from './utils/emojiMap';
import { loadIgnoreRules, isIgnored, addIgnoreEntry } from './utils/ignoreHelper';
import { buildImportLine, ensureImports } from './utils/importHelper';
import { getOrCreateScanChannel, updateDiagnostics, buildDiagnostic } from './utils/diagnosticHelper';
import { replaceText, replaceRange } from './utils/replaceHelper';
import { scanWorkspaceFiles, WorkspaceMatch } from './utils/scanHelper';

const FRAMEWORK_EXCLUDE = '{**/node_modules/**,.next/**,.nuxt/**,.output/**,.turbo/**,**/dist/**,**/.cache/**,**/build/**,**/__next/**,**/_next/**}';

export const diagnosticCollection = vscode.languages.createDiagnosticCollection('emojiToReactIcons');

let hasScannedOnce = false;

async function runWorkspaceScan(hideUnsupported: boolean, silent = false) {
  const channel = getOrCreateScanChannel();
  if (!silent) {
    channel.clear();
    channel.appendLine('Scanning workspace...');
    channel.show(true);
  }
  let matches: WorkspaceMatch[];
  try {
    matches = await scanWorkspaceFiles(hideUnsupported, FRAMEWORK_EXCLUDE);
  } catch (err) {
    const msg = `[EmojiToReactIcons] Workspace scan failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg, err);
    channel.appendLine(msg);
    vscode.window.showErrorMessage('Emoji scan failed. Check the Output panel for details.');
    return;
  }
  const ignoreRules = loadIgnoreRules();
  const filtered = matches.filter((m) => !isIgnored(ignoreRules, m.relativePath, m.line));
  updateDiagnostics(filtered, diagnosticCollection);
  channel.clear();
  if (filtered.length === 0) {
    channel.appendLine(hideUnsupported ? 'No supported emoji found in workspace.' : 'No emoji found in workspace.');
    return;
  }
  const byFile = new Map<string, WorkspaceMatch[]>();
  for (const m of filtered) {
    const existing = byFile.get(m.relativePath) ?? [];
    existing.push(m);
    byFile.set(m.relativePath, existing);
  }
  let total = 0;
  for (const [, items] of byFile.entries()) {
    channel.appendLine(`\n${items[0].uri.fsPath}`);
    for (const item of items) {
      const icon = item.mapping ? ` → ${item.mapping.importName} (react-icons/${item.mapping.importFrom})` : ' (unsupported)';
      const emojiPart = hideUnsupported ? '' : ` ${item.emoji}`;
      channel.appendLine(`  Line ${item.line}, Col ${item.col}:${emojiPart}${icon}`);
      total++;
    }
  }
  channel.appendLine(`\n─────────────────────────`);
  channel.appendLine(`Total: ${total} emoji across ${byFile.size} file(s)`);
}

function startAutoScan(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('emojiToReactIcons');
  if (!config.get<boolean>('autoScan', true)) return;
  if (!hasScannedOnce) {
    hasScannedOnce = true;
    runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false));
  }
  const disposable = vscode.workspace.onDidSaveTextDocument((doc) => {
    const cfg = vscode.workspace.getConfiguration('emojiToReactIcons');
    if (!cfg.get<boolean>('autoScan', true)) return;
    const regex = emojiRegex();
    const text = doc.getText();
    const hideUnsupported = cfg.get<boolean>('hideUnsupportedInScan', false);
    const ignoreRules = loadIgnoreRules();
    const relativePath = vscode.workspace.asRelativePath(doc.uri);
    const diagnostics: vscode.Diagnostic[] = [];
    for (const match of text.matchAll(regex)) {
      const emoji = match[0];
      const index = match.index ?? -1;
      const mapping: IconMapping | null = EMOJI_MAP[emoji] ?? null;
      if (hideUnsupported && !mapping) continue;
      const pos = doc.positionAt(index);
      const lineNumber = pos.line + 1;
      if (isIgnored(ignoreRules, relativePath, lineNumber)) continue;
      const range = new vscode.Range(pos, new vscode.Position(pos.line, pos.character + [...emoji].length));
      diagnostics.push(buildDiagnostic(range, emoji, mapping));
    }
    diagnosticCollection.set(doc.uri, diagnostics);
  });
  context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);
  startAutoScan(context);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [{ scheme: 'file', language: 'javascriptreact' }, { scheme: 'file', language: 'typescriptreact' }, { scheme: 'file', language: 'javascript' }, { scheme: 'file', language: 'typescript' }],
      {
        provideCodeActions(document, range, ctx) {
          const actions: vscode.CodeAction[] = [];
          for (const diag of ctx.diagnostics) {
            if (diag.source !== 'Emoji to React Icons') continue;
            const relativePath = vscode.workspace.asRelativePath(document.uri);
            const lineNumber = diag.range.start.line + 1;
            const ignoreLineAction = new vscode.CodeAction(
              `Ignore this line in .emoji-ignore`,
              vscode.CodeActionKind.QuickFix
            );
            ignoreLineAction.command = {
              command: 'emojiToReactIcons.addIgnoreEntry',
              title: 'Ignore line',
              arguments: [`${relativePath}:${lineNumber}`],
            };
            ignoreLineAction.diagnostics = [diag];
            actions.push(ignoreLineAction);
            const ignoreFileAction = new vscode.CodeAction(
              `Ignore entire file in .emoji-ignore`,
              vscode.CodeActionKind.QuickFix
            );
            ignoreFileAction.command = {
              command: 'emojiToReactIcons.addIgnoreEntry',
              title: 'Ignore file',
              arguments: [relativePath],
            };
            ignoreFileAction.diagnostics = [diag];
            actions.push(ignoreFileAction);
          }
          return actions;
        },
      },
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    ),
    vscode.commands.registerCommand('emojiToReactIcons.addIgnoreEntry', async (entry: string) => {
      await addIgnoreEntry(entry);
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      await runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false), true);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.scanCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const doc = editor.document;
      const text = doc.getText();
      const regex = emojiRegex();
      const matches: Array<{ emoji: string; index: number; mapping: IconMapping | null }> = [];
      for (const match of text.matchAll(regex)) {
        matches.push({ emoji: match[0], index: match.index ?? -1, mapping: EMOJI_MAP[match[0]] ?? null });
      }
      if (matches.length === 0) { vscode.window.showInformationMessage('No emoji found in the current file.'); return; }
      const supported = matches.filter((m) => m.mapping);
      const unsupported = Array.from(new Set(matches.filter((m) => !m.mapping).map((m) => m.emoji)));
      const channel = vscode.window.createOutputChannel('Emoji to React Icons — Current File');
      channel.clear();
      channel.appendLine(`=== Emoji scan: ${doc.uri.fsPath} ===\n`);
      const byLine = new Map<number, typeof matches>();
      for (const m of matches) {
        const pos = doc.positionAt(m.index);
        const line = pos.line + 1;
        const existing = byLine.get(line) ?? [];
        existing.push(m);
        byLine.set(line, existing);
      }
      for (const [line, items] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
        for (const item of items) {
          const pos = doc.positionAt(item.index);
          const col = pos.character + 1;
          const icon = item.mapping ? `${item.mapping.importName} from react-icons/${item.mapping.importFrom}` : '(unsupported)';
          channel.appendLine(`  Line ${line}, Col ${col}: ${item.emoji}  →  ${icon}`);
        }
      }
      channel.appendLine(`\n─────────────────────────`);
      channel.appendLine(`Replaceable: ${supported.length}  |  Unsupported: ${unsupported.length}`);
      if (unsupported.length) channel.appendLine(`Unsupported: ${unsupported.join(' ')}`);
      channel.show(true);
      vscode.window.showInformationMessage(
        `Found ${matches.length} emoji. Replaceable: ${supported.length}.${unsupported.length ? ' Unsupported: ' + unsupported.join(' ') : ''}`
      );
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a JSX/TSX file first.'); return; }
      const doc = editor.document;
      const range = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
      const changed = await replaceRange(editor, range, getOrCreateScanChannel);
      if (changed) {
        getOrCreateScanChannel().appendLine(`\n✔ Replaced emoji in: ${doc.uri.fsPath}`);
        diagnosticCollection.set(doc.uri, []);
      }
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const doc = editor.document;
      const range = editor.selection && !editor.selection.isEmpty
        ? new vscode.Range(editor.selection.start, editor.selection.end)
        : new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
      const changed = await replaceRange(editor, range, getOrCreateScanChannel);
      if (changed) getOrCreateScanChannel().appendLine(`\n✔ Replaced emoji in selection: ${doc.uri.fsPath}`);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.scanWorkspace', async () => {
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      await runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false));
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceWorkspace', async () => {
      if (!vscode.workspace.workspaceFolders?.length) { vscode.window.showWarningMessage('No workspace folder open.'); return; }
      const confirm = await vscode.window.showWarningMessage(
        'Replace all emoji with react-icons JSX across the entire workspace?',
        { modal: true },
        'Replace All'
      );
      if (confirm !== 'Replace All') return;
      const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,mjs,cjs}', FRAMEWORK_EXCLUDE);
      let totalFiles = 0;
      let totalReplaced = 0;
      const changedFiles: string[] = [];
      for (const uri of files) {
        let doc: vscode.TextDocument;
        try {
          doc = await vscode.workspace.openTextDocument(uri);
        } catch (err) {
          console.error(`[EmojiToReactIcons] Could not open file for replacement: ${uri.fsPath}`, err);
          continue;
        }
        const text = doc.getText();
        const result = replaceText(text);
        if (result.supportedCount === 0) continue;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, new vscode.Range(doc.positionAt(0), doc.positionAt(text.length)), result.updated);
        const ok = await vscode.workspace.applyEdit(edit);
        if (!ok) { console.error(`[EmojiToReactIcons] Failed to apply workspace edit to: ${uri.fsPath}`); continue; }
        try { await doc.save(); } catch (err) { console.error(`[EmojiToReactIcons] Failed to save file: ${uri.fsPath}`, err); continue; }
        diagnosticCollection.set(uri, []);
        totalFiles++;
        totalReplaced += result.supportedCount;
        changedFiles.push(uri.fsPath);
      }
      const channel = getOrCreateScanChannel();
      channel.clear();
      if (totalReplaced === 0) {
        channel.appendLine('No emoji found across workspace.');
        vscode.window.showInformationMessage('No emoji found across workspace.');
      } else {
        channel.appendLine(`=== Workspace Replacement Results ===\n`);
        channel.appendLine(`Replaced ${totalReplaced} emoji in ${totalFiles} file(s):\n`);
        for (const filePath of changedFiles) channel.appendLine(`  ✔ ${filePath}`);
        channel.appendLine(`\n─────────────────────────`);
        channel.appendLine(`Total: ${totalReplaced} replacements across ${totalFiles} file(s)`);
        channel.show(true);
        vscode.window.showInformationMessage(`Replaced ${totalReplaced} emoji in ${totalFiles} file(s). See Output panel for details.`);
      }
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      await runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false), true);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.showEmojiMap', async () => {
      const channel = vscode.window.createOutputChannel('Emoji to React Icons — Full Map');
      channel.clear();
      channel.appendLine('=== Emoji → React Icons Mapping ===\n');
      const entries = Object.entries(EMOJI_MAP).sort((a, b) => a[1].importFrom.localeCompare(b[1].importFrom) || a[1].importName.localeCompare(b[1].importName));
      const byPack = new Map<string, typeof entries>();
      for (const entry of entries) {
        const pack = entry[1].importFrom;
        const existing = byPack.get(pack) ?? [];
        existing.push(entry);
        byPack.set(pack, existing);
      }
      for (const [pack, packEntries] of byPack.entries()) {
        channel.appendLine(`react-icons/${pack}:`);
        for (const [emoji, mapping] of packEntries) channel.appendLine(`  ${emoji}  →  <${mapping.importName} />  (${mapping.label})`);
        channel.appendLine('');
      }
      channel.appendLine(`─────────────────────────`);
      channel.appendLine(`Total mappings: ${Object.keys(EMOJI_MAP).length}`);
      channel.show(true);
    })
  );
}

export function deactivate() {
  getOrCreateScanChannel().dispose();
  diagnosticCollection.dispose();
}