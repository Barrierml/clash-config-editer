import { dump } from 'js-yaml';
import type { AppSettings, ProxyNode, ProxyPool } from '../types';

export function extractFlagEmoji(text: string): string | undefined {
  const match = text.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
  return match ? match[0] : undefined;
}

export function dedupeNodes(nodes: ProxyNode[]): ProxyNode[] {
  const seen = new Set<string>();
  return nodes.filter((node) => {
    if (!node.name || seen.has(node.name)) {
      return false;
    }
    seen.add(node.name);
    return true;
  });
}

export function generateConfigYaml(
  settings: AppSettings,
  pools: ProxyPool[],
  proxies: ProxyNode[],
  selectedProxyNames: string[]
): string {
  const listeners = pools.map((pool) => ({
    name: `mixed-${pool.port}`,
    type: 'mixed',
    listen: '0.0.0.0',
    port: pool.port,
    tag: `in-${pool.port}`
  }));

  const proxyGroups = pools.map((pool) => ({
    name: pool.name,
    type: 'load-balance',
    strategy: pool.strategy,
    proxies: pool.proxies
  }));

  const rules = pools.map((pool) => `INBOUND-TAG,in-${pool.port},${pool.name}`);
  if (pools.length > 0) {
    rules.push(`MATCH,${pools[0].name}`);
  } else {
    rules.push('MATCH,DIRECT');
  }

  const selectedProxySet = new Set(selectedProxyNames);
  const proxiesToInclude =
    settings.proxyExportMode === 'all'
      ? proxies
      : proxies.filter((proxy) => selectedProxySet.has(proxy.name));

  const payload: Record<string, unknown> = {
    'allow-lan': settings.allowLan,
    mode: 'rule',
    'log-level': settings.logLevel,
    'external-controller': `0.0.0.0:${settings.controllerPort}`,
    secret: settings.secret ?? '',
    listeners,
    proxies: proxiesToInclude.map((proxy) => proxy.raw),
    'proxy-groups': proxyGroups,
    rules
  };

  return dump(payload, { lineWidth: 120, noRefs: true });
}

export const DEFAULT_SETTINGS: AppSettings = {
  controllerPort: 9090,
  secret: '',
  allowLan: true,
  logLevel: 'info',
  proxyExportMode: 'all'
};

export function persistState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to persist state', error);
  }
}

export function readState<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn('Failed to restore state', error);
    return fallback;
  }
}
