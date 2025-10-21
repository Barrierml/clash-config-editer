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
  const selectedProxySet = new Set(selectedProxyNames);
  const proxiesToInclude =
    settings.proxyExportMode === 'all'
      ? proxies
      : proxies.filter((proxy) => selectedProxySet.has(proxy.name));

  const allowedProxyNames = new Set(proxiesToInclude.map((proxy) => proxy.name));
  const usedGroupNames = new Set<string>();

  const sanitizedGroups = pools
    .map((pool) => {
      const memberSeen = new Set<string>();
      const cleanedMembers = pool.proxies.filter((member) => {
        if (!allowedProxyNames.has(member)) {
          return false;
        }
        if (memberSeen.has(member)) {
          return false;
        }
        memberSeen.add(member);
        return true;
      });

      if (cleanedMembers.length === 0) {
        return undefined;
      }

      const baseName = allowedProxyNames.has(pool.name) ? `POOL_${pool.name}` : pool.name;
      let groupName = baseName;
      let suffix = 1;
      while (allowedProxyNames.has(groupName) || usedGroupNames.has(groupName)) {
        groupName = `${baseName}_${suffix++}`;
      }

      const filteredMembers = cleanedMembers.filter((member) => member !== groupName);
      if (filteredMembers.length === 0) {
        return undefined;
      }

      usedGroupNames.add(groupName);

      return {
        name: groupName,
        strategy: pool.strategy,
        port: pool.port,
        proxies: filteredMembers
      };
    })
    .filter((group): group is { name: string; strategy: ProxyPool['strategy']; port: number; proxies: string[] } =>
      Boolean(group)
    );

  const listeners = sanitizedGroups.map((group) => ({
    name: `mixed-${group.port}`,
    type: 'mixed',
    listen: '0.0.0.0',
    port: group.port,
    tag: `in-${group.port}`
  }));

  const proxyGroups = sanitizedGroups.map((group) => ({
    name: group.name,
    type: 'load-balance',
    strategy: group.strategy,
    proxies: group.proxies
  }));

  const rules = sanitizedGroups.map((group) => `INBOUND-TAG,in-${group.port},${group.name}`);
  if (sanitizedGroups.length > 0) {
    rules.push(`MATCH,${sanitizedGroups[0].name}`);
  } else {
    rules.push('MATCH,DIRECT');
  }

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
