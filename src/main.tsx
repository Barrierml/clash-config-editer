import React from 'react';
import ReactDOM from 'react-dom/client';
import ConfigGeneratorApp from './App';
import { I18nProvider } from './lib/i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <ConfigGeneratorApp />
    </I18nProvider>
  </React.StrictMode>
);
