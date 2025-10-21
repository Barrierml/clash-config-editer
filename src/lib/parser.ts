import { load, YAMLException } from 'js-yaml';
import type { ProxyNode } from '../types';
import { dedupeNodes, extractFlagEmoji } from './utils';

type UnknownRecord = Record<string, unknown>;

interface ParseResult {
  nodes: ProxyNode[];
  warnings: string[];
}

export function parseClashConfig(yamlText: string): ParseResult {
  try {
    const rawDoc = load(yamlText);
    if (!isRecord(rawDoc)) {
      return { nodes: [], warnings: ['YAML did not produce an object.'] };
    }

    const nodes: ProxyNode[] = [];
    const warnings: string[] = [];

    const proxiesField = rawDoc['proxies'];
    if (Array.isArray(proxiesField)) {
      nodes.push(...normalizeNodes(proxiesField));
    }

    const proxyProviders = rawDoc['proxy-providers'];
    if (isRecord(proxyProviders)) {
      for (const [providerName, providerValue] of Object.entries(proxyProviders)) {
        if (isRecord(providerValue) && Array.isArray(providerValue.proxies)) {
          nodes.push(...normalizeNodes(providerValue.proxies));
        } else {
          warnings.push(`Provider "${providerName}" has no inline proxies. Remote providers are not imported.`);
        }
      }
    }

    if (nodes.length === 0) {
      warnings.push('No proxies were found in the provided configuration.');
    }

    const deduped = dedupeNodes(nodes);

    return { nodes: deduped, warnings };
  } catch (error) {
    const message = error instanceof YAMLException ? error.message : 'Unknown parsing error';
    return { nodes: [], warnings: [message] };
  }
}

function normalizeNodes(items: unknown[]): ProxyNode[] {
  return items
    .map((item) => (isRecord(item) ? item : undefined))
    .filter((item): item is UnknownRecord => Boolean(item && item.name))
    .map((item) => {
      const name = String(item.name);
      const flag = extractFlagEmoji(name);
      return {
        name,
        type: item.type ? String(item.type) : undefined,
        server: item.server ? String(item.server) : undefined,
        port: item.port ? Number(item.port) : undefined,
        country: flag,
        raw: item
      } satisfies ProxyNode;
    });
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}
