# 后续接口接入约定（建议稿，当前没有后端服务）

本文说明预留的转换、方案生成和分析接口。页面目前只显示英文演示数据；以下接口和响应均为后续集成建议，不能视为已实现功能。

## 接入顺序

1. 实现下列接口，或修改 [js/config.js](./js/config.js) 内路径以匹配实际后端。
2. 设置 apiBaseUrl；将 apiEnabled 改为 true。该开关只允许请求，不会自动启用按钮或实现流程。
3. 在业务模块中绑定转换/生成按钮，增加必填项与数值校验、请求中禁用、成功渲染及错误提示；成功接入后再移除 HTML 中 disabled 属性。
4. 对服务端响应执行 schema/类型校验。将真实数据写入共享状态并更新页面统计、列表和表格。
5. 为真实方案定义任务与模型构件绑定，在 [js/modules/visualization.js](./js/modules/visualization.js) 中增加真实方案分支；必须移除演示标签并按真实任务状态渲染，不能直接将示例楼层动画用于真实模型。

## 预留接口
| 方法 | 默认路径 | 请求 | 建议响应 |
| --- | --- | --- | --- |
| POST | /api/bim/convert | FormData：file(IFC)、options(JSON字符串，grouping与unit) | modelId、components、tasks |
| POST | /api/schemes/generate | JSON：modelId、startDate、targetDays、priority、constraints | schemes数组 |
| POST | /api/schemes/analyze | JSON：modelId、schemeId | metrics、resourceSeries、conflicts |

上述地址都是建议的占位接口，并非已存在的服务。现有 [js/services/api.js](./js/services/api.js) 按同步 JSON 响应设计；大模型或大 IFC 耗时任务建议后续另加 jobId 与轮询或推送接口。

## 建议对象
```json
{
  "modelId": "model-001",
  "components": [
    {
      "id": "ifc-guid-001",
      "storey": "1F",
      "zone": "A",
      "type": "IfcWall",
      "quantity": 10,
      "unit": "m3",
      "taskId": "task-001"
    }
  ],
  "tasks": [
    {
      "id": "task-001",
      "name": "Level 1 wall construction",
      "componentIds": ["ifc-guid-001"],
      "predecessors": [],
      "durationDays": 5
    }
  ]
}
```
```json
{
  "schemes": [
    {
      "id": "scheme-001",
      "name": "Plan A",
      "duration": 120,
      "cost": 100,
      "costUnit": "10k CNY",
      "isDemo": false,
      "tasks": [
        {
          "id": "task-001",
          "startDay": 0,
          "endDay": 5,
          "componentIds": ["ifc-guid-001"]
        }
      ]
    }
  ]
}
```
以上数字仅解释字段格式。任务时间为相对计划开始日期的天数，区间建议采用 `[startDay, endDay)`。

真实工程量与单位以模型及计算规则为准，不应直接相加不同单位的数值。成本、工期与完成比例计算口径须由业务层确定。示例中的 `costUnit` 与页面演示卡片的 `× ¥10k` 对应，仅用于说明展示单位。

## 业务集成建议
- data模块：校验文件 -> 调用 api.convert -> 校验响应 -> state.constructionData -> 表格与统计。
- planning模块：检查施工数据与约束 -> api.generate -> 渲染真实方案 -> 选择方案 -> 分发 bim:scheme-selected。
- visualization模块：按方案任务与IFC GUID关联构件；拖动时间轴时计算未开始、进行中、已完成状态。真实时间轴和分析指标须替换演示百分比逻辑。
- API错误通过 try/catch 显示在相应模块，不把错误当作空方案。长任务需加入取消和重复提交保护。
- 真实模型加载器（例如基于 WebGL 的 IFC 查看器）与甘特图库可各自放入新的模块文件，并在 [index.html](./index.html) 中显式引入。
