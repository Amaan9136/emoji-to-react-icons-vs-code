import * as vscode from 'vscode';
import emojiRegex from 'emoji-regex';

type IconMapping = {
  importFrom: string;
  importName: string;
  jsx: string;
  label: string;
};

const EMOJI_MAP: Record<string, IconMapping> = {
  '🔥': { importFrom: 'fa6', importName: 'FaFire', jsx: '<FaFire />', label: 'fire' },
  '⭐': { importFrom: 'fa6', importName: 'FaStar', jsx: '<FaStar />', label: 'star' },
  '🌟': { importFrom: 'fa6', importName: 'FaStar', jsx: '<FaStar />', label: 'star' },
  '✅': { importFrom: 'fa6', importName: 'FaCheck', jsx: '<FaCheck />', label: 'check' },
  '✔️': { importFrom: 'fa6', importName: 'FaCheck', jsx: '<FaCheck />', label: 'check' },
  '❌': { importFrom: 'fa6', importName: 'FaXmark', jsx: '<FaXmark />', label: 'close' },
  '🚀': { importFrom: 'fa6', importName: 'FaRocket', jsx: '<FaRocket />', label: 'rocket' },
  '💡': { importFrom: 'fa6', importName: 'FaLightbulb', jsx: '<FaLightbulb />', label: 'idea' },
  '⚠️': { importFrom: 'fa6', importName: 'FaTriangleExclamation', jsx: '<FaTriangleExclamation />', label: 'warning' },
  '🔍': { importFrom: 'fa6', importName: 'FaMagnifyingGlass', jsx: '<FaMagnifyingGlass />', label: 'search' },
  '❤️': { importFrom: 'fa6', importName: 'FaHeart', jsx: '<FaHeart />', label: 'heart' },
  '💖': { importFrom: 'fa6', importName: 'FaHeart', jsx: '<FaHeart />', label: 'heart' },
  '🎉': { importFrom: 'fa6', importName: 'FaPartyHorn', jsx: '<FaPartyHorn />', label: 'celebration' },
  '📦': { importFrom: 'fa6', importName: 'FaBox', jsx: '<FaBox />', label: 'package' },
  '📁': { importFrom: 'fa6', importName: 'FaFolder', jsx: '<FaFolder />', label: 'folder' },
  '📄': { importFrom: 'fa6', importName: 'FaFileLines', jsx: '<FaFileLines />', label: 'file' },
  '🛠️': { importFrom: 'fa6', importName: 'FaScrewdriverWrench', jsx: '<FaScrewdriverWrench />', label: 'tools' },
  '⚙️': { importFrom: 'fa6', importName: 'FaGear', jsx: '<FaGear />', label: 'settings' },
  '🧠': { importFrom: 'fa6', importName: 'FaBrain', jsx: '<FaBrain />', label: 'brain' },
  '📈': { importFrom: 'fa6', importName: 'FaChartLine', jsx: '<FaChartLine />', label: 'growth' },
  '📉': { importFrom: 'fa6', importName: 'FaChartLine', jsx: '<FaChartLine />', label: 'chart' },
  '🔒': { importFrom: 'fa6', importName: 'FaLock', jsx: '<FaLock />', label: 'lock' },
  '🔓': { importFrom: 'fa6', importName: 'FaLockOpen', jsx: '<FaLockOpen />', label: 'unlock' },
  '👤': { importFrom: 'fa6', importName: 'FaUser', jsx: '<FaUser />', label: 'user' },
  '👥': { importFrom: 'fa6', importName: 'FaUsers', jsx: '<FaUsers />', label: 'users' },
  '📧': { importFrom: 'fa6', importName: 'FaEnvelope', jsx: '<FaEnvelope />', label: 'email' },
  '📞': { importFrom: 'fa6', importName: 'FaPhone', jsx: '<FaPhone />', label: 'phone' },
  '🏠': { importFrom: 'fa6', importName: 'FaHouse', jsx: '<FaHouse />', label: 'home' },
  '🏆': { importFrom: 'fa6', importName: 'FaTrophy', jsx: '<FaTrophy />', label: 'trophy' },
  '⏰': { importFrom: 'fa6', importName: 'FaClock', jsx: '<FaClock />', label: 'clock' },
  '🗑️': { importFrom: 'fa6', importName: 'FaTrash', jsx: '<FaTrash />', label: 'trash' },
  '➕': { importFrom: 'fa6', importName: 'FaPlus', jsx: '<FaPlus />', label: 'plus' },
  '➖': { importFrom: 'fa6', importName: 'FaMinus', jsx: '<FaMinus />', label: 'minus' },
  '💬': { importFrom: 'fa6', importName: 'FaComment', jsx: '<FaComment />', label: 'comment' },
  '🔗': { importFrom: 'fa6', importName: 'FaLink', jsx: '<FaLink />', label: 'link' },
  '🌐': { importFrom: 'fa6', importName: 'FaGlobe', jsx: '<FaGlobe />', label: 'globe' },
};

