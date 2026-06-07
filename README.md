# HTML Previewer 2.0

> A modern, dependency-free HTML preview for VS Code. One click, live reload, zero config.

Click the preview button on any `.html` file and a live, reload-on-save preview opens in a split pane next to your code. No dev server, no configuration, no background processes.

---

## Why "2.0"?

The popular `html-preview-vscode` extension that many developers still use was last touched in **December 2018**. It still works for basic previewing, but it carries 75+ open issues and targets a VS Code engine seven years out of date.

**HTML Previewer 2.0 is a clean-room rewrite** with the goal of doing the core job exceptionally well:

- **Zero runtime dependencies.** No `cheerio`, no `lodash`, no supply-chain surprises — just the VS Code API.
- **Auto-reload on disk changes** — not just on save. Build tools, static-site generators, and templating watchers trigger updates correctly.
- **Modern webview APIs.** Uses `asWebviewUri`, scoped `localResourceRoots`, and current preview-focus patterns. The original predates the 2019 webview overhaul.
- **~120 lines of source.** Auditable, debuggable, no webpack required.
- **Current engine target** — VS Code 1.75+ (the original requires 1.26, from 2018).

This isn't a fork. It's a rewrite that does roughly the 80% you actually use, in a fraction of the surface area.

---

## Features

- **One-click preview** from the editor title bar
- **Right-click in the file explorer** → Preview HTML
- **Live reload on save** and on external file changes (via filesystem watcher)
- **Pinned to file by default** — each preview tracks the HTML it was opened from, even when you switch editors. No "lock" toggle to remember.
- **Manual refresh** from the preview title bar or the command palette
- **Side-by-side, focus-preserving** — preview opens next to your editor without stealing the keyboard
- **Full asset resolution** for relative CSS, JS, images, and fonts via an injected `<base href>`
- **Zero configuration** — install, open an HTML file, click

---

## Usage

Three ways to open a preview:
1. Open an HTML file → click the **preview icon** in the editor title bar
2. Right-click an HTML file in the explorer → **Preview HTML**
3. Press `Cmd+Shift+V` (macOS) / `Ctrl+Shift+V` (Windows/Linux)

Edit and save — the preview updates immediately. To force a refresh (e.g. for externally generated files cached aggressively), click the refresh icon in the preview's title bar, or run `HTML Previewer: Refresh Preview` from the command palette.

### Each preview is pinned to its file

When you open a preview from `index.html`, that panel stays pinned to `index.html` even when you switch to editing `styles.css` or another HTML file. To preview a different file, open a second preview from that file — you'll get a second pinned panel.

This is the opposite of how some preview extensions work, where a single preview pane follows the active editor. Pinning by default avoids the most common preview-extension footgun: you click into a different file to copy something, and your preview vanishes.

---

## Keyboard shortcuts

| Action          | macOS         | Windows / Linux  |
| --------------- | ------------- | ---------------- |
| Preview HTML    | `Cmd+Shift+V` | `Ctrl+Shift+V`   |

The shortcut is scoped to HTML files only and won't interfere with the built-in Markdown preview.

---

## How it works

The extension creates a [VS Code Webview](https://code.visualstudio.com/api/extension-guides/webview) pointed at your HTML file's directory. A `<base href="...">` tag is injected into the document `<head>` so that relative paths to stylesheets, scripts, and images resolve correctly inside the sandboxed view. A file-system watcher and a save listener keep the preview in sync.

Local resource access is scoped to the file's directory and (if applicable) its workspace folder — nothing outside that tree is loaded.

---

## Limitations

- **Webview sandbox** — Some browser APIs are restricted inside VS Code's webview (top-level navigation, certain storage APIs). For static HTML, CSS, and vanilla JS this is invisible; for full SPA debugging, use a real browser.
- **No server-side rendering** — Static preview only. PHP, server-side includes, and templating engines won't execute.
- **External URLs** — Remote `<script>` and `<link>` references load normally, subject to webview Content Security Policy.

---

## Release notes

### 2.0.0
- Initial release of HTML Previewer 2.0 — a clean-room rewrite of the original `html-preview-vscode`
- Editor title-bar button, explorer context-menu entry, command palette
- Live reload on save AND filesystem change
- Manual refresh command and title-bar button
- Pin-by-default preview semantics
- Zero runtime dependencies
- Modern VS Code APIs with scoped sandboxing

---

## License

MIT
