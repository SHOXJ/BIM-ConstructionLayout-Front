/* 模块二入口。演示数据与真实生成结果分离，禁止把演示值当作计算结果。 */
(function (app) {
  const examples = [
    { id: 'demo-a', name: '方案 A · 工期优先', duration: 100, cost: 120, description: '增加并行作业 · 仅用于界面示例', isDemo: true },
    { id: 'demo-b', name: '方案 B · 综合平衡', duration: 120, cost: 100, description: '分区流水施工 · 仅用于界面示例', isDemo: true },
    { id: 'demo-c', name: '方案 C · 成本优先', duration: 150, cost: 90, description: '顺序组织作业 · 仅用于界面示例', isDemo: true }
  ];
  app.modules.planning = {
    init() {
      document.getElementById('load-demo').addEventListener('click', () => {
        app.state.schemes = examples.map(item => ({ ...item }));
        const list = document.getElementById('scheme-list');
        list.replaceChildren();
        list.setAttribute('role', 'radiogroup');
        list.setAttribute('aria-label', '示例候选方案');
        for (const scheme of app.state.schemes) {
          const label = document.createElement('label');
          label.className = 'scheme-card';
          // 此模板仅使用本文件定义的常量；接入外部数据时必须用 textContent。
          label.innerHTML = `<input type="radio" name="scheme" value="${scheme.id}"><span class="scheme-info"><span class="scheme-name">${scheme.name}</span><span class="scheme-description">${scheme.description}</span><span class="scheme-metrics"><span><b>${scheme.duration}</b>天</span><span><b>${scheme.cost}</b>万元（示例）</span></span></span>`;
          label.querySelector('input').addEventListener('change', () => this.select(scheme.id));
          list.append(label);
        }
        if (app.state.selectedScheme) this.select(app.state.selectedScheme.id);
        app.notify('示例已加载，请选择一个方案。');
      });
    },
    getParameters() {
      return {
        startDate: document.getElementById('start-date').value || null,
        targetDays: document.getElementById('target-days').value ? Number(document.getElementById('target-days').value) : null,
        priority: document.getElementById('priority').value,
        constraints: document.getElementById('constraints').value.trim()
      };
    },
    select(id) {
      const scheme = app.state.schemes.find(item => item.id === id);
      if (!scheme) return;
      app.state.selectedScheme = scheme;
      document.querySelectorAll('.scheme-card').forEach(card => {
        const radio = card.querySelector('input');
        radio.checked = radio.value === id;
        card.classList.toggle('selected', radio.checked);
      });
      document.getElementById('selected-scheme').textContent = `已选：${scheme.name}（示例）`;
      document.dispatchEvent(new CustomEvent('bim:scheme-selected', { detail: scheme }));
    }
    // 后续：校验必填项与正整数工期，再调用 app.api.generate({ constructionData, ...this.getParameters() })。
  };
})(window.BIMApp);
