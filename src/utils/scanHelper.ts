import * as vscode from 'vscode';
import emojiRegex from 'emoji-regex';
import { EMOJI_MAP, IconMapping } from './emojiMap';

export type WorkspaceMatch = {
  uri: vscode.Uri;
  relativePath: string;
  line: number;
  col: number;
  emoji: string;
  mapping: IconMapping | null;
};

export async function scanWorkspaceFiles(hideUnsupported: boolean, frameworkExclude: string): Promise<WorkspaceMatch[]> {
  const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,mjs,cjs}', frameworkExclude);
  const results: WorkspaceMatch[] = [];
  const regex = emojiRegex();
  for (const uri of files) {
    let doc: vscode.TextDocument;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch (err) {
      console.error(`[EmojiToReactIcons] Could not open document: ${uri.fsPath}`, err);
      continue;
    }
    const text = doc.getText();
    const relativePath = vscode.workspace.asRelativePath(uri);
    for (const match of text.matchAll(regex)) {
      const emoji = match[0];
      const mapping: IconMapping | null = EMOJI_MAP[emoji] ?? null;
      if (hideUnsupported && !mapping) continue;
      const pos = doc.positionAt(match.index ?? -1);
      results.push({ uri, relativePath, line: pos.line + 1, col: pos.character + 1, emoji, mapping });
    }
  }
  return results;
}