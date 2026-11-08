/* 模块一入口。TODO: IFC解析、工程量提取、工序映射、结果表格渲染。 */
(function (app) {
  // 当前只记录所选文件；真实 IFC 内容解析在后续服务接入时实现。
  app.modules.data = {
    init() {
      document.getElementById('model-file').addEventListener('change', (event) => {
        const file = event.target.files[0];
        const output = document.getElementById('file-status');
        app.state.file = null;

        if (!file) {
          output.textContent = 'No file selected';
          return;
        }

        // 文件扩展名仅用于界面初筛，不代表已完成内容校验。
        if (!/\.ifc$/i.test(file.name)) {
          event.target.value = '';
          output.textContent = 'Please select an .ifc file. Content validation will be available when the parser is connected.';
          return;
        }
        app.state.file = file;
        output.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB · selected, not parsed or uploaded`;
      });
    },
    getOptions() {
      // 保持字段名与转换接口的 options 对象一致。
      return {
        grouping: document.getElementById('grouping').value,
        unit: document.getElementById('quantity-unit').value
      };
    }
    // 后续：await app.api.convert(app.state.file, this.getOptions());
    // 将校验后的响应写入 app.state.constructionData，并渲染 #construction-data-body。
  };
})(window.BIMApp);
