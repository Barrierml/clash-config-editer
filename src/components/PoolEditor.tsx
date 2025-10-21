import * as React from 'react';
import type { ProxyPool } from '../types';
import { LOAD_BALANCE_STRATEGIES } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Badge } from './ui/badge';
import { useTranslation } from '../lib/i18n';

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
  const { t } = useTranslation();

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
          <h2 className="text-lg font-semibold">{t('poolEditorTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('poolEditorSubtitle')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={creationMode}
            onChange={(event) => setCreationMode(event.target.value as 'single' | 'per-selection')}
            aria-label="Pool creation mode"
            className="sm:w-64"
          >
            <option value="single">{t('poolEditorAddEmpty')}</option>
            <option value="per-selection">{t('poolEditorAddPerSelection')}</option>
          </Select>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={creationMode === 'per-selection' && selectedNodes.length === 0}
          >
            {creationMode === 'per-selection' ? t('poolEditorAddFromSelection') : t('poolEditorAddPool')}
          </Button>
        </div>
      </div>

      {pools.length === 0 && (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-muted-foreground">
          {t('poolEditorEmptyState')}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {pools.map((pool) => (
          <Card key={pool.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{pool.name || t('poolEditorUnnamed')}</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onClearNodes(pool.id)}
                    disabled={pool.proxies.length === 0}
                  >
                    {t('poolEditorClearNodes')}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDeletePool(pool.id)}>
                    {t('poolEditorRemovePool')}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label>{t('poolEditorNameLabel')}</Label>
                  <Input
                    value={pool.name}
                    placeholder={t('poolEditorNamePlaceholder')}
                    onChange={(event) => onUpdatePool(pool.id, { name: event.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('poolEditorStrategyLabel')}</Label>
                  <Select
                    value={pool.strategy}
                    onChange={(event) =>
                      onUpdatePool(pool.id, { strategy: event.target.value as ProxyPool['strategy'] })
                    }
                  >
                    {LOAD_BALANCE_STRATEGIES.map((strategy) => (
                      <option key={strategy} value={strategy}>
                        {strategy}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>{t('poolEditorPortLabel')}</Label>
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
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('poolEditorNodesLabel')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={selectedNodes.length === 0}
                      onClick={() => onAssignNodes(pool.id, selectedNodes)}
                    >
                      {t('poolEditorAssignSelected', { count: selectedNodes.length })}
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
                      {t('poolEditorRemoveSelected')}
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
                        aria-label={t('poolEditorRemoveProxyAria', { name: proxy })}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  {pool.proxies.length === 0 && (
                    <span className="text-xs text-muted-foreground">{t('poolEditorNoNodes')}</span>
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
