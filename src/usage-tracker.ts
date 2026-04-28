import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export interface UsageRecord {
  modelId: string;
  providerName: string;
  callCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  lastUsedAt: number;
}

const CACHE_FILE = path.resolve(process.cwd(), '.freeway', 'usage.json');

class UsageTracker {
  private records = new Map<string, UsageRecord>();
  private initialized = false;

  private key(modelId: string, providerName: string): string {
    return `${modelId}::${providerName}`;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const raw = await readFile(CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as UsageRecord[];
      for (const r of parsed) {
        this.records.set(this.key(r.modelId, r.providerName), r);
      }
    } catch {
      // no persisted usage yet
    }
    this.initialized = true;
  }

  record(
    modelId: string,
    providerName: string,
    promptTokens: number,
    completionTokens: number,
  ): void {
    const k = this.key(modelId, providerName);
    const existing = this.records.get(k);
    const pt = Math.max(0, Math.round(promptTokens));
    const ct = Math.max(0, Math.round(completionTokens));
    if (existing) {
      existing.callCount += 1;
      existing.promptTokens += pt;
      existing.completionTokens += ct;
      existing.totalTokens += pt + ct;
      existing.lastUsedAt = Date.now();
    } else {
      this.records.set(k, {
        modelId,
        providerName,
        callCount: 1,
        promptTokens: pt,
        completionTokens: ct,
        totalTokens: pt + ct,
        lastUsedAt: Date.now(),
      });
    }
    // persist asynchronously; don't block response
    this.flush().catch(() => {
      // ignore persistence errors
    });
  }

  getStats(): UsageRecord[] {
    return Array.from(this.records.values()).sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  }

  clear(): UsageRecord[] {
    const records = Array.from(this.records.values());
    this.records.clear();
    return records;
  }

  private async flush(): Promise<void> {
    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(this.getStats(), null, 2));
  }
}

export const usageTracker = new UsageTracker();