function getMatches(text: string) {
  const regex = emojiRegex();
  const results: Array<{ emoji: string; index: number; mapping: IconMapping | null }> = [];
  for (const match of text.matchAll(regex)) {
    const emoji = match[0];
    const index = match.index ?? -1;
    results.push({ emoji, index, mapping: EMOJI_MAP[emoji] ?? null });
  }
  return results;
}

function buildImportLine(icons: IconMapping[]) {
  const unique = Array.from(new Map(icons.map((icon) => [icon.importName, icon])).values());
  const byPack = new Map<string, IconMapping[]>();
  for (const icon of unique) {
    const key = icon.importFrom;
    const existing = byPack.get(key) ?? [];
    existing.push(icon);
    byPack.set(key, existing);
  }
  return Array.from(byPack.entries())
    .map(([pack, packIcons]) =>
      `import { ${packIcons.map((icon) => icon.importName).sort().join(', ')} } from 'react-icons/${pack}';`
    )
    .join('\n');
}

function ensureImports(text: string, icons: IconMapping[]): string {
  if (icons.length === 0) return text;
  const importBlock = buildImportLine(icons);
  const lines = text.split(/\r?\n/);
  const existingImports = lines.filter((l) => l.startsWith('import ')).join('\n');
  const missingLines = importBlock.split('\n').filter((l) => l && !existingImports.includes(l));
  if (missingLines.length === 0) return text;
  const lastImportIndex = lines.reduce((acc, line, i) => (line.startsWith('import ') ? i : acc), -1);
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, ...missingLines);
    return lines.join('\n');
  }
  return missingLines.join('\n') + '\n\n' + text;
}

function replaceText(text: string) {
  const matches = getMatches(text);
  const supported = matches.filter((m) => m.mapping);
  const unsupported = matches.filter((m) => !m.mapping).map((m) => m.emoji);
  let updated = text;
  for (const match of [...supported].reverse()) {
    updated =
      updated.slice(0, match.index) +
      match.mapping!.jsx +
      updated.slice(match.index + match.emoji.length);
  }
  updated = ensureImports(updated, supported.map((m) => m.mapping!));
  return { updated, supportedCount: supported.length, unsupported: Array.from(new Set(unsupported)) };
}

async function replaceRange(editor: vscode.TextEditor, range: vscode.Range) {
  const original = editor.document.getText(range);
  const result = replaceText(original);
  if (result.supportedCount === 0 && result.unsupported.length === 0) {
    vscode.window.showInformationMessage('No emoji found.');
    return;
  }
  const ok = await editor.edit((eb) => eb.replace(range, result.updated));
  if (!ok) {
    const msg = `[EmojiToReactIcons] Failed to apply edit to ${editor.document.fileName}`;
    console.error(msg);
    vscode.window.showErrorMessage('Could not apply emoji replacement. Check the Output panel for details.');
    getOrCreateScanChannel().appendLine(msg);
    return;
  }
  const extra = result.unsupported.length
    ? ` Unsupported emoji skipped: ${result.unsupported.join(' ')}`
    : '';
  vscode.window.showInformationMessage(`Replaced ${result.supportedCount} emoji with react-icons JSX.${extra}`);
}

type WorkspaceMatch = {
  uri: vscode.Uri;
  relativePath: string;
  line: number;
  col: number;
  emoji: string;
  mapping: IconMapping | null;
};

async function scanWorkspaceFiles(hideUnsupported: boolean): Promise<WorkspaceMatch[]> {
  const files = await vscode.workspace.findFiles(
    '**/*.{js,jsx,ts,tsx,mjs,cjs}',
    '**/node_modules/**'
  );
  const results: WorkspaceMatch[] = [];
  for (const uri of files) {
    let doc: vscode.TextDocument;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch (err) {
      console.error(`[EmojiToReactIcons] Could not open document: ${uri.fsPath}`, err);
      continue;
    }
    const text = doc.getText();
    const matches = getMatches(text);
    const relativePath = vscode.workspace.asRelativePath(uri);
    for (const m of matches) {
      if (hideUnsupported && !m.mapping) continue;
      const pos = doc.positionAt(m.index);
      results.push({
        uri,
        relativePath,
        line: pos.line + 1,
        col: pos.character + 1,
        emoji: m.emoji,
        mapping: m.mapping,
      });
    }
  }
  return results;
}

