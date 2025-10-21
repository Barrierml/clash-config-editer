import * as React from 'react';
import { FileUpload } from './components/FileUpload';
import { NodeTable } from './components/NodeTable';
import { PoolEditor } from './components/PoolEditor';
import { ConfigPreview } from './components/ConfigPreview';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select } from './components/ui/select';
import type {
  AppSettings,
  ProxyNode,
  ProxyPool,
  SavedConfig,
  UploadedConfigSource
} from './types';
import { LOAD_BALANCE_STRATEGIES, normalizeStrategy } from './types';
import { DEFAULT_SETTINGS, dedupeNodes, generateConfigYaml, persistState, readState } from './lib/utils';
import { parseClashConfig } from './lib/parser';

const POOL_STORAGE_KEY = 'ccg:pools';
const SETTINGS_STORAGE_KEY = 'ccg:settings';
const SAVED_CONFIGS_STORAGE_KEY = 'ccg:saved-configs';
const BASE_POOL_PORT = 7890;

function sanitizePool(pool: ProxyPool): ProxyPool {
  return {
    ...pool,
    strategy: normalizeStrategy(pool.strategy)
  };
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pool-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getNextAvailablePort(usedPorts: Set<number>, start = BASE_POOL_PORT) {
  let candidate = start;
  while (usedPorts.has(candidate)) {
    candidate += 1;
  }
  return candidate;
}

function ensureUniqueName(
  base: string,
  usedNames: Set<string>,
  forbiddenNames: Iterable<string> = []
) {
  const reserved = new Set(usedNames);
  for (const name of forbiddenNames) {
    if (name) {
      reserved.add(name);
    }
  }

  if (!reserved.has(base)) {
    return base;
  }
  let counter = 2;
  let candidate = `${base} (${counter})`;
  while (reserved.has(candidate)) {
    counter += 1;
    candidate = `${base} (${counter})`;
  }
  return candidate;
}

function ConfigGeneratorApp(): JSX.Element {
  const [yamlText, setYamlText] = React.useState('');
  const [nodes, setNodes] = React.useState<ProxyNode[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Set<string>>(new Set());
  const [pools, setPools] = React.useState<ProxyPool[]>([]);
  const [settings, setSettings] = React.useState<AppSettings>(DEFAULT_SETTINGS);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedConfigSource[]>([]);
  const [savedConfigs, setSavedConfigs] = React.useState<SavedConfig[]>([]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const restoredPools = readState<ProxyPool[]>(POOL_STORAGE_KEY, []).map(sanitizePool);
    setPools(restoredPools);
    const restoredSettings = readState<AppSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
    setSettings({ ...DEFAULT_SETTINGS, ...restoredSettings });
    const restoredConfigs = readState<SavedConfig[]>(SAVED_CONFIGS_STORAGE_KEY, []).map((config) => ({
      ...config,
      files: Array.isArray(config.files)
        ? config.files.map((file) => ({ ...file, id: file.id ?? generateId() }))
        : []
    }));
    setSavedConfigs(restoredConfigs);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    persistState(POOL_STORAGE_KEY, pools);
  }, [pools]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    persistState(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    persistState(SAVED_CONFIGS_STORAGE_KEY, savedConfigs);
  }, [savedConfigs]);

  const parseSources = React.useCallback(
    (manual: string, files: UploadedConfigSource[]) => {
      const sources: Array<{ label?: string; text: string }> = [];
      if (manual.trim()) {
        sources.push({ label: 'Pasted YAML', text: manual });
      }
      for (const file of files) {
        if (file.content.trim()) {
          sources.push({ label: file.name, text: file.content });
        }
      }

      if (sources.length === 0) {
        setNodes([]);
        setWarnings(['Please provide YAML content first.']);
        setSelectedNodes(new Set());
        return;
      }

      const aggregatedNodes: ProxyNode[] = [];
      const aggregatedWarnings: string[] = [];

      for (const source of sources) {
        const result = parseClashConfig(source.text);
        aggregatedNodes.push(...result.nodes);
        const prefix = source.label ? `${source.label}: ` : '';
        aggregatedWarnings.push(...result.warnings.map((warning) => `${prefix}${warning}`));
      }

      const deduped = dedupeNodes(aggregatedNodes);

      if (deduped.length === 0 && aggregatedWarnings.length === 0) {
        aggregatedWarnings.push('No proxies were found across the provided configurations.');
      }

      setNodes(deduped);
      setWarnings(aggregatedWarnings);
      setSelectedNodes(new Set());
    },
    [setNodes, setSelectedNodes, setWarnings]
  );

  const handleParse = React.useCallback(() => {
    parseSources(yamlText, uploadedFiles);
  }, [parseSources, uploadedFiles, yamlText]);

  const toggleNode = React.useCallback((name: string) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const selectMany = React.useCallback((names: string[], select = true) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      for (const name of names) {
        if (select) {
          next.add(name);
        } else {
          next.delete(name);
        }
      }
      return next;
    });
  }, []);

  const handleFilesAdded = React.useCallback(
    (files: { name: string; content: string }[]) => {
      if (files.length === 0) return;
      setUploadedFiles((prev) => {
        const additions = files.map((file) => ({
          id: generateId(),
          name: file.name,
          content: file.content
        }));
        const next = [...prev, ...additions];
        parseSources(yamlText, next);
        return next;
      });
    },
    [parseSources, yamlText]
  );

  const handleRemoveFile = React.useCallback(
    (id: string) => {
      setUploadedFiles((prev) => {
        const next = prev.filter((file) => file.id !== id);
        parseSources(yamlText, next);
        return next;
      });
    },
    [parseSources, yamlText]
  );

  const handleClearManual = React.useCallback(() => {
    setYamlText('');
    parseSources('', uploadedFiles);
  }, [parseSources, uploadedFiles]);

  const handleClearFiles = React.useCallback(() => {
    setUploadedFiles([]);
    parseSources(yamlText, []);
  }, [parseSources, yamlText]);

  const handleSaveConfig = React.useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }
      if (!yamlText.trim() && uploadedFiles.length === 0) {
        return;
      }

      setSavedConfigs((prev) => {
        const usedNames = new Set(prev.map((config) => config.name));
        const resolvedName = ensureUniqueName(trimmed, usedNames);
        const snapshot: SavedConfig = {
          id: generateId(),
          name: resolvedName,
          manualText: yamlText,
          files: uploadedFiles.map((file) => ({ ...file })),
          createdAt: Date.now()
        };
        return [...prev, snapshot];
      });
    },
    [uploadedFiles, yamlText]
  );

  const handleLoadConfig = React.useCallback(
    (id: string) => {
      const config = savedConfigs.find((item) => item.id === id);
      if (!config) {
        return;
      }
      setYamlText(config.manualText);
      setUploadedFiles(config.files.map((file) => ({ ...file })));
      parseSources(config.manualText, config.files);
    },
    [parseSources, savedConfigs]
  );

  const handleDeleteConfig = React.useCallback((id: string) => {
    setSavedConfigs((prev) => prev.filter((config) => config.id !== id));
  }, []);

  const createPool = () => {
    setPools((prev) => {
      const usedPorts = new Set(prev.map((pool) => pool.port));
      const usedNames = new Set(prev.map((pool) => pool.name));
      const name = ensureUniqueName(
        `Pool ${prev.length + 1}`,
        usedNames,
        nodes.map((node) => node.name)
      );
      const port = getNextAvailablePort(usedPorts);
      return [
        ...prev,
        {
          id: generateId(),
          name,
          strategy: LOAD_BALANCE_STRATEGIES[0],
          port,
          proxies: []
        }
      ];
    });
  };

  const createPoolsFromSelection = () => {
    setPools((prev) => {
      const selected = Array.from(selectedNodes);
      if (selected.length === 0) return prev;

      const usedPorts = new Set(prev.map((pool) => pool.port));
      const usedNames = new Set(prev.map((pool) => pool.name));
      const nodeNames = nodes.map((node) => node.name);
      const nextPools = [...prev];
      let searchStart = BASE_POOL_PORT;

      for (const proxyName of selected) {
        const name = ensureUniqueName(proxyName, usedNames, nodeNames);
        const port = getNextAvailablePort(usedPorts, searchStart);
        usedNames.add(name);
        usedPorts.add(port);
        searchStart = port + 1;
        nextPools.push({
          id: generateId(),
          name,
          strategy: LOAD_BALANCE_STRATEGIES[0],
          port,
          proxies: [proxyName]
        });
      }

      return nextPools;
    });
  };

  const updatePool = (id: string, patch: Partial<ProxyPool>) => {
    setPools((prev) => {
      const usedNames = new Set(prev.filter((pool) => pool.id !== id).map((pool) => pool.name));
      const nodeNames = nodes.map((node) => node.name);

      return prev.map((pool) => {
        if (pool.id !== id) {
          return pool;
        }

        const nextPatch =
          typeof patch.name === 'string'
            ? { ...patch, name: ensureUniqueName(patch.name, usedNames, nodeNames) }
            : patch;

        return sanitizePool({ ...pool, ...nextPatch, proxies: pool.proxies });
      });
    });
  };

  const deletePool = (id: string) => {
    setPools((prev) => prev.filter((pool) => pool.id !== id));
  };

  const assignNodes = (id: string, nodesToAssign: string[]) => {
    if (nodesToAssign.length === 0) return;
    setPools((prev) =>
      prev.map((pool) =>
        pool.id === id
          ? {
              ...pool,
              proxies: Array.from(new Set([...pool.proxies, ...nodesToAssign]))
            }
          : pool
      )
    );
  };

  const removeNode = (id: string, nodeName: string) => {
    setPools((prev) =>
      prev.map((pool) =>
        pool.id === id ? { ...pool, proxies: pool.proxies.filter((proxy) => proxy !== nodeName) } : pool
      )
    );
  };

  const removeNodes = (id: string, nodeNames: string[]) => {
    if (nodeNames.length === 0) return;
    setPools((prev) =>
      prev.map((pool) =>
        pool.id === id
          ? {
              ...pool,
              proxies: pool.proxies.filter((proxy) => !nodeNames.includes(proxy))
            }
          : pool
      )
    );
  };

  const clearPoolNodes = (id: string) => {
    setPools((prev) =>
      prev.map((pool) => (pool.id === id ? { ...pool, proxies: [] } : pool))
    );
  };

  const updateSettings = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const generatedYaml = React.useMemo(() => {
    if (nodes.length === 0) return '';
    return generateConfigYaml(settings, pools, nodes, Array.from(selectedNodes));
  }, [nodes, pools, settings, selectedNodes]);

  const handleCopy = async () => {
    if (!generatedYaml) return;
    try {
      await navigator.clipboard.writeText(generatedYaml);
    } catch (error) {
      console.error('Failed to copy YAML', error);
    }
  };

  const handleDownload = () => {
    if (!generatedYaml) return;
    const blob = new Blob([generatedYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'config.yaml';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold">Clash Configuration Generator</h1>
        <p className="text-sm text-muted-foreground">
          Parse your Clash configuration, craft load-balanced pools, and export a ready-to-run Clash.Meta config.
        </p>
      </header>

      <section>
        <FileUpload
          manualText={yamlText}
          uploadedFiles={uploadedFiles}
          savedConfigs={savedConfigs}
          onManualChange={setYamlText}
          onFilesAdded={handleFilesAdded}
          onRemoveFile={handleRemoveFile}
          onClearManual={handleClearManual}
          onClearFiles={handleClearFiles}
          onParse={handleParse}
          onSaveConfig={handleSaveConfig}
          onLoadConfig={handleLoadConfig}
          onDeleteConfig={handleDeleteConfig}
          warnings={warnings}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <NodeTable
              nodes={nodes}
              selected={selectedNodes}
              onToggle={toggleNode}
              onSelectMany={(names, select) => selectMany(names, select)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Runtime Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="controller-port">Controller Port</Label>
              <Input
                id="controller-port"
                type="number"
                min={1}
                max={65535}
                value={settings.controllerPort}
                onChange={(event) => updateSettings('controllerPort', Number(event.target.value) || 9090)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="secret">Secret</Label>
              <Input
                id="secret"
                value={settings.secret}
                placeholder="Optional secret"
                onChange={(event) => updateSettings('secret', event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="proxy-export-mode">Proxy Export</Label>
              <Select
                id="proxy-export-mode"
                value={settings.proxyExportMode}
                onChange={(event) =>
                  updateSettings('proxyExportMode', event.target.value as AppSettings['proxyExportMode'])
                }
              >
                <option value="all">Include all proxies</option>
                <option value="selected">Only selected proxies</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose whether to export every proxy or just the ones currently selected above.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div>
                <p className="text-sm font-medium">Allow LAN</p>
                <p className="text-xs text-muted-foreground">Expose the proxy to your local network.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <span className="text-xs text-muted-foreground">{settings.allowLan ? 'On' : 'Off'}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={settings.allowLan}
                  onChange={(event) => updateSettings('allowLan', event.target.checked)}
                />
              </label>
            </div>
            <div className="space-y-1">
              <Label htmlFor="log-level">Log Level</Label>
              <Select
                id="log-level"
                value={settings.logLevel}
                onChange={(event) => updateSettings('logLevel', event.target.value as AppSettings['logLevel'])}
              >
                <option value="info">info</option>
                <option value="warning">warning</option>
                <option value="error">error</option>
                <option value="debug">debug</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <PoolEditor
          pools={pools}
          selectedNodes={Array.from(selectedNodes)}
          onCreatePool={createPool}
          onCreatePoolsFromSelection={createPoolsFromSelection}
          onUpdatePool={updatePool}
          onDeletePool={deletePool}
          onAssignNodes={assignNodes}
          onRemoveNode={removeNode}
          onRemoveNodes={removeNodes}
          onClearNodes={clearPoolNodes}
        />
      </section>

      <section>
        <ConfigPreview
          yaml={generatedYaml}
          onCopy={handleCopy}
          onDownload={handleDownload}
          disabled={nodes.length === 0}
        />
      </section>
    </main>
  );
}

export default ConfigGeneratorApp;
