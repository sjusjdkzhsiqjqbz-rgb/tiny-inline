import * as vscode from 'vscode';
import { PRESETS, type CustomProvider, type TinyInlineConfig } from './providers/presets';
import type { ProviderConfig } from './providers/types';

export function getTinyInlineConfig(): TinyInlineConfig {
  const c = vscode.workspace.getConfiguration('tiny-inline');
  return {
    enabled: c.get<boolean>('enabled', true),
    activeProvider: c.get<string>('activeProvider', 'deepseek'),
    debounceMs: c.get<number>('debounceMs', 150),
    maxTokens: c.get<number>('maxTokens', 256),
    contextWindow: c.get<number>('contextWindow', 2048),
  };
}

export function resolveProviderConfig(name: string): ProviderConfig | null {
  const preset = PRESETS[name];
  const c = vscode.workspace.getConfiguration();

  if (preset) {
    const apiKey = preset.configKeys.apiKey
      ? c.get<string>(preset.configKeys.apiKey, '')
      : '';
    const model = c.get<string>(preset.configKeys.model, preset.defaults.model);
    const baseUrl = c.get<string>(preset.configKeys.baseUrl, preset.defaults.baseUrl);

    return {
      name,
      baseUrl: baseUrl.replace(/\/$/, ''),
      apiKey,
      model,
      fimNative: preset.fimNative,
      authType: 'bearer',
      type: 'preset',
    };
  }

  const customs: CustomProvider[] = c.get<CustomProvider[]>('tiny-inline.customProviders', []);
  const custom = customs.find(p => p.name === name);
  if (custom) {
    return {
      name: custom.name,
      baseUrl: custom.baseUrl.replace(/\/$/, ''),
      apiKey: custom.apiKey ?? '',
      model: custom.model,
      fimNative: custom.fimNative ?? false,
      authType: custom.authType ?? 'bearer',
      type: 'custom',
    };
  }

  return null;
}

export function getAvailableProviderNames(): string[] {
  const names = Object.keys(PRESETS);
  const c = vscode.workspace.getConfiguration();
  const customs: CustomProvider[] = c.get<CustomProvider[]>('tiny-inline.customProviders', []);
  names.push(...customs.map(p => p.name));
  return names;
}
