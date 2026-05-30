# Contributing to Emoji to React Icons

Thank you for taking the time to contribute! This document covers everything you need to get the project running locally, add new emoji mappings, and submit a pull request.

***

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Adding Emoji Mappings](#adding-emoji-mappings)
- [Working with the Ignore System](#working-with-the-ignore-system)
- [Running the Extension Locally](#running-the-extension-locally)
- [Building and Packaging](#building-and-packaging)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)

***

## Getting Started

**Prerequisites:**

- [Node.js](https://nodejs.org/) v18 or later
- [VS Code](https://code.visualstudio.com/) (latest stable)
- [`vsce`](https://github.com/microsoft/vscode-vsce) for packaging: `npm install -g @vscode/vsce`

**Install dependencies:**

```bash
npm install
```

**Compile TypeScript:**

```bash
npm run compile
```

***

## Project Structure

```
emoji-to-react-icons-vs-code/
├── src/
│   ├── extension.ts          # Entry point — registers commands, diagnostics, code actions, and auto-scan
│   └── utils/
│       ├── emojiMap.ts          # EMOJI_MAP constant and IconMapping type
│       ├── ignoreHelper.ts      # .emoji-ignore file parsing, rule matching, and addIgnoreEntry()
│       ├── importHelper.ts      # buildImportLine() and ensureImports() for auto-import logic
│       ├── diagnosticHelper.ts  # buildDiagnostic(), updateDiagnostics(), and Output Channel helpers
│       ├── replaceHelper.ts     # replaceText() and replaceRange() for in-editor emoji replacement
│       └── scanHelper.ts        # scanWorkspaceFiles() for full workspace emoji scanning
├── dist/                     # Compiled output (generated, not committed)
├── package.json              # Extension manifest — commands, settings, activation events
├── tsconfig.json             # TypeScript configuration
├── .vscodeignore             # Files excluded from the published .vsix bundle
└── CHANGELOG.md              # Version history
```

***

## Adding Emoji Mappings

All mappings live in the `EMOJI_MAP` constant in `src/utils/emojiMap.ts`. The `IconMapping` type is also defined there. Each entry follows this shape:

```ts
'<emoji>': {
  importFrom: 'fa6',          // react-icons pack: 'fa6' | 'di' | other supported packs
  importName: 'FaIconName',   // exact named export from the pack
  jsx: '<FaIconName />',      // JSX string used in replacement
  label: 'descriptive-slug',  // lowercase, hyphenated; used in scan output
},
```

**Steps to add a new mapping:**

1. Find the best matching icon on [react-icons.github.io](https://react-icons.github.io/react-icons/).
2. Note the pack (`fa6`, `di`, `md`, etc.) and the exact export name.
3. Add the entry to `EMOJI_MAP` in `src/utils/emojiMap.ts` in alphabetical order by emoji Unicode codepoint (not by label).
4. Run `npm run compile` and verify there are no TypeScript errors.
5. Press `F5` in VS Code to open the Extension Development Host and manually test the emoji in a `.tsx` file.

**Supported icon packs** (currently used):

| Pack ID | Library | Import path |
|---------|---------|-------------|
| `fa6` | Font Awesome 6 | `react-icons/fa6` |
| `di` | Devicons | `react-icons/di` |

Adding a new pack? Just use its correct `react-icons` sub-path as `importFrom` — `buildImportLine()` in `src/utils/importHelper.ts` handles multi-pack imports automatically.

***

## Working with the Ignore System

The ignore system is implemented in `src/utils/ignoreHelper.ts`. It reads `.vscode/.emoji-ignore` from the workspace root and supports three rule formats:

| Rule format | What it ignores |
|---|---|
| `🥺` (bare emoji) | That emoji across the entire workspace — all scans, diagnostics, and replacements |
| `src/components/Hero.tsx` | Every emoji in that entire file |
| `src/components/Hero.tsx:42` | Emoji on that specific line only |

Lines beginning with `#` are treated as comments and are ignored.

**Key functions in `ignoreHelper.ts`:**

- `loadIgnoreRules()` — reads and parses `.vscode/.emoji-ignore` into a typed `IgnoreRule[]` array.
- `isIgnored(rules, relPath, lineNumber, emoji?)` — returns `true` if the given location or emoji matches any rule.
- `addIgnoreEntry(entry?)` — writes a new rule to `.emoji-ignore`. When `entry` is omitted (e.g. invoked from the Command Palette), it opens an interactive Quick Pick so the user can choose whether to ignore an emoji workspace-wide, an entire file, or a specific line. The `.vscode/` directory is created automatically if it doesn't exist.

If you modify the ignore rule parsing logic, make sure `loadIgnoreRules()` and `isIgnored()` stay consistent with the three rule formats above and that both `scanHelper.ts` and `replaceHelper.ts` — which each call `loadIgnoreRules()` independently — continue to reflect the correct behaviour.

***

## Running the Extension Locally

1. Open the repo folder in VS Code.
2. Press **`F5`** — this launches a new **Extension Development Host** window with your local build loaded.
3. Open any `.tsx` or `.jsx` file in that host window.
4. Open the Command Palette (`Ctrl+Shift+P`) and run any **Emoji to React Icons** command.

> If `F5` does not work, ensure `.vscode/launch.json` exists. A minimal working template:
> ```json
> {
>   "version": "0.2.0",
>   "configurations": [
>     {
>       "name": "Run Extension",
>       "type": "extensionHost",
>       "request": "launch",
>       "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
>     }
>   ]
> }
> ```

***

## Building and Packaging

```bash
# Compile TypeScript to dist/
npm run compile

# Bundle with esbuild (production build)
npm run bundle

# Package as a .vsix file
vsce package

# Install the .vsix locally to test the production build
code --install-extension emoji-to-react-icons-*.vsix

# Publish to the VS Code Marketplace (maintainers only)
npx vsce publish
```

***

## Pull Request Guidelines

- **One concern per PR** — separate emoji additions from refactors from bug fixes.
- **Update `CHANGELOG.md`** under an `[Unreleased]` section describing what you changed.
- **No breaking changes to the `EMOJI_MAP` shape** without a discussion in an issue first; downstream users may depend on `label` values for custom tooling.
- **No breaking changes to `IgnoreRule` types or `.emoji-ignore` format** without updating `ignoreHelper.ts`, `scanHelper.ts`, and `replaceHelper.ts` together.
- **TypeScript strict mode is on** — `tsc --noEmit` must pass before submitting.
- Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` — new emoji mappings or commands
  - `fix:` — bug fixes
  - `chore:` — dependency updates, build changes
  - `docs:` — documentation only
  - `refactor:` — internal restructuring without behaviour change

***

## Reporting Issues

Open an issue on [GitHub](https://github.com/Amaan9136/emoji-to-react-icons-vs-code) and include:

- The emoji(s) involved
- The file type (`.jsx`, `.tsx`, etc.)
- What happened vs. what you expected
- VS Code version and OS

For unmapped emoji, a PR with a new `EMOJI_MAP` entry in `src/utils/emojiMap.ts` is the fastest path to a fix.
