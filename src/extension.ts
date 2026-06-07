import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const panels = new Map<string, vscode.WebviewPanel>();

  const disposable = vscode.commands.registerCommand('htmlPreview.open', async (uri?: vscode.Uri) => {
    const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode.window.showWarningMessage('No HTML file is active.');
      return;
    }

    const key = targetUri.toString();
    const existing = panels.get(key);
    if (existing) {
      existing.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const fileDir = path.dirname(targetUri.fsPath);
    const folderUri = vscode.workspace.getWorkspaceFolder(targetUri)?.uri;
    const localResourceRoots = [vscode.Uri.file(fileDir)];
    if (folderUri && folderUri.fsPath !== fileDir) {
      localResourceRoots.push(folderUri);
    }

    const panel = vscode.window.createWebviewPanel(
      'htmlPreview',
      `Preview: ${path.basename(targetUri.fsPath)}`,
      { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots
      }
    );

    panels.set(key, panel);

    const render = async () => {
      try {
        const bytes = await vscode.workspace.fs.readFile(targetUri);
        panel.webview.html = buildHtml(bytes.toString(), targetUri, panel.webview);
      } catch (err) {
        panel.webview.html = errorHtml(String(err));
      }
    };

    await render();

    const watcher = vscode.workspace.createFileSystemWatcher(targetUri.fsPath);
    watcher.onDidChange(render);

    const docChangeSub = vscode.workspace.onDidSaveTextDocument(doc => {
      if (doc.uri.toString() === key) {
        render();
      }
    });

    panel.onDidDispose(() => {
      panels.delete(key);
      watcher.dispose();
      docChangeSub.dispose();
    });
  });

  context.subscriptions.push(disposable);
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

export function deactivate() {}
