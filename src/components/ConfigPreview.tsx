import * as React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from './ui/button';

interface ConfigPreviewProps {
  yaml: string;
  onCopy: () => void;
  onDownload: () => void;
  disabled?: boolean;
}

export function ConfigPreview({ yaml, onCopy, onDownload, disabled }: ConfigPreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Generated config.yaml</h2>
          <p className="text-sm text-muted-foreground">Preview the output before downloading.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCopy} disabled={disabled}>
            Copy YAML
          </Button>
          <Button type="button" onClick={onDownload} disabled={disabled}>
            ⚙️ Generate config.yaml
          </Button>
        </div>
      </div>
      <div className="max-h-[420px] overflow-auto rounded-xl border border-border/70 bg-secondary/30">
        {yaml ? (
          <SyntaxHighlighter
            language="yaml"
            style={oneDark as unknown as Record<string, React.CSSProperties>}
            customStyle={{ background: 'transparent', margin: 0, padding: '1.5rem' }}
          >
            {yaml}
          </SyntaxHighlighter>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">Generate a configuration to preview it here.</div>
        )}
      </div>
    </div>
  );
}
