# Changelog

All notable changes to **Emoji to React Icons** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

***

## [0.0.3] — 2026

### Added
- Extension marketplace assets and branding improvements for better discoverability and presentation.
- New extension icon for improved visual identity across the VS Code Marketplace and editor.
- Expanded README with clearer setup instructions, feature explanations, command usage examples, and configuration guidance.
- Additional usage notes and examples to help first-time users understand emoji replacement workflows faster.

### Changed
- Enhanced workspace scanning performance and reliability for large projects.
- Improved emoji replacement configuration handling for a more user-friendly setup experience.
- Refined extension descriptions, keywords, and metadata for improved marketplace SEO.
- Reworked documentation structure to make commands, settings, and workflows easier to navigate.
- General quality-of-life improvements and internal cleanup.

***

## [0.0.2] — 2026

### Added
- **Show Full Emoji to Icon Map** command — opens a browsable Output panel listing all 150+ supported emoji and their mapped `react-icons` components with pack source.
- Expanded emoji coverage with additional mappings across UI, status, and action categories.
- `emojiToReactIcons.hideUnsupportedInScan` setting — hide unmapped emoji from workspace scan results.
- Live diagnostics on save — the workspace is re-scanned and diagnostics are refreshed every time a supported file is saved.
- Auto-scan on startup — workspace is automatically scanned when VS Code activates the extension (controlled by `emojiToReactIcons.autoScan`).
- Confirmation dialog before bulk workspace replacement to prevent accidental changes.
- Inline diagnostic code actions link directly to the `react-icons` search page for the suggested icon.

### Changed
- Improved workspace scanning to exclude framework build artefacts: `.next/`, `.nuxt/`, `.output/`, `.turbo/`, `dist/`, `build/`, `__next/`, `_next/`, `.cache/`.
- `package-lock.json` updated for compatibility with `v0.0.2` dependencies.

***

## [0.0.1] — 2026

### Added
- Initial release of **Emoji to React Icons**.
- **Scan Current File** command — lists all emoji and their icon mappings in the Output panel.
- **Replace Emoji in Current File** command — replaces all supported emoji with JSX and inserts `react-icons` import statements automatically.
- **Replace Emoji in Selection** command — scoped replacement within the active text selection.
- **Scan Entire Workspace** command — scans all `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs` files and reports emoji locations.
- **Replace Emoji in Entire Workspace** command — bulk-replaces emoji across all workspace files.
- Core emoji map with mappings sourced from `react-icons/fa6` and `react-icons/di`.
- Smart import deduplication — existing imports are detected and only missing ones are inserted.
- `emojiToReactIcons.autoScan` configuration setting (default: `true`).