/* 统一后端请求适配器；模块无需重复编写 fetch 和异常处理。当前不自动发起请求。 */
(function (app) {
  app.api = {
    // 统一处理接口开关、超时、取消与 JSON 响应。
    async request(path, { method = 'POST', body, signal } = {}) {
      if (!app.config.apiEnabled) {
        throw new Error('The backend service is not enabled yet. Connect the API first.');
      }

      const controller = new AbortController();
      const abort = () => controller.abort();
      if (signal?.aborted) {
        abort();
      } else {
        signal?.addEventListener('abort', abort, { once: true });
      }
      const timer = setTimeout(abort, app.config.timeoutMs);

      try {
        const isForm = body instanceof FormData;
        const response = await fetch(app.config.apiBaseUrl.replace(/\/$/, '') + path, {
          method,
          signal: controller.signal,
          headers: isForm ? {} : { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : isForm ? body : JSON.stringify(body)
        });
        if (!response.ok) {
          throw new Error(`Service request failed (HTTP ${response.status}).`);
        }
        if (response.status === 204) {
          return null;
        }
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
    // 以下两个 JSON 接口尚未接入页面按钮。
    generate(payload) {
      return this.request(app.config.endpoints.generate, { body: payload });
    },
    analyze(payload) {
      return this.request(app.config.endpoints.analysis, { body: payload });
    }
  };
})(window.BIMApp);
