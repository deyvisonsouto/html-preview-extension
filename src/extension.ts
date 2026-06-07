import * as vscode from 'vscode';
import * as path from 'path';

const VIEW_TYPE = 'htmlPreviewer';

interface PreviewSession {
  panel: vscode.WebviewPanel;
  uri: vscode.Uri;
  watcher: vscode.FileSystemWatcher;
  saveSub: vscode.Disposable;
}

const sessions = new Map<string, PreviewSession>();

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('htmlPreviewer.open', (uri?: vscode.Uri) => openPreview(uri)),
    vscode.commands.registerCommand('htmlPreviewer.refresh', () => refreshActive())
  );
}

async function openPreview(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    vscode.window.showWarningMessage('No HTML file is active.');
    return;
  }

  const key = targetUri.toString();
  const existing = sessions.get(key);
  if (existing) {
    existing.panel.reveal(vscode.ViewColumn.Beside, true);
    await render(existing);
    return;
  }

  const fileDir = path.dirname(targetUri.fsPath);
  const folderUri = vscode.workspace.getWorkspaceFolder(targetUri)?.uri;
  const localResourceRoots = [vscode.Uri.file(fileDir)];
  if (folderUri && folderUri.fsPath !== fileDir) {
    localResourceRoots.push(folderUri);
  }

  const panel = vscode.window.createWebviewPanel(
    VIEW_TYPE,
    `Preview: ${path.basename(targetUri.fsPath)}`,
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots
    }
  );

  const watcher = vscode.workspace.createFileSystemWatcher(targetUri.fsPath);
  const session: PreviewSession = {
    panel,
    uri: targetUri,
    watcher,
    saveSub: { dispose: () => undefined }
  };

  session.saveSub = vscode.workspace.onDidSaveTextDocument(doc => {
    if (doc.uri.toString() === key) {
      render(session);
    }
  });

  watcher.onDidChange(() => render(session));

  panel.onDidDispose(() => {
    sessions.delete(key);
    watcher.dispose();
    session.saveSub.dispose();
  });

  sessions.set(key, session);
  await render(session);
}

function refreshActive(): void {
  for (const session of sessions.values()) {
    if (session.panel.active) {
      render(session);
      return;
    }
  }
  // Fallback: if no preview is focused, refresh the one matching the active text editor.
  const activeUri = vscode.window.activeTextEditor?.document.uri.toString();
  if (activeUri) {
    const match = sessions.get(activeUri);
    if (match) {
      render(match);
      return;
    }
  }
  // Last resort: refresh every open preview.
  for (const session of sessions.values()) {
    render(session);
  }
}

async function render(session: PreviewSession): Promise<void> {
  try {
    const bytes = await vscode.workspace.fs.readFile(session.uri);
    session.panel.webview.html = buildHtml(bytes.toString(), session.uri, session.panel.webview);
  } catch (err) {
    session.panel.webview.html = errorHtml(String(err));
  }
}

function buildHtml(source: string, fileUri: vscode.Uri, webview: vscode.Webview): string {
  const baseDir = path.dirname(fileUri.fsPath);
  const baseHref = webview.asWebviewUri(vscode.Uri.file(baseDir + path.sep)).toString();

  if (/<base\s/i.test(source)) {
    return source;
  }

  if (/<head[^>]*>/i.test(source)) {
    return source.replace(/<head([^>]*)>/i, `<head$1>\n<base href="${baseHref}">`);
  }

  if (/<html[^>]*>/i.test(source)) {
    return source.replace(/<html([^>]*)>/i, `<html$1>\n<head><base href="${baseHref}"></head>`);
  }

  return `<!DOCTYPE html><html><head><base href="${baseHref}"></head><body>${source}</body></html>`;
}

function errorHtml(message: string): string {
  return `<!DOCTYPE html><html><body style="font-family: sans-serif; padding: 1rem;">
    <h2>Unable to preview</h2>
    <pre>${escapeHtml(message)}</pre>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]!));
}

export function deactivate(): void {
  for (const session of sessions.values()) {
    session.watcher.dispose();
    session.saveSub.dispose();
    session.panel.dispose();
  }
  sessions.clear();
}
