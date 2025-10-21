# Clash Configuration Generator 使用手册 / User Guide

## 快速开始 / Quick Start
1. **准备 YAML 配置 / Prepare YAML Config**  
   在您的电脑上找到需要解析的 Clash/Clash.Meta 配置文件，并复制其中的 YAML 文本。
2. **上传或粘贴配置 / Upload or Paste**
   打开应用后，在页面顶部的 *YAML Input* 区域中粘贴文本，或直接拖拽一个或多个配置文件到上传框。
3. **解析配置 / Parse Config**
   点击 **Parse YAML** 按钮。应用会读取所有代理节点，并在左侧的 *Nodes* 表格中展示它们。

## 节点管理 / Managing Nodes
- **搜索 / Search**：使用表格上方的搜索栏，通过名称、服务器或类型筛选节点。
- **多选 / Multi-select**：勾选每一行左侧的复选框即可选择节点；使用“Select all / Select filtered”按钮可以快速批量选择或取消选择。
- **性能提示 / Performance Tip**：列表支持快速滚动与选择，大批量节点也能保持流畅体验。

## 创建代理池 / Creating Proxy Pools
1. **新建 / Create**：在 *Proxy Pools* 区域选择创建模式，点击 **Add Pool** 或 **Add from selection**。
2. **配置 / Configure**：为每个池设置名称、策略（round-robin / consistent-hashing / sticky-sessions）以及监听端口。
3. **分配节点 / Assign Nodes**：使用 **Assign selected** 将当前选中的节点加入池中；如需移除，请使用 **Remove selected** 或直接点击徽章上的“×”。

## 运行时设置 / Runtime Settings
- **Controller Port**：设置控制端口，默认 9090。
- **Secret**：可选，用于 API 访问控制。
- **Proxy Export**：选择导出全部节点或仅导出当前选中节点。
- **Allow LAN**：切换是否允许局域网访问。
- **Log Level**：在 info、warning、error、debug 之间选择日志级别。

## 导出配置 / Exporting the Config
1. **预览 / Preview**：在页面底部的 *Generated YAML* 区域查看生成的配置。
2. **复制 / Copy**：点击 **Copy YAML** 将结果复制到剪贴板。
3. **下载 / Download**：点击 **Download config.yaml** 保存文件。

## 浏览器预设 / Saved Presets
- **保存来源 / Save Sources**：在 *Save current sources* 区域输入名称并点击 **Save**，即可将当前的粘贴内容与上传文件组合保存到浏览器。
- **加载 / Load**：使用 **Load** 按钮快速恢复之前保存的来源，并立即重新解析所有节点。
- **删除 / Delete**：若某个预设不再需要，可点击 **Delete** 将其移除。

## 常见问题 / FAQ
- **解析失败 / Parsing Errors**：请确认原始 YAML 无语法错误，必要时先使用外部工具校验。
- **端口冲突 / Port Conflicts**：应用会自动寻找未占用的端口，如需手动调整，可在池设置中修改。
- **数据持久化 / Persistence**：浏览器会保存最近的池与设置，重新打开页面即可继续上次编辑。

祝使用愉快！ / Enjoy your optimized workflow!
