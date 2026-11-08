/* 统一后端请求适配器；模块无需重复编写 fetch 和异常处理。当前不自动发起请求。 */
(function (app) {
  app.api = {
    async request(path, { method = 'POST', body, signal } = {}) {
      if (!app.config.apiEnabled) throw new Error('后端服务尚未启用，请先完成接口接入。');
      const controller = new AbortController();
      const abort = () => controller.abort();
      if (signal?.aborted) abort();
      else signal?.addEventListener('abort', abort, { once: true });
      const timer = setTimeout(abort, app.config.timeoutMs);
      try {
        const isForm = body instanceof FormData;
        const response = await fetch(app.config.apiBaseUrl.replace(/\/$/, '') + path, {
          method, signal: controller.signal,
          headers: isForm ? {} : { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : isForm ? body : JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`服务请求失败（HTTP ${response.status}）`);
        if (response.status === 204) return null;
        return await response.json();
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
      }
    },
    // 文件及分组、单位参数以 multipart/form-data 传送。调用由后续转换按钮接入。
    convert(file, options = {}) {
      const body = new FormData();
      body.append('file', file);
      body.append('options', JSON.stringify(options));
      return this.request(app.config.endpoints.convert, { body });
    },
    generate(payload) { return this.request(app.config.endpoints.generate, { body: payload }); },
    analyze(payload) { return this.request(app.config.endpoints.analysis, { body: payload }); }
  };
})(window.BIMApp);
