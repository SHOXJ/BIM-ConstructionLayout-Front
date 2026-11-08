/* 模块一入口。TODO: IFC解析、工程量提取、工序映射、结果表格渲染。 */
(function (app) {
  app.modules.data = {
    init() {
      document.getElementById('model-file').addEventListener('change', (event) => {
        const file = event.target.files[0];
        const output = document.getElementById('file-status');
        app.state.file = null;
        if (!file) { output.textContent = '尚未选择文件'; return; }
        if (!/\.ifc$/i.test(file.name)) {
          event.target.value = '';
          output.textContent = '请选择 .ifc 文件；文件内容校验由后续解析模块完成。';
          return;
        }
        app.state.file = file;
        output.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB · 已选择，尚未解析或上传`;
      });
    },
    getOptions() {
      return { grouping: document.getElementById('grouping').value, unit: document.getElementById('quantity-unit').value };
    }
    // 后续：await app.api.convert(app.state.file, this.getOptions());
    // 将校验后的响应写入 app.state.constructionData，并渲染 #construction-data-body。
  };
})(window.BIMApp);
