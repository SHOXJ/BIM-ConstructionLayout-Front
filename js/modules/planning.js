/* 模块二入口。演示数据与真实生成结果分离，禁止把演示值当作计算结果。 */
(function (app) {
  // 固定演示方案只用于体验选择和动画，不参与真实决策。
  const examples = [
    {
      id: 'demo-a',
      name: 'Plan A · Fast Track',
      duration: 100,
      cost: 120,
      description: 'More parallel work · UI demo only',
      isDemo: true
    },
    {
      id: 'demo-b',
      name: 'Plan B · Balanced',
      duration: 120,
      cost: 100,
      description: 'Phased construction · UI demo only',
      isDemo: true
    },
    {
      id: 'demo-c',
      name: 'Plan C · Lower Cost',
      duration: 150,
      cost: 90,
      description: 'Sequential work · UI demo only',
      isDemo: true
    }
  ];

  // 英文月份与日期下拉框写入 ISO 日期，供现有方案参数读取。
  function initDateSelector() {
    const month = document.getElementById('start-month');
    const day = document.getElementById('start-day');
    const year = document.getElementById('start-year');
    const date = document.getElementById('start-date');

    function validYear() {
      const value = Number(year.value);
      return year.value !== '' && Number.isInteger(value) && value >= 1900 && value <= 2100;
    }

    function syncDate() {
      date.value = month.value && day.value && validYear()
        ? `${Number(year.value)}-${month.value}-${day.value}`
        : '';
    }

    function refreshDays() {
      const selectedDay = day.value;
      const daysInMonth = month.value
        ? new Date(validYear() ? Number(year.value) : 2000, Number(month.value), 0).getDate()
        : 31;

      day.replaceChildren(new Option('Day', ''));
      for (let number = 1; number <= daysInMonth; number++) {
        const value = String(number).padStart(2, '0');
        day.add(new Option(String(number), value));
      }
      day.value = Number(selectedDay) <= daysInMonth ? selectedDay : '';
      syncDate();
    }

    month.addEventListener('change', refreshDays);
    year.addEventListener('input', refreshDays);
    day.addEventListener('change', syncDate);
    refreshDays();
  }

  app.modules.planning = {
    // 加载演示数据并渲染可选方案卡片。
    init() {
      initDateSelector();
      document.getElementById('load-demo').addEventListener('click', () => {
        app.state.schemes = examples.map(item => ({ ...item }));
        const list = document.getElementById('scheme-list');
        list.replaceChildren();
        list.setAttribute('role', 'radiogroup');
        list.setAttribute('aria-label', 'Demo construction plans');
        for (const scheme of app.state.schemes) {
          const label = document.createElement('label');
          label.className = 'scheme-card';
          // 此模板仅使用本文件定义的常量；接入外部数据时必须用 textContent。
          label.innerHTML = `
            <input type="radio" name="scheme" value="${scheme.id}">
            <span class="scheme-info">
              <span class="scheme-name">${scheme.name}</span>
              <span class="scheme-description">${scheme.description}</span>
              <span class="scheme-metrics">
                <span><b>${scheme.duration}</b> days</span>
                <span><b>${scheme.cost}</b> × ¥10k (demo)</span>
              </span>
            </span>
          `;
          label.querySelector('input').addEventListener('change', () => this.select(scheme.id));
          list.append(label);
        }
        if (app.state.selectedScheme) {
          this.select(app.state.selectedScheme.id);
        }
        app.notify('Demo plans loaded. Select a plan to continue.');
      });
    },
    // 预留真实方案生成时的表单参数读取。
    getParameters() {
      return {
        startDate: document.getElementById('start-date').value || null,
        targetDays: document.getElementById('target-days').value ? Number(document.getElementById('target-days').value) : null,
        priority: document.getElementById('priority').value,
        constraints: document.getElementById('constraints').value.trim()
      };
    },
    // 更新选中状态，并通知可视化模块。
    select(id) {
      const scheme = app.state.schemes.find(item => item.id === id);
      if (!scheme) {
        return;
      }

      app.state.selectedScheme = scheme;
      document.querySelectorAll('.scheme-card').forEach(card => {
        const radio = card.querySelector('input');
        radio.checked = radio.value === id;
        card.classList.toggle('selected', radio.checked);
      });
      document.getElementById('selected-scheme').textContent = `Selected: ${scheme.name} (demo)`;
      document.dispatchEvent(new CustomEvent('bim:scheme-selected', { detail: scheme }));
    }
    // 后续：校验必填项与正整数工期，再调用 app.api.generate({ constructionData, ...this.getParameters() })。
  };
})(window.BIMApp);
