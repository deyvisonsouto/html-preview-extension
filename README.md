# HTML Preview

> Render any HTML file side-by-side with your code. One click, zero setup.

Stop alt-tabbing to a browser just to check what your markup looks like. **HTML Preview** adds a single button to the editor title bar of every `.html` file — click it and a live, reload-on-save preview opens in a split view next to your code.

---

## Features

- **One-click preview** — A button appears in the editor title bar for any HTML file. No commands to memorize.
- **Live reload on save** — Edit, save, watch it update. No dev server, no extension config.
- **External-change aware** — Reloads automatically when the file changes on disk (great for generated HTML).
- **Full asset resolution** — Relative paths to local CSS, JS, images, and fonts render correctly via an injected `<base>` tag.
- **Side-by-side, focus-preserving** — Preview opens in a column next to your editor without stealing keyboard focus.
- **Keyboard shortcut** — `Cmd+Shift+V` on macOS, `Ctrl+Shift+V` elsewhere (scoped to HTML files only).
- **Zero configuration** — Install, open an HTML file, click. That's it.

---

## Usage

1. Open any `.html` file
2. Click the **preview icon** in the top-right of the editor tab bar
3. Edit your HTML and hit save — the preview updates instantly

You can also invoke it via:
- **Keyboard:** `Cmd+Shift+V` (macOS) / `Ctrl+Shift+V` (Windows/Linux)
- **Command Palette:** `HTML Preview: Preview HTML`

---

## Why this exists

VS Code's built-in tooling does a lot, but previewing a plain HTML file still means either a third-party live-server extension that wants to spin up a Node process, or copy-pasting the path into a browser. This extension does one thing — render the file in a webview — and does it without configuration, ports, or background processes.

---

## How it works

The extension creates a [VS Code Webview](https://code.visualstudio.com/api/extension-guides/webview) pointed at your HTML file's directory. A `<base href="...">` tag is injected into the document head so that relative paths to stylesheets, scripts, and images resolve correctly inside the sandboxed view. A file-system watcher and a save listener keep the preview in sync.

Local resource access is scoped to the file's directory and (if applicable) its workspace folder — nothing outside that tree is loaded.

---

## Limitations

- **Webview sandbox** — Some browser APIs are restricted inside VS Code's webview (e.g. top-level navigation, certain storage APIs). For most static HTML, CSS, and vanilla JS this is invisible; for full SPA debugging, use a real browser.
- **No server-side rendering** — This is a static preview. PHP, server-side includes, and templating engines won't execute.
- **External URLs** — Remote `<script>` and `<link>` references load normally, subject to webview Content Security Policy.

---

## Keyboard shortcuts

| Action          | macOS         | Windows / Linux  |
| --------------- | ------------- | ---------------- |
| Preview HTML    | `Cmd+Shift+V` | `Ctrl+Shift+V`   |

The shortcut is scoped to HTML files only and will not interfere with the built-in Markdown preview.

---

## Release notes

### 0.0.1
- Initial release: editor title-bar button, live reload on save, watcher-driven external reload, base-href asset resolution.

---

## License

MIT
