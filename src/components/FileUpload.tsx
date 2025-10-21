import * as React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useTranslation } from '../lib/i18n';
import type { SavedConfig, UploadedConfigSource, WarningMessage } from '../types';

interface FileUploadProps {
  manualText: string;
  uploadedFiles: UploadedConfigSource[];
  savedConfigs: Array<Pick<SavedConfig, 'id' | 'name' | 'createdAt'>>;
  onManualChange: (value: string) => void;
  onFilesAdded: (files: { name: string; content: string }[]) => void;
  onRemoveFile: (id: string) => void;
  onClearManual: () => void;
  onClearFiles: () => void;
  onParse: () => void;
  onSaveConfig: (name: string) => void;
  onLoadConfig: (id: string) => void;
  onDeleteConfig: (id: string) => void;
  warnings: WarningMessage[];
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function FileUpload({
  manualText,
  uploadedFiles,
  savedConfigs,
  onManualChange,
  onFilesAdded,
  onRemoveFile,
  onClearManual,
  onClearFiles,
  onParse,
  onSaveConfig,
  onLoadConfig,
  onDeleteConfig,
  warnings
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [presetName, setPresetName] = React.useState('');
  const { t, language } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const readers = Array.from(files).map(async (file) => ({
      name: file.name,
      content: await readFileAsText(file)
    }));

    void Promise.all(readers)
      .then((loaded) => {
        onFilesAdded(loaded);
      })
      .catch((error) => {
        console.error('Failed to read file', error);
      })
      .finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleSavePreset = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = presetName.trim();
    if (!trimmed) {
      return;
    }
    onSaveConfig(trimmed);
    setPresetName('');
  };

  const hasSources = manualText.trim().length > 0 || uploadedFiles.length > 0;

  const locale = language === 'zh' ? 'zh-CN' : 'en-US';

  const formattedWarnings = React.useMemo(
    () =>
      warnings.map((warning, index) => {
        const prefixText = warning.prefixKey ? t(warning.prefixKey) : warning.prefix ?? '';
        const body = warning.key ? t(warning.key, warning.params) : warning.fallback ?? '';
        const text = prefixText ? `${prefixText}: ${body}` : body;
        return {
          id: `${index}-${prefixText}-${body}`,
          text: text || body || prefixText
        };
      }),
    [t, warnings]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="yaml-input">{t('fileUploadManualLabel')}</Label>
          <Textarea
            id="yaml-input"
            value={manualText}
            placeholder={t('fileUploadManualPlaceholder')}
            className="min-h-[200px] font-mono"
            onChange={(event) => onManualChange(event.target.value)}
          />
        </div>
        <div className="flex w-full flex-col gap-2 md:w-64">
          <Label htmlFor="yaml-file">{t('fileUploadUploadLabel')}</Label>
          <Input
            ref={fileInputRef}
            id="yaml-file"
            type="file"
            accept=".yaml,.yml,text/yaml,application/yaml"
            multiple
            onChange={handleFileChange}
          />
          <Button type="button" onClick={onParse} className="w-full">
            {t('fileUploadParseButton')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              onClearManual();
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            {t('fileUploadClearButton')}
          </Button>
          {uploadedFiles.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                onClearFiles();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              {t('fileUploadRemoveUploadsButton')}
            </Button>
          )}
        </div>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-4">
          <p className="text-sm font-semibold">{t('fileUploadUploadedFiles')}</p>
          <ul className="mt-2 space-y-2 text-sm">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-2">
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onRemoveFile(file.id)}>
                  {t('fileUploadRemoveFile')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
        <form className="flex flex-col gap-2 md:flex-row md:items-center" onSubmit={handleSavePreset}>
          <div className="flex-1 space-y-1">
            <Label htmlFor="preset-name">{t('fileUploadSaveSectionLabel')}</Label>
            <Input
              id="preset-name"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder={t('fileUploadSavePlaceholder')}
            />
          </div>
          <Button type="submit" disabled={!hasSources || presetName.trim().length === 0}>
            {t('fileUploadSaveButton')}
          </Button>
        </form>
        {savedConfigs.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {savedConfigs.map((config) => (
              <li key={config.id} className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={config.name}>
                    {config.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('fileUploadSavedAt', {
                      date: new Date(config.createdAt).toLocaleString(locale)
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" onClick={() => onLoadConfig(config.id)}>
                    {t('fileUploadLoadButton')}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteConfig(config.id)}>
                    {t('fileUploadDeleteButton')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t('fileUploadSavedHint')}</p>
        )}
      </div>
      {formattedWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-semibold text-amber-100">{t('fileUploadWarningsTitle')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {formattedWarnings.map((warning) => (
              <li key={warning.id}>{warning.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
