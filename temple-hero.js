/* Native root scroll timelines use this iframe's scroll; no animation polling loop. */
(function () {
  'use strict';
  var hero = document.querySelector('.temple-entrance');
  if (!hero) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nativeScroll = window.CSS && CSS.supports('animation-timeline', 'scroll(root block)');
  var pending = false;
  var distance = 450;
  var shifts = [18, -50, -30, 0];
  var layers = ['.entrance-atmosphere', '.entrance-temple', '.entrance-trees', '.entrance-name-layer'].map(function (selector) {
    return hero.querySelector(selector);
  });
  function renderFallback() {
    pending = false;
    if (nativeScroll) return;
    var progress = motion.matches ? 0 : Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));
    layers.forEach(function (layer, index) {
      layer.style.transform = 'translateY(' + (progress * shifts[index]).toFixed(2) + 'px)';
    });
  }
  function requestFallback() {
    if (nativeScroll || pending) return;
    pending = true;
    requestAnimationFrame(renderFallback);
  }
  function update() {
    var width = window.innerWidth;
    try { width = window.top.innerWidth; } catch (error) { /* Cross-origin embeds use their own width. */ }
    var desktop = width >= 810;
    shifts = desktop ? [18, -50, -30, 0] : [10, -30, -18, 0];
    distance = Math.max(200, Math.min(hero.offsetHeight * 0.65, window.innerHeight * 0.55));
    // Hold the names in view while the foreground temple rises over them.
    shifts[3] = distance;
    hero.style.setProperty('--entrance-distance', distance + 'px');
    hero.style.setProperty('--entrance-sky-shift', shifts[0] + 'px');
    hero.style.setProperty('--entrance-temple-shift', shifts[1] + 'px');
    hero.style.setProperty('--entrance-tree-shift', shifts[2] + 'px');
    hero.style.setProperty('--entrance-name-shift', shifts[3] + 'px');
    document.documentElement.classList.toggle('entrance-depth', !motion.matches);
    requestFallback();
  }
  if (!nativeScroll) window.addEventListener('scroll', requestFallback, { passive: true });
  update();
  window.addEventListener('resize', update, { passive: true });
  if (window.top !== window) {
    try { window.top.addEventListener('resize', update, { passive: true }); } catch (error) { /* Optional parent access. */ }
  }
  if (motion.addEventListener) motion.addEventListener('change', update);
  else motion.addListener(update);
  // The existing player owns playback; only enrich its control's accessible name.
  function labelMusic() {
    var button = document.querySelector('#temple-music .mp-btn');
    if (!button) return;
    function label() {
      var playing = button.getAttribute('aria-pressed') === 'true';
      var text = playing ? 'Pause music' : 'Play music';
      button.setAttribute('aria-label', text);
      button.title = text;
    }
    label();
    new MutationObserver(label).observe(button, { attributes: true, attributeFilter: ['aria-pressed'] });
  }
  var musicHost = document.getElementById('temple-music');
  if (musicHost) {
    labelMusic();
    var musicObserver = new MutationObserver(function () {
      if (musicHost.querySelector('.mp-btn')) { labelMusic(); musicObserver.disconnect(); }
    });
    musicObserver.observe(musicHost, { childList: true });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hero.classList.toggle('is-offscreen', !entries[0].isIntersecting);
    }).observe(hero);
  }
}());
