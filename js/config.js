/* 后端接入统一配置。默认关闭真实请求；密钥不应写入前端。 */
window.BIMApp = {
  config: {
    apiEnabled: false,
    apiBaseUrl: '/api',
    timeoutMs: 30000,
    endpoints: { convert: '/bim/convert', generate: '/schemes/generate', analysis: '/schemes/analyze' }
  },
  state: { file: null, constructionData: null, schemes: [], selectedScheme: null },
  modules: {}
};
