# Clash Configuration Generator

A zero-backend Clash.Meta configuration generator built with React, TypeScript, Tailwind CSS, and Vite for Cloudflare Pages. Paste or upload your Clash YAML, curate custom load-balanced proxy pools, and export a ready-to-run `config.yaml` without leaving your browser.

## ✨ Features

- **Inline YAML parsing** using [`js-yaml`](https://github.com/nodeca/js-yaml) – no server required.
- **Automatic node discovery** from `proxies` and inline `proxy-providers` blocks with duplicate name filtering.
- **Interactive pool builder** with multi-select node assignment and strategy/port controls.
- **Live config preview** with syntax highlighting, plus one-click copy and download actions.
- **Local persistence** of runtime settings and pools via `localStorage`.
- **Dark shadcn-inspired UI** powered by Tailwind CSS.

## 🧱 Project Structure

```
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src
    ├── App.tsx
    ├── components
    │   ├── ConfigPreview.tsx
    │   ├── FileUpload.tsx
    │   ├── NodeTable.tsx
    │   ├── PoolEditor.tsx
    │   └── ui
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── select.tsx
    │       └── textarea.tsx
    ├── index.css
    ├── lib
    │   ├── cn.ts
    │   ├── parser.ts
    │   └── utils.ts
    ├── main.tsx
    └── types.ts
```

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Vite will expose a local dev server (default `http://localhost:5173`).

3. **Build for production / Cloudflare Pages**

   ```bash
   npm run build
   ```

   Deploy the generated `dist/` folder to Cloudflare Pages. No extra configuration is necessary.

## 🛠️ Usage Tips

1. Upload or paste an existing Clash configuration YAML.
2. Select the nodes you want to combine into pools.
3. Create pools, assign nodes, and adjust strategies/ports.
4. Configure controller port, secret, and log level.
5. Copy or download the generated `config.yaml` for Clash.Meta (mihomo).

## 📄 License

MIT © 2024
