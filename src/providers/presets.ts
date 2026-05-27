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
  'groq': {
    id: 'groq',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.groq.apiKey',
      model: 'tiny-inline.providers.groq.model',
      baseUrl: 'tiny-inline.providers.groq.baseUrl',
    },
    defaults: {
      model: 'qwen-qwq-32b',
      baseUrl: 'https://api.groq.com/openai/v1',
    },
  },
  'deepinfra': {
    id: 'deepinfra',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.deepinfra.apiKey',
      model: 'tiny-inline.providers.deepinfra.model',
      baseUrl: 'tiny-inline.providers.deepinfra.baseUrl',
    },
    defaults: {
      model: 'deepseek-ai/DeepSeek-V3',
      baseUrl: 'https://api.deepinfra.com/v1/openai',
    },
  },
  'together': {
    id: 'together',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.together.apiKey',
      model: 'tiny-inline.providers.together.model',
      baseUrl: 'tiny-inline.providers.together.baseUrl',
    },
    defaults: {
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      baseUrl: 'https://api.together.xyz/v1',
    },
  },
  'fireworks': {
    id: 'fireworks',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.fireworks.apiKey',
      model: 'tiny-inline.providers.fireworks.model',
      baseUrl: 'tiny-inline.providers.fireworks.baseUrl',
    },
    defaults: {
      model: 'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
      baseUrl: 'https://api.fireworks.ai/inference/v1',
    },
  },
  'mistral': {
    id: 'mistral',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.mistral.apiKey',
      model: 'tiny-inline.providers.mistral.model',
      baseUrl: 'tiny-inline.providers.mistral.baseUrl',
    },
    defaults: {
      model: 'codestral-latest',
      baseUrl: 'https://api.mistral.ai/v1',
    },
  },
  'xai': {
    id: 'xai',
    fimNative: false,
    configKeys: {
      apiKey: 'tiny-inline.providers.xai.apiKey',
      model: 'tiny-inline.providers.xai.model',
      baseUrl: 'tiny-inline.providers.xai.baseUrl',
    },
    defaults: {
      model: 'grok-3-mini',
      baseUrl: 'https://api.x.ai/v1',
    },
  },
  'lmstudio': {
    id: 'lmstudio',
    fimNative: false,
    configKeys: {
      apiKey: '',
      model: 'tiny-inline.providers.lmstudio.model',
      baseUrl: 'tiny-inline.providers.lmstudio.baseUrl',
    },
    defaults: {
      model: 'local-model',
      baseUrl: 'http://localhost:1234/v1',
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
  maxLines: number;
  contextWindow: number;
}
