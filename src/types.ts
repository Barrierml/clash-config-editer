export interface ProxyNode {
  name: string;
  type?: string;
  server?: string;
  port?: number;
  country?: string;
  raw: Record<string, unknown>;
}

export const LOAD_BALANCE_STRATEGIES = ['round-robin', 'consistent-hashing', 'sticky-sessions'] as const;

export type Strategy = (typeof LOAD_BALANCE_STRATEGIES)[number];

export function normalizeStrategy(value: unknown): Strategy {
  if (typeof value === 'string') {
    for (const strategy of LOAD_BALANCE_STRATEGIES) {
      if (strategy === value) {
        return strategy;
      }
    }
  }
  return LOAD_BALANCE_STRATEGIES[0];
}

export interface ProxyPool {
  id: string;
  name: string;
  strategy: Strategy;
  port: number;
  proxies: string[];
}

export type ProxyExportMode = 'all' | 'selected';

export interface AppSettings {
  controllerPort: number;
  secret: string;
  allowLan: boolean;
  logLevel: 'info' | 'warning' | 'error' | 'debug';
  proxyExportMode: ProxyExportMode;
}

export interface UploadedConfigSource {
  id: string;
  name: string;
  content: string;
}

export interface SavedConfig {
  id: string;
  name: string;
  manualText: string;
  files: UploadedConfigSource[];
  createdAt: number;
}
