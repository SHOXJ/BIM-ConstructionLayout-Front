# BIM 施工方案规划与可视化前端

页面界面与提示文字使用英文；本 README、接口约定及源码中的模块注释使用中文。页面顶部显示英文项目标题 **BIM Construction Planning & Visualization**。

## 打开方式
解压整个文件夹，双击 [index.html](./index.html) 即可使用当前基础版本。无需安装依赖、无需联网。请保留目录结构；不能仅移动 HTML 文件。

后续接入后端时，通过 HTTP 服务打开网页。例如在本目录运行 `python -m http.server 8000`，访问 `http://localhost:8000`。前后端跨域时由服务端配置 CORS；不在前端放置服务端密钥。

## 架构与当前边界
页面包含顶部英文标题与导航、首页介绍、锚点目录和三个业务模块，使用深色背景与红色强调色。当前交付独立原生 HTML/CSS/JS 前端，不依赖 Vue、D3、Bootstrap JS 或远程图片资源。
CSS 负责样式、布局和状态过渡；JavaScript 负责事件、数据、播放控制与后端请求。源码已按模块换行，并用中文注释标出主要职责和后续接入点。CSS 不能独立解析 IFC 或计算施工计划。

已实现：响应式布局、目录定位与高亮、手机菜单、IFC 文件选择及文件名显示、英文月份的日期选择与参数输入、显式加载演示方案、方案选择、时间轴播放/暂停/重置/倍速、演示楼层状态联动。日期选择会校验每月天数，并以 `YYYY-MM-DD` 提供给方案参数。演示方案为三个固定选项，页面金额显示为示例性的 `× ¥10k`。

尚未实现：IFC 内容解析、真实工程量计算、工序映射、计划算法、方案优化、真实三维/4D 动画、甘特图与冲突分析。对应按钮禁用或容器标为待接入。文件选择不会上传；不会根据文件名生成虚假施工数据。演示方案与楼层是固定界面数据，参数输入不影响演示结果。

## 文件与模块清单
| 文件 | 职责 / 后续插入位置 |
| --- | --- |
| [index.html](./index.html) | 英文主页面、顶部标题、导航目录、三个业务模块与语义容器 |
| [style.css](./style.css) | 全局主题、导航、首页、通用表单、卡片、响应式布局 |
| [css/bim-data.css](./css/bim-data.css) | 模型导入、工程量与施工数据表格样式 |
| [css/planning.css](./css/planning.css) | 方案参数、候选方案、选中状态样式 |
| [css/visualization.css](./css/visualization.css) | 模型视窗、播放控件、时间轴与分析区样式 |
| [app.js](./app.js) | 页面初始化、导航、公共通知、概念模型绘制 |
| [js/config.js](./js/config.js) | 后端地址、接口路径、请求超时、共享状态 |
| [js/services/api.js](./js/services/api.js) | fetch 统一封装，转换/生成/分析接口适配器 |
| [js/modules/bim-data.js](./js/modules/bim-data.js) | 文件事件；扩展 IFC 解析、属性/工程量提取、任务映射 |
| [js/modules/planning.js](./js/modules/planning.js) | 方案输入与选择；扩展生成、评价、比较、确认 |
| [js/modules/visualization.js](./js/modules/visualization.js) | 示例播放控制；扩展三维渲染、任务构件绑定、进度分析 |
| [API_CONTRACT.md](./API_CONTRACT.md) | 建议数据格式、待实现接口、接入步骤 |

## 预计实现的功能
1. BIM数据到施工数据：IFC导入及模型预览；构件属性/楼层/分区提取；工程量统计；施工工序映射；校验与数据导出。
2. 施工方案生成与方案选择：日期、目标工期、资源与空间约束；规则/优化算法/模型生成；候选方案列表；工期、成本、资源等指标比较；方案确认与保存。
3. 施工方案可视化分析：模型与计划绑定；施工状态着色；时间轴与动画播放；任务甘特图；资源/空间占用；计划实际对比；冲突提示与结果导出。

## DOM挂载点与联动
- `#construction-data-body`：构件/施工任务表体。后端字符串使用 textContent 插入，避免直接拼接 HTML。
- `#scheme-list`：方案列表；`#selected-scheme`：方案选择反馈。
- `#model-viewer`：将示例楼层替换为真实模型渲染容器；保留外部播放控件。
- `#gantt-container`：甘特图挂载点。
- `BIMApp.state`：file、constructionData、schemes、selectedScheme，仅驻留当前页面内存，刷新后清空。
- `bim:scheme-selected`：document 上分发的 CustomEvent，detail 为方案对象。
- `bim:time-changed`：detail 为 `{progress, schemeId, isDemo}`，当前仅用于演示。
- 模块初始化在 app.js 中执行；新增模块应先在 HTML 中用 defer 引入，再注册初始化函数。

## 简单验收
打开页面，检查顶部标题和三个导航入口。选择 IFC 文件，确认仅显示文件信息。

点击 **Load Demo Plans**，选择 **Plan B · Balanced**，确认分析工期显示为 **120 days (demo)**。测试播放、暂停、拖动、倍速与重置；切换方案时进度应归零。

缩窄窗口后使用菜单按钮进入各模块。真实解析与生成按钮应保持禁用。
