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

---

## 🎯 Features

- 🗺️ **150+ emoji mappings** — covers UI, actions, status, and more
- 📦 **Auto-imports** — adds `react-icons` imports automatically, no duplicates
- 🔍 **Inline diagnostics** — hover over emoji to see the suggested icon
- ⚙️ **Auto-scan on startup** — workspace is scanned when VS Code opens
- 💾 **Live diagnostics on save** — diagnostics update every time you save
- 🧩 **Works with any React setup** — Next.js, Vite, CRA, Remix, and more
- 🔒 **Safe bulk replace** — confirmation dialog before touching your whole workspace

---

## ⚙️ Settings

| Setting | Default | Description |
|---|---|---|
| `emojiToReactIcons.autoScan` | `true` | Auto-scan workspace on startup and update on save |
| `emojiToReactIcons.hideUnsupportedInScan` | `false` | Hide unmapped emoji from scan results |

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

---

## 🧪 Local Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch the Extension Development Host.

---

## 🔗 Links

- [GitHub Repository](https://github.com/Amaan9136/emoji-to-react-icons-vs-code)
- [react-icons](https://react-icons.github.io/react-icons/)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=AmaanMohammadKhalander.emoji-to-react-icons)

---

## 📄 License

MIT © [Amaan Mohammed Khalander](https://github.com/Amaan9136)