let workspaceScanChannel: vscode.OutputChannel | undefined;

function getOrCreateScanChannel() {
  if (!workspaceScanChannel) workspaceScanChannel = vscode.window.createOutputChannel('Emoji to React Icons — Workspace');
  return workspaceScanChannel;
}

async function runWorkspaceScan(hideUnsupported: boolean) {
  const channel = getOrCreateScanChannel();
  channel.clear();
  channel.appendLine('Scanning workspace...');
  channel.show(true);
  let matches: WorkspaceMatch[];
  try {
    matches = await scanWorkspaceFiles(hideUnsupported);
  } catch (err) {
    const msg = `[EmojiToReactIcons] Workspace scan failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg, err);
    channel.appendLine(msg);
    vscode.window.showErrorMessage('Emoji scan failed. Check the Output panel for details.');
    return;
  }
  channel.clear();
  if (matches.length === 0) {
    channel.appendLine(hideUnsupported ? 'No supported emoji found in workspace.' : 'No emoji found in workspace.');
    return;
  }
  const byFile = new Map<string, WorkspaceMatch[]>();
  for (const m of matches) {
    const existing = byFile.get(m.relativePath) ?? [];
    existing.push(m);
    byFile.set(m.relativePath, existing);
  }
  let total = 0;
  for (const [file, items] of byFile.entries()) {
    channel.appendLine(`\n${file}`);
    for (const item of items) {
      const icon = item.mapping ? ` → ${item.mapping.importName}` : ' (unsupported)';
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
  const hideUnsupported = config.get<boolean>('hideUnsupportedInScan', false);
  runWorkspaceScan(hideUnsupported);
  const disposable = vscode.workspace.onDidSaveTextDocument(() => {
    const cfg = vscode.workspace.getConfiguration('emojiToReactIcons');
    if (!cfg.get<boolean>('autoScan', true)) return;
    runWorkspaceScan(cfg.get<boolean>('hideUnsupportedInScan', false));
  });
  context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
  startAutoScan(context);
  context.subscriptions.push(
    vscode.commands.registerCommand('emojiToReactIcons.scanCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const text = editor.document.getText();
      const matches = getMatches(text);
      if (matches.length === 0) { vscode.window.showInformationMessage('No emoji found in the current file.'); return; }
      const supported = matches.filter((m) => m.mapping);
      const unsupported = Array.from(new Set(matches.filter((m) => !m.mapping).map((m) => m.emoji)));
      const channel = vscode.window.createOutputChannel('Emoji to React Icons');
      channel.clear();
      channel.appendLine('=== Emoji scan results ===');
      supported.forEach((m) => channel.appendLine(`  ${m.emoji}  →  ${m.mapping?.importName}`));
      if (unsupported.length) channel.appendLine('Unsupported: ' + unsupported.join(' '));
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
      await replaceRange(editor, range);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const doc = editor.document;
      const range = editor.selection && !editor.selection.isEmpty
        ? new vscode.Range(editor.selection.start, editor.selection.end)
        : new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
      await replaceRange(editor, range);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.scanWorkspace', async () => {
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      const hideUnsupported = config.get<boolean>('hideUnsupportedInScan', false);
      await runWorkspaceScan(hideUnsupported);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceWorkspace', async () => {
      if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showWarningMessage('No workspace folder open.');
        return;
      }
      const confirm = await vscode.window.showWarningMessage(
        'Replace all emoji with react-icons JSX across the entire workspace?',
        { modal: true },
        'Replace All'
      );
      if (confirm !== 'Replace All') return;
      const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,mjs,cjs}', '**/node_modules/**');
      let totalFiles = 0;
      let totalReplaced = 0;
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
        const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(text.length));
        edit.replace(uri, fullRange, result.updated);
        const ok = await vscode.workspace.applyEdit(edit);
        if (!ok) {
          console.error(`[EmojiToReactIcons] Failed to apply workspace edit to: ${uri.fsPath}`);
          continue;
        }
        try {
          await doc.save();
        } catch (err) {
          console.error(`[EmojiToReactIcons] Failed to save file: ${uri.fsPath}`, err);
          continue;
        }
        totalFiles++;
        totalReplaced += result.supportedCount;
      }
      vscode.window.showInformationMessage(
        totalReplaced === 0
          ? 'No emoji found across workspace.'
          : `Replaced ${totalReplaced} emoji in ${totalFiles} file(s) with react-icons JSX.`
      );
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      await runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false));
    })
  );
}

export function deactivate() {
  workspaceScanChannel?.dispose();
  workspaceScanChannel = undefined;
}