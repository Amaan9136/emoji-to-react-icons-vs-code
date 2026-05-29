import { IconMapping } from './emojiMap';

export function buildImportLine(icons: IconMapping[]): string {
  const unique = Array.from(new Map(icons.map((icon) => [icon.importName, icon])).values());
  const byPack = new Map<string, IconMapping[]>();
  for (const icon of unique) {
    const existing = byPack.get(icon.importFrom) ?? [];
    existing.push(icon);
    byPack.set(icon.importFrom, existing);
  }
  return Array.from(byPack.entries())
    .map(([pack, packIcons]) => `import { ${packIcons.map((icon) => icon.importName).sort().join(', ')} } from 'react-icons/${pack}';`)
    .join('\n');
}

export function ensureImports(text: string, icons: IconMapping[]): string {
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