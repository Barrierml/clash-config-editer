export interface ProxyNode {
  name: string;
  type?: string;
  server?: string;
  port?: number;
  country?: string;
  raw: Record<string, unknown>;
}

export type Strategy = 'random' | 'round-robin';

export interface ProxyPool {
  id: string;
  name: string;
  strategy: Strategy;
  port: number;
  proxies: string[];
}

export interface AppSettings {
  controllerPort: number;
  secret: string;
  allowLan: boolean;
  logLevel: 'info' | 'warning' | 'error' | 'debug';
}
