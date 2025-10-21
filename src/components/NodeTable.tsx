import * as React from 'react';
import type { ProxyNode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface NodeTableProps {
  nodes: ProxyNode[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  onSelectMany: (names: string[], append?: boolean) => void;
}

export function NodeTable({ nodes, selected, onToggle, onSelectMany }: NodeTableProps) {
  const [search, setSearch] = React.useState('');

  const filtered = React.useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return nodes;
    return nodes.filter((node) =>
      [node.name, node.server, node.type]
        .filter(Boolean)
        .some((value) => value!.toString().toLowerCase().includes(keyword))
    );
  }, [nodes, search]);

  const isAllSelected = filtered.length > 0 && filtered.every((node) => selected.has(node.name));
  const isEverythingSelected = nodes.length > 0 && nodes.every((node) => selected.has(node.name));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} nodes · {selected.size} selected
        </p>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:w-64"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onSelectMany(
                  nodes.map((node) => node.name),
                  !isEverythingSelected
                )
              }
              disabled={nodes.length === 0}
            >
              {isEverythingSelected ? 'Unselect all' : 'Select all'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectMany(Array.from(selected), false)}
              disabled={selected.size === 0}
            >
              Clear
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onSelectMany(
                filtered.map((node) => node.name),
                !isAllSelected
              )
            }
            disabled={filtered.length === 0}
          >
            {isAllSelected ? 'Unselect filtered' : 'Select filtered'}
          </Button>
        </div>
      </div>
      <div className="max-h-[360px] overflow-auto rounded-xl border border-border bg-secondary/30 scrollbar-thin">
        <table className="min-w-full divide-y divide-border/60 text-left text-sm">
          <thead className="bg-secondary/40">
            <tr>
              <th className="px-4 py-3 font-medium">Select</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Server</th>
              <th className="px-4 py-3 font-medium">Port</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((node) => {
              const isSelected = selected.has(node.name);
              return (
                <tr
                  key={node.name}
                  role="button"
                  tabIndex={0}
                  className={`cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-secondary/40'
                  }`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest('input,button,label')) return;
                    onToggle(node.name);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                      event.preventDefault();
                      onToggle(node.name);
                    }
                  }}
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-border"
                      checked={isSelected}
                      onChange={() => onToggle(node.name)}
                      onClick={(event) => event.stopPropagation()}
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
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No nodes match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
