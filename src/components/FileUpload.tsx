import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface FileUploadProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  warnings: string[];
}

export function FileUpload({ value, onChange, onParse, warnings }: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      onChange(text);
      onParse();
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="yaml-input">Paste Clash YAML</Label>
          <Textarea
            id="yaml-input"
            value={value}
            placeholder="Paste your subscription or exported config.yaml here..."
            className="min-h-[200px] font-mono"
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2 md:w-64">
          <Label htmlFor="yaml-file">or Upload File</Label>
          <Input
            ref={fileInputRef}
            id="yaml-file"
            type="file"
            accept=".yaml,.yml,text/yaml,application/yaml"
            onChange={handleFileChange}
          />
          <Button type="button" onClick={onParse} className="w-full">
            Parse YAML
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              onChange('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Clear
          </Button>
        </div>
      </div>
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-semibold text-amber-100">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
