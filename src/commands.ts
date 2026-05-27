import * as vscode from 'vscode';
import { resolveProvider } from './providers/registry';
import { getAvailableProviderNames } from './config';
import { testDeepseekFim } from './providers/deepseek';
import { testOpenAICompatible, testOpenAICompatibleFim } from './providers/openai-compatible';
import { testAnthropic, testAnthropicFim } from './providers/anthropic';

export async function testProviderCommand(): Promise<void> {
  const config = vscode.workspace.getConfiguration('tiny-inline');
  const activeProvider = config.get<string>('activeProvider', 'deepseek');

  const resolved = resolveProvider(activeProvider);
  if (!resolved) {
    vscode.window.showErrorMessage(`Tiny Inline: Provider "${activeProvider}" not found.`);
    return;
  }

  vscode.window.showInformationMessage(`Testing ${activeProvider}...`);

  let ok = false;
  const providerName = resolved.config.name;
  const providerType = resolved.config.type;

  try {
    if (providerName === 'deepseek') {
      ok = await testDeepseekFim(resolved.config);
    } else if (providerName === 'anthropic' && providerType === 'preset') {
      ok = await testAnthropic(resolved.config);
    } else {
      ok = await testOpenAICompatible(resolved.config);
    }
  } catch {
    ok = false;
  }

  if (ok) {
    vscode.window.showInformationMessage(`Tiny Inline: ${activeProvider} is reachable.`);
  } else {
    const action = await vscode.window.showErrorMessage(
      `Tiny Inline: ${activeProvider} not reachable. Check API key and network.`,
      'Open Settings',
    );
    if (action === 'Open Settings') {
      vscode.commands.executeCommand('workbench.action.openSettings', 'tiny-inline');
    }
  }
}

export async function testFimCommand(): Promise<void> {
  const config = vscode.workspace.getConfiguration('tiny-inline');
  const activeProvider = config.get<string>('activeProvider', 'deepseek');

  const resolved = resolveProvider(activeProvider);
  if (!resolved) {
    vscode.window.showErrorMessage(`Tiny Inline: Provider "${activeProvider}" not found.`);
    return;
  }

  let supportsFim = false;

  try {
    if (resolved.config.name === 'deepseek' && resolved.config.type === 'preset') {
      supportsFim = await testDeepseekFim(resolved.config);
    } else if (resolved.config.name === 'anthropic' && resolved.config.type === 'preset') {
      supportsFim = testAnthropicFim(resolved.config);
    } else {
      supportsFim = await testOpenAICompatibleFim(resolved.config);
    }
  } catch {
    supportsFim = false;
  }

  if (supportsFim) {
    vscode.window.showInformationMessage(
      `Tiny Inline: ${activeProvider} supports native FIM.`,
    );
  } else {
    vscode.window.showInformationMessage(
      `Tiny Inline: ${activeProvider} does NOT support native FIM. Using prompt-based fallback.`,
    );
  }
}

export async function switchProviderCommand(): Promise<void> {
  const names = getAvailableProviderNames();
  const current = vscode.workspace.getConfiguration('tiny-inline').get<string>('activeProvider', 'deepseek');

  const items: vscode.QuickPickItem[] = names.map(name => ({
    label: name,
    description: name === current ? '(active)' : undefined,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select provider for inline completions',
  });

  if (selected) {
    await vscode.workspace.getConfiguration('tiny-inline').update(
      'activeProvider',
      selected.label,
      vscode.ConfigurationTarget.Global,
    );
    vscode.window.showInformationMessage(`Tiny Inline: switched to ${selected.label}`);
  }
}

export async function toggleCommand(): Promise<void> {
  const config = vscode.workspace.getConfiguration('tiny-inline');
  const current = config.get<boolean>('enabled', true);
  await config.update('enabled', !current, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(
    `Tiny Inline: completions ${!current ? 'enabled' : 'disabled'}`,
  );
}
