# Contributing to Emoji to React Icons

Thank you for taking the time to contribute! This document covers everything you need to get the project running locally, add new emoji mappings, and submit a pull request.

***

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Adding Emoji Mappings](#adding-emoji-mappings)
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
│   └── extension.ts      # All extension logic — emoji map, commands, diagnostics
├── dist/                 # Compiled output (generated, not committed)
├── package.json          # Extension manifest — commands, settings, activation events
├── tsconfig.json         # TypeScript configuration
├── .vscodeignore         # Files excluded from the published .vsix bundle
└── CHANGELOG.md          # Version history
```

***

## Adding Emoji Mappings

All mappings live in the `EMOJI_MAP` constant at the top of `src/extension.ts`. Each entry follows this shape:

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
3. Add the entry to `EMOJI_MAP` in alphabetical order by emoji Unicode codepoint (not by label).
4. Run `npm run compile` and verify there are no TypeScript errors.
5. Press `F5` in VS Code to open the Extension Development Host and manually test the emoji in a `.tsx` file.

**Supported icon packs** (currently used):

| Pack ID | Library | Import path |
|---------|---------|-------------|
| `fa6` | Font Awesome 6 | `react-icons/fa6` |
| `di` | Devicons | `react-icons/di` |

Adding a new pack? Just use its correct `react-icons` sub-path as `importFrom` — `buildImportLine()` in `extension.ts` handles multi-pack imports automatically.

***

## Running the Extension Locally

1. Open the repo folder in VS Code.
2. Press **`F5`** — this launches a new **Extension Development Host** window with your local build loaded.
3. Open any `.tsx` or `.jsx` file in that host window.
4. Open the Command Palette (`Ctrl+Shift+P`) and run any **Emoji to React Icons** command.

> If `F5` does not work, ensure `.vscode/launch.json` exists (see the project README for the template).

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
```

***

## Pull Request Guidelines

- **One concern per PR** — separate emoji additions from refactors from bug fixes.
- **Update `CHANGELOG.md`** under an `[Unreleased]` section describing what you changed.
- **No breaking changes to the `EMOJI_MAP` shape** without a discussion in an issue first; downstream users may depend on label values for custom tooling.
- **TypeScript strict mode is on** — `tsc --noEmit` must pass before submitting.
- Commit messages should follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` — new emoji mappings or commands
  - `fix:` — bug fixes
  - `chore:` — dependency updates, build changes
  - `docs:` — documentation only

***

## Reporting Issues

Open an issue on [GitHub](https://github.com/Amaan9136/emoji-to-react-icons-vs-code) and include:

- The emoji(s) involved
- The file type (`.jsx`, `.tsx`, etc.)
- What happened vs. what you expected
- VS Code version and OS

For unmapped emoji, a PR with a new `EMOJI_MAP` entry is the fastest path to a fix.