/* 模块三入口。后续在 #model-viewer 挂载真实渲染器，按任务与构件ID更新模型。 */
(function (app) {
  // 播放状态仅作用于固定演示方案。
  let progress = 0;
  let playing = false;
  let frame = 0;
  let previous = null;
  let scheme = null;

  function pause() {
    playing = false;
    cancelAnimationFrame(frame);
    previous = null;
    document.getElementById('play').textContent = 'Play';
  }

  // 根据进度更新文字和示例楼层颜色。
  function render() {
    document.getElementById('timeline').value = progress;
    document.getElementById('time-label').textContent = `Day ${Math.round(progress / 100 * scheme.duration)} of ${scheme.duration} · Demo`;
    document.getElementById('analysis-progress').textContent = `${Math.round(progress)}%`;
    document.querySelectorAll('.demo-floor').forEach(floor => {
      const end = Number(floor.dataset.floor) * 25;
      floor.classList.toggle('complete', progress >= end);
      floor.classList.toggle('in-progress', progress > end - 25 && progress < end);
    });
    // 可由真实渲染器监听此事件；当前进度只对应演示楼层。
    document.dispatchEvent(new CustomEvent('bim:time-changed', {
      detail: { progress, schemeId: scheme.id, isDemo: true }
    }));
  }

  // requestAnimationFrame 驱动演示进度；speed 控件调整播放速率。
  function tick(time) {
    if (!playing) {
      return;
    }
    if (previous !== null) {
      progress = Math.min(
        100,
        progress + Math.min(time - previous, 100) / 200 * Number(document.getElementById('speed').value)
      );
    }
    previous = time;
    render();
    if (progress >= 100) {
      pause();
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  app.modules.visualization = {
    init() {
      // 选中方案后显示演示模型，并重置时间轴。
      document.addEventListener('bim:scheme-selected', ({ detail }) => {
        pause();
        scheme = detail;
        progress = 0;
        document.getElementById('viewer-empty').hidden = true;
        document.getElementById('demo-building').hidden = false;
        ['play', 'reset', 'timeline', 'speed'].forEach(id => {
          document.getElementById(id).disabled = false;
        });
        document.getElementById('viewer-label').textContent = 'Demo animation / not a real model';
        document.getElementById('analysis-name').textContent = scheme.name;
        document.getElementById('analysis-duration').textContent = `${scheme.duration} days (demo)`;
        render();
      });

      // 播放、重置和拖动时间轴共用同一进度状态。
      document.getElementById('play').addEventListener('click', () => {
        if (!scheme) {
          return;
        }
        if (playing) {
          pause();
          return;
        }
        if (progress >= 100) {
          progress = 0;
        }
        playing = true;
        previous = null;
        document.getElementById('play').textContent = 'Pause';
        frame = requestAnimationFrame(tick);
      });

      document.getElementById('reset').addEventListener('click', () => {
        if (scheme) {
          pause();
          progress = 0;
          render();
        }
      });

      document.getElementById('timeline').addEventListener('input', event => {
        if (scheme) {
          progress = Number(event.target.value);
          render();
          if (progress >= 100) pause();
        }
      });

      // 页面进入后台时停止动画，避免返回页面后进度跳跃。
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause();
      });
    }
  };
})(window.BIMApp);
