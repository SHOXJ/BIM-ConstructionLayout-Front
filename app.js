/* 页面入口：导航、公共反馈、模块初始化。不在此文件堆放业务计算。 */
(function (app) {
  let notificationTimer;
  app.notify = message => {
    const node = document.getElementById('notification');
    node.textContent = message; node.hidden = false;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => { node.hidden = true; }, 3500);
  };
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', () => {
    const expanded = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(expanded));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  function updateActive() {
    const active = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 160);
    links.forEach(link => {
      const selected = !!active && link.hash === `#${active.id}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(() => { updateActive(); scheduled = false; }); }
  }, { passive: true });
  updateActive();
  // 本地SVG概念模型；不依赖远程图片、字体或第三方运行库。
  const slabs = document.getElementById('hero-slabs');
  for (let i = 0; i < 5; i++) {
    const y = 330 - i * 43;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const color = i === 3 ? '#d64b60' : '#718c9a';
    group.innerHTML = `<path d="M110 ${y}L310 ${y-105}L498 ${y-5}L295 ${y+100}Z" fill="${i===3?'#9e3446':'#2c424f'}" fill-opacity=".7" stroke="${color}" stroke-width="1.3"/><path d="M110 ${y}V${y+7}L295 ${y+107}L498 ${y+2}V${y-5}M295 ${y+100}V${y+107}" fill="none" stroke="${color}"/>`;
    if (i < 4) {
      for (let j = 0; j <= 4; j++) {
        const x = 110 + j * 46.25, base = y + j * 25;
        group.innerHTML += `<path d="M${x} ${base}V${base-43}" stroke="#8099a8" stroke-width="3"/>`;
        const rx = 295 + j * 50.75, ry = y + 100 - j * 26.25;
        group.innerHTML += `<path d="M${rx} ${ry}V${ry-43}" stroke="#8099a8" stroke-width="3"/>`;
      }
    }
    slabs.append(group);
  }
  app.modules.data.init();
  app.modules.planning.init();
  app.modules.visualization.init();
})(window.BIMApp);
