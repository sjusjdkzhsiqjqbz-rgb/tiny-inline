import type { ProviderConfig } from './types';

export interface Preset {
  id: string;
  fimNative: boolean;
  configKeys: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
  defaults: {
    model: string;
    baseUrl: string;
  };
}

export const PRESETS: Record<string, Preset> = {
  'deepseek': {
    id: 'deepseek',
    fimNative: true,
    configKeys: {
      apiKey: 'tiny-inline.providers.deepseek.apiKey',
      model: 'tiny-inline.providers.deepseek.model',
      baseUrl: 'tiny-inline.providers.deepseek.baseUrl',
    },
    defaults: {
      model: 'deepseek-coder',
      baseUrl: 'https://api.deepseek.com',
    },
  },
  'opencode-zen': {
    id: 'opencode-zen',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.opencodeZen.apiKey',
      model: 'tiny-inline.providers.opencodeZen.model',
      baseUrl: 'tiny-inline.providers.opencodeZen.baseUrl',
    },
    defaults: {
      model: 'deepseek-v4-pro',
      baseUrl: 'https://opencode.ai/zen/go/v1',
    },
  },
  'anthropic': {
    id: 'anthropic',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.anthropic.apiKey',
      model: 'tiny-inline.providers.anthropic.model',
      baseUrl: 'tiny-inline.providers.anthropic.baseUrl',
    },
    defaults: {
      model: 'claude-sonnet-4-20250514',
      baseUrl: 'https://api.anthropic.com',
    },
  },
  'openai': {
    id: 'openai',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.openai.apiKey',
      model: 'tiny-inline.providers.openai.model',
      baseUrl: 'tiny-inline.providers.openai.baseUrl',
    },
    defaults: {
      model: 'gpt-4o',
      baseUrl: 'https://api.openai.com',
    },
  },
  'ollama': {
    id: 'ollama',
    fimNative: false,
    configKeys: {
      apiKey: '',
      model: 'tiny-inline.providers.ollama.model',
      baseUrl: 'tiny-inline.providers.ollama.baseUrl',
    },
    defaults: {
      model: 'qwen2.5-coder:7b',
      baseUrl: 'http://localhost:11434',
    },
  },
};

export interface CustomProvider {
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
  fimNative?: boolean;
  authType?: 'bearer' | 'x-api-key' | 'none';
}

export interface TinyInlineConfig {
  enabled: boolean;
  activeProvider: string;
  debounceMs: number;
  maxTokens: number;
  contextWindow: number;
}
