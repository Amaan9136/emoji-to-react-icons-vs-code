# 🔥 Emoji to React Icons

> **Replace emoji in your JSX/TSX with production-ready `react-icons` components — instantly.**

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/AmaanMohammadKhalander.emoji-to-react-icons?label=VS%20Code%20Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=AmaanMohammadKhalander.emoji-to-react-icons)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/AmaanMohammadKhalander.emoji-to-react-icons)](https://marketplace.visualstudio.com/items?itemName=AmaanMohammadKhalander.emoji-to-react-icons)

---

## ✨ What It Does

**Emoji to React Icons** scans your `.js`, `.jsx`, `.ts`, and `.tsx` files for emoji and replaces them with the correct `react-icons` JSX — complete with auto-generated import statements.

No more manually hunting for the right icon name. Just write emoji, run the command, ship clean code.

---

## ⚡ Quick Demo

**Before:**
```tsx
export function Hero() {
  return <div>🚀 Launch faster with 🔥 tooling</div>;
}
```

**After:**
```tsx
import { FaFire, FaRocket } from 'react-icons/fa6';

export function Hero() {
  return <div><FaRocket /> Launch faster with <FaFire /> tooling</div>;
}
```

---

## 🛠️ Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for **"Emoji to React Icons"**:

| Command | Description |
|---|---|
| 🔍 **Scan Current File** | Lists all emoji and their icon mappings in the Output panel |
| ✅ **Replace Emoji in Current File** | Replaces all supported emoji with JSX and adds imports |
| 🎯 **Replace Emoji in Selection** | Same as above, scoped to your text selection |
| 📂 **Scan Entire Workspace** | Scans all JS/TS files and shows emoji locations across your project |
| 🔄 **Replace Emoji in Entire Workspace** | Bulk-replaces all emoji across your entire workspace |
| 📋 **Show Full Emoji to Icon Map** | Displays all 150+ supported emoji → icon mappings |
| 🚫 **Add to .emoji-ignore** | Interactively add an emoji, file, or specific line to `.emoji-ignore` |

---

## 🎯 Features

- 🗺️ **150+ emoji mappings** — covers UI, actions, status, and more
- 📦 **Auto-imports** — adds `react-icons` imports automatically, no duplicates
- 🔍 **Inline diagnostics** — hover over emoji to see the suggested icon with a direct link to the react-icons search page
- ⚙️ **Auto-scan on startup** — workspace is scanned when VS Code opens (controlled by `emojiToReactIcons.autoScan`)
- 💾 **Live diagnostics on save** — workspace is re-scanned and diagnostics refreshed every time a supported file is saved
- 🧩 **Works with any React setup** — Next.js, Vite, CRA, Remix, and more
- 🔒 **Safe bulk replace** — confirmation dialog before touching your whole workspace
- 🚫 **`.emoji-ignore` support** — ignore specific files, lines, or emoji workspace-wide via `.vscode/.emoji-ignore`
- ⚡ **Quick Fix code actions** — hover any emoji diagnostic to instantly add an ignore rule for that line or file without editing `.emoji-ignore` manually
- 🏎️ **Smarter workspace scanning** — automatically excludes framework build artifacts (`.next`, `.nuxt`, `.output`, `.turbo`, `dist`, `build`, `.cache`) for faster results

---

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| `emojiToReactIcons.autoScan` | `true` | Auto-scan workspace on startup and update on save |
| `emojiToReactIcons.hideUnsupportedInScan` | `false` | Hide unmapped emoji from scan results |

---

## 🚫 Ignoring Emoji, Files, and Lines

Place a `.emoji-ignore` file inside your `.vscode/` folder to suppress emoji detection in specific contexts.

**Supported ignore rule formats:**

| Rule format | What it ignores |
|---|---|
| `🔥` (bare emoji) | That emoji across the **entire workspace** — all files, scans, diagnostics, and replacements |
| `src/components/Hero.tsx` | Every emoji in that entire file |
| `src/components/Hero.tsx:42` | Emoji on that specific line only |

You can also run the **"Emoji to React Icons: Add to .emoji-ignore"** command from the Command Palette. When invoked without a pre-selected context it opens an interactive Quick Pick to choose between ignoring an emoji globally, an entire file, or a specific line — with guided input steps for each choice.

---

## 📦 Supported Icon Packs

- **`react-icons/fa6`** — Font Awesome 6 (the majority of mappings)
- **`react-icons/di`** — Devicons (e.g. GitHub)

> Requires `react-icons` to be installed in your project:
> ```bash
> npm install react-icons
> ```

---

## 💡 Tips

- Best suited for `.jsx` and `.tsx` files
- Unsupported emoji are reported in the Output panel but never modified
- Always review replacements — emoji meaning depends on context
- Use **Scan Current File** first to preview what will change
- Use **Show Full Emoji to Icon Map** to browse all 150+ mappings and their icon names at a glance

---

## 🧪 Local Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host.

> If `F5` does not work, ensure `.vscode/launch.json` exists in the repo — see [CONTRIBUTING.md](CONTRIBUTING.md) for the template.

---

## 🔗 Links

- [GitHub Repository](https://github.com/Amaan9136/emoji-to-react-icons-vs-code)
- [react-icons](https://react-icons.github.io/react-icons/)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AmaanMohammadKhalander.emoji-to-react-icons)
- [Contributing Guide](CONTRIBUTING.md)

---

## 📄 License

MIT © [Amaan Mohammed Khalander](https://github.com/Amaan9136)
