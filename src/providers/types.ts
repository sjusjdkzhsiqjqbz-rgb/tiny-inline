export interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  fimNative: boolean;
  authType: 'bearer' | 'x-api-key' | 'none';
  type: 'preset' | 'custom';
}

export interface CompletionRequest {
  prefix: string;
  suffix: string;
  fileName: string;
  language: string;
}

export interface CompletionResult {
  text: string;
}

export interface FimTestResult {
  supportsFim: boolean;
  error?: string;
  statusCode?: number;
}
