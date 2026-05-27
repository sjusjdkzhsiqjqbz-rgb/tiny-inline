import * as vscode from 'vscode';
import { TinyInlineCompletionProvider } from './completionProvider';
import {
  testProviderCommand,
  testFimCommand,
  switchProviderCommand,
  toggleCommand,
} from './commands';

let completionProvider: TinyInlineCompletionProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusBar.text = '$(sparkle) Tiny Inline';
  statusBar.tooltip = 'Tiny Inline — click to toggle';
  statusBar.command = 'tiny-inline.toggle';
  statusBar.show();
  context.subscriptions.push(statusBar);

  const updateStatusBar = () => {
    const enabled = vscode.workspace.getConfiguration('tiny-inline').get<boolean>('enabled', true);
    const provider = vscode.workspace.getConfiguration('tiny-inline').get<string>('activeProvider', 'deepseek');
    statusBar.text = enabled
      ? `$(sparkle) Tiny Inline: ${provider}`
      : '$(circle-slash) Tiny Inline: off';
  };
  updateStatusBar();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('tiny-inline')) {
        updateStatusBar();
        completionProvider?.clearCache();
      }
    }),
  );

  completionProvider = new TinyInlineCompletionProvider(statusBar);

  const selector: vscode.DocumentSelector = { pattern: '**' };
  const providerDisposable = vscode.languages.registerInlineCompletionItemProvider(
    selector,
    completionProvider,
  );

  context.subscriptions.push(providerDisposable);
  context.subscriptions.push(completionProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('tiny-inline.toggle', toggleCommand),
    vscode.commands.registerCommand('tiny-inline.switchProvider', switchProviderCommand),
    vscode.commands.registerCommand('tiny-inline.testFim', testFimCommand),
    vscode.commands.registerCommand('tiny-inline.testProvider', testProviderCommand),
  );
}

export function deactivate() {
  if (completionProvider) {
    completionProvider.dispose();
    completionProvider = undefined;
  }
}
