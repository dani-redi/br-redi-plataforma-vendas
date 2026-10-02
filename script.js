// CTAs de signup: a montagem do href (UTMs) fica inline no index.html,
// para não depender do carregamento deste arquivo.

// Altura do header (o hero ocupa o restante da tela)
// ResizeObserver entrega a medida após o layout (ler offsetHeight aqui forçaria um reflow)
new ResizeObserver(([entry]) => {
  const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--header-h', Math.round(h) + 'px');
}).observe(document.querySelector('header'));

// Hero: carrossel mobile (chips duplicados) + tooltip por toque
const chips = document.getElementById('chips');
const track = document.getElementById('marquee-track');
for (let i = 0; i < 2; i++) {
  [...chips.children].forEach((chip) => {
    const c = chip.cloneNode(true);
    if (i === 1) c.setAttribute('aria-hidden', 'true');
    track.appendChild(c);
  });
}
track.addEventListener('click', (e) => {
  const chip = e.target.closest('.has-tip');
  if (!chip) return;
  const wasOpen = chip.classList.contains('open');
  track.querySelectorAll('.open').forEach((c) => c.classList.remove('open'));
  if (!wasOpen) chip.classList.add('open');
  track.classList.toggle('marquee-paused', !wasOpen);
});

// Stats: tooltip por clique (mobile)
document.querySelectorAll('[data-stat-tip]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = btn.classList.contains('open');
    document.querySelectorAll('[data-stat-tip].open').forEach((b) => b.classList.remove('open'));
    if (!wasOpen) btn.classList.add('open');
  });
});
document.addEventListener('click', () =>
  document.querySelectorAll('[data-stat-tip].open').forEach((b) => b.classList.remove('open'))
);

// Explore o produto: abas + troca automática a cada 5s (só desktop; no mobile a imagem é estática)
const tabs = [...document.querySelectorAll('[data-tab]')];
const shot = document.getElementById('shot');
const desktop = window.matchMedia('(min-width: 768px)');
let current = 0;
let timer;
// data-img é a base do arquivo em src/img/opt (ex.: ./src/img/opt/Dash -> Dash-1000.webp / Dash-2000.webp)
const srcsetOf = (base) => `${base}-1000.webp 1000w, ${base}-2000.webp 2000w`;
function preload(i) {
  const img = new Image();
  img.sizes = shot.sizes;
  img.srcset = srcsetOf(tabs[i].dataset.img);
}
function selectTab(i) {
  current = i;
  tabs.forEach((t, idx) => {
    const on = idx === i;
    const ico = t.querySelector('.ico');
    t.setAttribute('aria-selected', on);
    t.classList.toggle('bg-white/10', on);
    ico.classList.toggle('bg-primary', on);
    ico.classList.toggle('text-white', on);
    ico.classList.toggle('bg-white/10', !on);
    ico.classList.toggle('text-white/70', !on);
  });
  shot.classList.remove('duration-500');
  shot.classList.add('duration-200', 'opacity-0');
  setTimeout(() => {
    shot.onload = () => {
      shot.classList.remove('duration-200');
      shot.classList.add('duration-500');
      shot.classList.remove('opacity-0');
    };
    shot.srcset = srcsetOf(tabs[i].dataset.img);
    shot.src = `${tabs[i].dataset.img}-1000.webp`;
    shot.alt = tabs[i].dataset.alt;
    if (desktop.matches) preload((i + 1) % tabs.length);
  }, 200);
}
function restart() {
  clearInterval(timer);
  if (desktop.matches) timer = setInterval(() => selectTab((current + 1) % tabs.length), 5000);
}
tabs.forEach((t, i) =>
  t.addEventListener('click', () => {
    selectTab(i);
    restart();
  })
);
desktop.addEventListener('change', () => {
  if (!desktop.matches && current !== 0) selectTab(0);
  restart();
});
restart();
