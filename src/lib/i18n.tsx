import * as React from 'react';

export type Language = 'en' | 'zh';

const LOCALE_STORAGE_KEY = 'ccg:locale';

const translations = {
  en: {
    appTitle: 'Clash Configuration Generator',
    appSubtitle:
      'Parse your Clash configuration, craft load-balanced pools, and export a ready-to-run Clash.Meta config.',
    languageLabel: 'Language',
    languageEnglish: 'English',
    languageChinese: '简体中文',
    manualSourceLabel: 'Pasted YAML',
    parseNoSourcesWarning: 'Please provide YAML content first.',
    parseNoProxiesWarning: 'No proxies were found across the provided configurations.',
    nodesCardTitle: 'Nodes',
    runtimeSettingsCardTitle: 'Runtime Settings',
    controllerPortLabel: 'Controller Port',
    secretLabel: 'Secret',
    secretPlaceholder: 'Optional secret',
    proxyExportLabel: 'Proxy Export',
    proxyExportAll: 'Include all proxies',
    proxyExportSelected: 'Only selected proxies',
    proxyExportHelp: 'Choose whether to export every proxy or just the ones currently selected above.',
    allowLanLabel: 'Allow LAN',
    allowLanHelp: 'Expose the proxy to your local network.',
    toggleOn: 'On',
    toggleOff: 'Off',
    logLevelLabel: 'Log Level',
    logLevelInfo: 'info',
    logLevelWarning: 'warning',
    logLevelError: 'error',
    logLevelDebug: 'debug',
    fileUploadManualLabel: 'Paste Clash YAML',
    fileUploadManualPlaceholder: 'Paste your subscription or exported config.yaml here...',
    fileUploadUploadLabel: 'or Upload File',
    fileUploadParseButton: 'Parse YAML',
    fileUploadClearButton: 'Clear',
    fileUploadRemoveUploadsButton: 'Remove uploaded files',
    fileUploadUploadedFiles: 'Uploaded Files',
    fileUploadRemoveFile: 'Remove',
    fileUploadSaveSectionLabel: 'Save current sources',
    fileUploadSavePlaceholder: 'Give this configuration a name',
    fileUploadSaveButton: 'Save',
    fileUploadSavedAt: 'Saved {date}',
    fileUploadLoadButton: 'Load',
    fileUploadDeleteButton: 'Delete',
    fileUploadSavedHint: 'Saved configurations will appear here for quick reuse.',
    fileUploadWarningsTitle: 'Warnings',
    nodeTableSummary: '{filtered} nodes · {selected} selected',
    nodeTableSearchPlaceholder: 'Search nodes...',
    nodeTableSelectAll: 'Select all',
    nodeTableSelectFiltered: 'Select filtered',
    nodeTableUnselectFiltered: 'Unselect filtered',
    nodeTableClearSelection: 'Clear selection',
    nodeTableToggleFilteredAria: 'Toggle selection for filtered nodes',
    nodeTableName: 'Name',
    nodeTableType: 'Type',
    nodeTableServer: 'Server',
    nodeTablePort: 'Port',
    nodeTableNoResults: 'No nodes match your search.',
    poolEditorTitle: 'Proxy Pools',
    poolEditorSubtitle: 'Create pools and assign nodes from your current selection.',
    poolDefaultName: 'Pool {index}',
    poolEditorAddEmpty: 'Add an empty pool',
    poolEditorAddPerSelection: 'Create a pool for each selected proxy',
    poolEditorAddFromSelection: 'Add from selection',
    poolEditorAddPool: 'Add Pool',
    poolEditorEmptyState: 'No pools yet. Create one and assign nodes using the checkbox selection above.',
    poolEditorUnnamed: 'Unnamed Pool',
    poolEditorClearNodes: 'Clear nodes',
    poolEditorRemovePool: 'Remove',
    poolEditorNameLabel: 'Name',
    poolEditorNamePlaceholder: 'Pool name',
    poolEditorStrategyLabel: 'Strategy',
    poolEditorPortLabel: 'Listener Port',
    poolEditorNodesLabel: 'Nodes',
    poolEditorAssignSelected: 'Assign selected ({count})',
    poolEditorRemoveSelected: 'Remove selected',
    poolEditorNoNodes: 'No nodes assigned yet.',
    poolEditorRemoveProxyAria: 'Remove {name}',
    configPreviewTitle: 'Generated config.yaml',
    configPreviewSubtitle: 'Preview the output before downloading.',
    configPreviewCopy: 'Copy YAML',
    configPreviewGenerate: '⚙️ Generate config.yaml',
    configPreviewEmpty: 'Generate a configuration to preview it here.',
    parserYamlNotObject: 'YAML did not produce an object.',
    parserNoProxiesFound: 'No proxies were found in the provided configuration.',
    parserUnknownError: 'Unknown parsing error',
    parserProviderNoInline:
      'Provider "{name}" has no inline proxies. Remote providers are not imported.'
  },
  zh: {
    appTitle: 'Clash 配置生成器',
    appSubtitle: '解析你的 Clash 配置，构建负载均衡池，并导出可直接运行的 Clash.Meta 配置。',
    languageLabel: '语言',
    languageEnglish: 'English',
    languageChinese: '简体中文',
    manualSourceLabel: '粘贴的 YAML',
    parseNoSourcesWarning: '请先提供 YAML 内容。',
    parseNoProxiesWarning: '在所有提供的配置中未找到任何代理。',
    nodesCardTitle: '节点',
    runtimeSettingsCardTitle: '运行时设置',
    controllerPortLabel: '控制端口',
    secretLabel: '密钥',
    secretPlaceholder: '可选密钥',
    proxyExportLabel: '代理导出',
    proxyExportAll: '导出全部代理',
    proxyExportSelected: '仅导出已选择的代理',
    proxyExportHelp: '选择导出全部代理还是仅导出上方当前选中的代理。',
    allowLanLabel: '允许局域网访问',
    allowLanHelp: '将代理开放给你的局域网设备。',
    toggleOn: '开启',
    toggleOff: '关闭',
    logLevelLabel: '日志等级',
    logLevelInfo: '信息',
    logLevelWarning: '警告',
    logLevelError: '错误',
    logLevelDebug: '调试',
    fileUploadManualLabel: '粘贴 Clash YAML',
    fileUploadManualPlaceholder: '在此粘贴你的订阅或导出的 config.yaml……',
    fileUploadUploadLabel: '或上传文件',
    fileUploadParseButton: '解析 YAML',
    fileUploadClearButton: '清空',
    fileUploadRemoveUploadsButton: '移除已上传的文件',
    fileUploadUploadedFiles: '已上传的文件',
    fileUploadRemoveFile: '移除',
    fileUploadSaveSectionLabel: '保存当前来源',
    fileUploadSavePlaceholder: '为该配置取一个名字',
    fileUploadSaveButton: '保存',
    fileUploadSavedAt: '保存于 {date}',
    fileUploadLoadButton: '加载',
    fileUploadDeleteButton: '删除',
    fileUploadSavedHint: '已保存的配置会显示在这里，方便快速复用。',
    fileUploadWarningsTitle: '警告',
    nodeTableSummary: '{filtered} 个节点 · 已选择 {selected} 个',
    nodeTableSearchPlaceholder: '搜索节点…',
    nodeTableSelectAll: '选择全部',
    nodeTableSelectFiltered: '选择筛选结果',
    nodeTableUnselectFiltered: '取消筛选结果',
    nodeTableClearSelection: '清空选择',
    nodeTableToggleFilteredAria: '切换筛选节点的选择状态',
    nodeTableName: '名称',
    nodeTableType: '类型',
    nodeTableServer: '服务器',
    nodeTablePort: '端口',
    nodeTableNoResults: '没有节点符合你的搜索条件。',
    poolEditorTitle: '代理池',
    poolEditorSubtitle: '创建代理池并从当前选择中分配节点。',
    poolDefaultName: '代理池 {index}',
    poolEditorAddEmpty: '添加一个空的代理池',
    poolEditorAddPerSelection: '为每个已选代理创建一个代理池',
    poolEditorAddFromSelection: '按选择添加',
    poolEditorAddPool: '添加代理池',
    poolEditorEmptyState: '还没有代理池。创建一个并通过上方的复选框分配节点。',
    poolEditorUnnamed: '未命名的代理池',
    poolEditorClearNodes: '清空节点',
    poolEditorRemovePool: '移除',
    poolEditorNameLabel: '名称',
    poolEditorNamePlaceholder: '代理池名称',
    poolEditorStrategyLabel: '策略',
    poolEditorPortLabel: '监听端口',
    poolEditorNodesLabel: '节点',
    poolEditorAssignSelected: '分配已选（{count}）',
    poolEditorRemoveSelected: '移除已选',
    poolEditorNoNodes: '尚未分配节点。',
    poolEditorRemoveProxyAria: '移除 {name}',
    configPreviewTitle: '生成的 config.yaml',
    configPreviewSubtitle: '在下载前预览导出的内容。',
    configPreviewCopy: '复制 YAML',
    configPreviewGenerate: '⚙️ 生成 config.yaml',
    configPreviewEmpty: '生成配置后会在此处显示预览。',
    parserYamlNotObject: 'YAML 内容没有解析为对象。',
    parserNoProxiesFound: '在该配置中没有找到任何代理。',
    parserUnknownError: '未知的解析错误。',
    parserProviderNoInline: '提供者“{name}”没有内联代理。不会导入远程提供者。'
  }
} as const;

export type TranslationKey = keyof (typeof translations)['en'];

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = React.createContext<I18nContextValue>({
  language: 'en',
  setLanguage: () => undefined,
  t: (key) => translations.en[key]
});

function format(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, token) => {
    const value = params[token];
    return value === undefined || value === null ? '' : String(value);
  });
}

function resolveInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }
  const navigatorLanguage = window.navigator.language.toLowerCase();
  if (navigatorLanguage.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [language, setLanguageState] = React.useState<Language>(() => resolveInitialLanguage());

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  }, []);

  const value = React.useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key, params) => {
        const template = translations[language]?.[key] ?? translations.en[key];
        return format(template, params);
      }
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  return React.useContext(I18nContext);
}
