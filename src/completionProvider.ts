import * as vscode from 'vscode';
import { resolveProvider, resolveWithFallback } from './providers/registry';
import { extractFimContext } from './template';
import { getCached, setCache, filterStream, postProcess, clearCache } from './filter';
import { getTinyInlineConfig } from './config';

export class TinyInlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private abortControllers = new Map<string, AbortController>();

  constructor(private statusBar: vscode.StatusBarItem) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.InlineCompletionItem[]> {
    const config = getTinyInlineConfig();
    if (!config.enabled) return [];

    if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
      if (this.shouldSkipContext(document, position)) {
        return [];
      }
    }

    const docUri = document.uri.toString();
    this.abortControllers.get(docUri)?.abort();
    this.abortControllers.delete(docUri);

    const ac = new AbortController();
    this.abortControllers.set(docUri, ac);

    const abortSignal = ac.signal;

    token.onCancellationRequested(() => ac.abort());

    const debounceKey = `${docUri}:${position.line}:${position.character}`;

    return new Promise<vscode.InlineCompletionItem[]>((resolve) => {
      const existing = this.debounceTimers.get(debounceKey);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        this.debounceTimers.delete(debounceKey);
        try {
          if (abortSignal.aborted) return resolve([]);
          const items = await this.fetchCompletion(document, position, abortSignal);
          resolve(items);
        } catch {
          resolve([]);
        }
      }, config.debounceMs);

      this.debounceTimers.set(debounceKey, timer);
    });
  }

  private shouldSkipContext(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): boolean {
    const line = document.lineAt(position.line);
    const textBefore = line.text.slice(0, position.character);
    const trimmed = textBefore.trimEnd();

    if (trimmed.length === 0) return true;

    const skipChars = ['{', '}', ';', ' ', '\t', '(', ')', '[', ']', ':'];
    if (trimmed.length >= 1 && skipChars.includes(trimmed.slice(-1))) {
      return true;
    }

    if (position.character > 0) {
      const charBefore = line.text[position.character - 1];
      if ([' ', '\t', '\n'].includes(charBefore)) {
        const textBeforeWord = textBefore.trimEnd();
        if (textBeforeWord.endsWith('}') || textBeforeWord.endsWith(';')) {
          return true;
        }
      }
    }

    return false;
  }

  private async fetchCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    signal: AbortSignal,
  ): Promise<vscode.InlineCompletionItem[]> {
    const config = getTinyInlineConfig();

    if (signal.aborted) return [];

    const resolved = await resolveWithFallback(config.activeProvider);
    if (!resolved) {
      this.statusBar.text = '$(warning) Tiny Inline: no provider';
      return [];
    }

    const offset = document.offsetAt(position);
    const content = document.getText();
    const ctx = extractFimContext(content, offset, config.contextWindow);

    if (ctx.prefix.length === 0) return [];

    const cached = getCached(ctx.prefix, ctx.suffix);
    if (cached) {
      return [new vscode.InlineCompletionItem(cached)];
    }

    const suffixEmpty = !ctx.suffix.trim();
    const tokens = suffixEmpty
      ? Math.floor(config.maxTokens / 2)
      : config.maxTokens;

    try {
      const stream = resolved.stream(resolved.config, {
        prefix: ctx.prefix,
        suffix: ctx.suffix,
        fileName: document.fileName,
        language: document.languageId,
      }, tokens, signal);

      const filtered = filterStream(stream, ctx.prefix, ctx.suffix);

      let fullText = '';
      for await (const chunk of filtered) {
        if (signal.aborted) return [];
        fullText += chunk;
      }

      const processed = postProcess(fullText, ctx.prefix, ctx.suffix, config.maxLines);

      if (processed && processed.length > 0) {
        setCache(ctx.prefix, ctx.suffix, processed);
        return [new vscode.InlineCompletionItem(processed)];
      }

      return [];
    } catch (err: any) {
      if (err.name === 'AbortError' || signal.aborted) return [];

      this.statusBar.text = '$(error) Tiny Inline: error';
      setTimeout(() => {
        this.statusBar.text = `$(sparkle) Tiny Inline: ${resolved.config.name}`;
      }, 3000);
      return [];
    }
  }

  clearCache(): void {
    clearCache();
  }

  dispose(): void {
    for (const timer of this.debounceTimers.values()) clearTimeout(timer);
    for (const ac of this.abortControllers.values()) ac.abort();
    this.debounceTimers.clear();
    this.abortControllers.clear();
  }
}
