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
    vscode.window.showErrorMessage('Could not apply emoji replacement.');
    return;
  }
  const extra = result.unsupported.length
    ? ` Unsupported emoji skipped: ${result.unsupported.join(' ')}`
    : '';
  vscode.window.showInformationMessage(`Replaced ${result.supportedCount} emoji with react-icons JSX.${extra}`);
}

export function activate(context: vscode.ExtensionContext) {
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
    })
  );
}

export function deactivate() {}