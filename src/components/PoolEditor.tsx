import * as React from 'react';
import type { ProxyPool } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Badge } from './ui/badge';

interface PoolEditorProps {
  pools: ProxyPool[];
  selectedNodes: string[];
  onCreatePool: () => void;
  onCreatePoolsFromSelection: () => void;
  onUpdatePool: (id: string, patch: Partial<ProxyPool>) => void;
  onDeletePool: (id: string) => void;
  onAssignNodes: (id: string, nodes: string[]) => void;
  onRemoveNode: (id: string, nodeName: string) => void;
  onRemoveNodes: (id: string, nodeNames: string[]) => void;
  onClearNodes: (id: string) => void;
}

export function PoolEditor({
  pools,
  selectedNodes,
  onCreatePool,
  onCreatePoolsFromSelection,
  onUpdatePool,
  onDeletePool,
  onAssignNodes,
  onRemoveNode,
  onRemoveNodes,
  onClearNodes
}: PoolEditorProps) {
  const [creationMode, setCreationMode] = React.useState<'single' | 'per-selection'>('single');

  const handleCreate = () => {
    if (creationMode === 'per-selection') {
      onCreatePoolsFromSelection();
    } else {
      onCreatePool();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Proxy Pools</h2>
          <p className="text-sm text-muted-foreground">
            Create pools and assign nodes from your current selection.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={creationMode}
            onChange={(event) => setCreationMode(event.target.value as 'single' | 'per-selection')}
            aria-label="Pool creation mode"
            className="sm:w-64"
          >
            <option value="single">Add an empty pool</option>
            <option value="per-selection">Create a pool for each selected proxy</option>
          </Select>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={creationMode === 'per-selection' && selectedNodes.length === 0}
          >
            {creationMode === 'per-selection' ? 'Add from selection' : 'Add Pool'}
          </Button>
        </div>
      </div>

      {pools.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-muted-foreground">
          No pools yet. Create one and assign nodes using the checkbox selection above.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {pools.map((pool) => (
          <Card key={pool.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{pool.name || 'Unnamed Pool'}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onClearNodes(pool.id)}
                    disabled={pool.proxies.length === 0}
                  >
                    Clear nodes
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDeletePool(pool.id)}>
                    Remove
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={pool.name}
                    placeholder="Pool name"
                    onChange={(event) => onUpdatePool(pool.id, { name: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Strategy</Label>
                  <Select
                    value={pool.strategy}
                    onChange={(event) =>
                      onUpdatePool(pool.id, { strategy: event.target.value as ProxyPool['strategy'] })
                    }
                  >
                    <option value="random">random</option>
                    <option value="round-robin">round-robin</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Listener Port</Label>
                  <Input
                    type="number"
                    min={1}
                    max={65535}
                    value={pool.port}
                    onChange={(event) =>
                      onUpdatePool(pool.id, { port: Number.parseInt(event.target.value, 10) || pool.port })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Nodes</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={selectedNodes.length === 0}
                      onClick={() => onAssignNodes(pool.id, selectedNodes)}
                    >
                      Assign selected ({selectedNodes.length})
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pool.proxies.every((proxy) => !selectedNodes.includes(proxy))}
                      onClick={() =>
                        onRemoveNodes(
                          pool.id,
                          pool.proxies.filter((proxy) => selectedNodes.includes(proxy))
                        )
                      }
                    >
                      Remove selected
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pool.proxies.map((proxy) => (
                    <Badge key={proxy} className="gap-1">
                      {proxy}
                      <button
                        type="button"
                        className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => onRemoveNode(pool.id, proxy)}
                        aria-label={`Remove ${proxy}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {pool.proxies.length === 0 && (
                    <span className="text-xs text-muted-foreground">No nodes assigned yet.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
