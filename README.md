# Emoji to React Icons

A VS Code extension that scans code for emoji and replaces them with relevant `react-icons` JSX.

## Commands

| Command | What it does |
|---|---|
| **Emoji to React Icons: Scan Current File** | Lists all detected emoji and their mappings in the Output panel |
| **Emoji to React Icons: Replace Emoji in Current File** | Replaces all supported emoji in the file with JSX and adds imports |
| **Emoji to React Icons: Replace Emoji in Selection** | Same as above but scoped to the selection |

## Example

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

## Notes

- Best suited for `.jsx` and `.tsx` files.
- Unsupported emoji are reported but not modified.
- Always review replacements — emoji meaning depends on context.

## Local Development

```bash
npm install
npm run compile
# Press F5 in VS Code to launch the Extension Development Host
```
