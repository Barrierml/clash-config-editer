import * as React from 'react';
import type { ProxyNode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTranslation } from '../lib/i18n';

interface NodeRowProps {
  node: ProxyNode;
  index: number;
  isSelected: boolean;
  onToggle: (index: number, name: string, nextSelected: boolean, modifiers: { shiftKey?: boolean }) => void;
}

const NodeRow = React.memo(
  function NodeRow({ node, index, isSelected, onToggle }: NodeRowProps) {
    const handleRowClick = React.useCallback(
      (event: React.MouseEvent<HTMLTableRowElement>) => {
        onToggle(index, node.name, !isSelected, { shiftKey: event.shiftKey });
      },
      [index, isSelected, node.name, onToggle]
    );

    const handleCheckboxChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nativeEvent = event.nativeEvent as MouseEvent | KeyboardEvent;
        onToggle(index, node.name, event.target.checked, {
          shiftKey: Boolean(nativeEvent?.shiftKey)
        });
      },
      [index, node.name, onToggle]
    );

    const handleCheckboxClick = React.useCallback((event: React.MouseEvent<HTMLInputElement>) => {
      event.stopPropagation();
    }, []);

    return (
      <tr
        className={`${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/40'} cursor-pointer`}
        onClick={handleRowClick}
      >
        <td className="px-4 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={handleCheckboxClick}
          />
        </td>
        <td className="px-4 py-2 font-medium">
          <div className="flex items-center gap-2">
            <span>{node.country ?? '🌐'}</span>
            <span>{node.name}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-muted-foreground">{node.type ?? '—'}</td>
        <td className="px-4 py-2 text-muted-foreground">{node.server ?? '—'}</td>
        <td className="px-4 py-2 text-muted-foreground">{node.port ?? '—'}</td>
      </tr>
    );
  },
  (prev, next) =>
    prev.index === next.index &&
    prev.isSelected === next.isSelected &&
    prev.node === next.node &&
    prev.onToggle === next.onToggle
);

interface NodeTableProps {
  nodes: ProxyNode[];
  selected: Set<string>;
  onToggle: (name: string, nextSelected?: boolean) => void;
  onSelectMany: (names: string[], append?: boolean) => void;
}

export function NodeTable({ nodes, selected, onToggle, onSelectMany }: NodeTableProps) {
  const [search, setSearch] = React.useState('');
  const deferredSearch = React.useDeferredValue(search);
  const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
  const lastInteractedIndex = React.useRef<number | null>(null);
  const { t } = useTranslation();

  const filtered = React.useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();
    if (!keyword) return nodes;
    return nodes.filter((node) =>
      [node.name, node.server, node.type]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(keyword))
    );
  }, [deferredSearch, nodes]);

  const filteredNames = React.useMemo(() => filtered.map((node) => node.name), [filtered]);
  const allNodeNames = React.useMemo(() => nodes.map((node) => node.name), [nodes]);

  const isAllSelected = filtered.length > 0 && filtered.every((node) => selected.has(node.name));
  const hasSomeSelected = filtered.some((node) => selected.has(node.name));

  React.useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = hasSomeSelected && !isAllSelected;
  }, [hasSomeSelected, isAllSelected]);

  const handleRowToggle = React.useCallback(
    (
      index: number,
      name: string,
      nextSelected: boolean,
      modifiers: { shiftKey?: boolean }
    ) => {
      if (modifiers.shiftKey && lastInteractedIndex.current !== null && filtered.length > 0) {
        const start = Math.min(index, lastInteractedIndex.current);
        const end = Math.max(index, lastInteractedIndex.current);
        const rangeNames = filtered.slice(start, end + 1).map((node) => node.name);
        onSelectMany(rangeNames, nextSelected);
      } else {
        onToggle(name, nextSelected);
      }

      lastInteractedIndex.current = index;
    },
    [filtered, onSelectMany, onToggle]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('nodeTableSummary', { filtered: filtered.length, selected: selected.size })}
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Input
            placeholder={t('nodeTableSearchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-64"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSelectMany(allNodeNames, true)}
              disabled={nodes.length === 0}
            >
              {t('nodeTableSelectAll')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onSelectMany(filteredNames, !isAllSelected)
              }
              disabled={filtered.length === 0}
            >
              {isAllSelected ? t('nodeTableUnselectFiltered') : t('nodeTableSelectFiltered')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onSelectMany(Array.from(selected), false)}
              disabled={selected.size === 0}
            >
              {t('nodeTableClearSelection')}
            </Button>
          </div>
        </div>
      </div>
      <div className="max-h-[360px] overflow-auto rounded-xl border border-border bg-secondary/30 scrollbar-thin">
        <table className="min-w-full divide-y divide-border/60 text-left text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  ref={headerCheckboxRef}
                  className="h-4 w-4 rounded border-border"
                  checked={isAllSelected}
                  onChange={(event) =>
                    onSelectMany(filteredNames, event.target.checked)
                  }
                  aria-label={t('nodeTableToggleFilteredAria')}
                />
              </th>
              <th className="px-4 py-3 font-medium">{t('nodeTableName')}</th>
              <th className="px-4 py-3 font-medium">{t('nodeTableType')}</th>
              <th className="px-4 py-3 font-medium">{t('nodeTableServer')}</th>
              <th className="px-4 py-3 font-medium">{t('nodeTablePort')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((node, index) => (
              <NodeRow
                key={node.name}
                node={node}
                index={index}
                isSelected={selected.has(node.name)}
                onToggle={handleRowToggle}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  {t('nodeTableNoResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
