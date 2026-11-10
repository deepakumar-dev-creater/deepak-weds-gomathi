/* GSAP owns the entrance motion; ScrollTrigger follows this iframe's window. */
(function () {
  'use strict';
  var hero = document.querySelector('.temple-entrance');
  if (!hero) return;
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

  if (!window.gsap || !window.ScrollTrigger) return; // The complete static scene remains.
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var media = gsap.matchMedia();
  var sky = hero.querySelector('.entrance-sky');
  var visible = hero.getBoundingClientRect().bottom > 0;
  var clouds;
  function syncSky() {
    hero.classList.toggle('is-offscreen', !visible);
    if (clouds) clouds.paused(!visible || document.hidden);
  }
  // CSS ease-in-out's exact cubic-bezier(.42,0,.58,1), supplied as a GSAP ease.
  function skyEase(progress) {
    var low = 0, high = 1, t = progress;
    for (var i = 0; i < 16; i++) {
      t = (low + high) / 2;
      var x = 3 * (1 - t) * (1 - t) * t * .42 + 3 * (1 - t) * t * t * .58 + t * t * t;
      if (x < progress) low = t; else high = t;
    }
    return 3 * (1 - t) * t * t + t * t * t;
  }
  function distance() { return Math.max(200, Math.min(hero.offsetHeight * .65, innerHeight * .55)); }
  function desktop() {
    try { return window.top.innerWidth >= 810; } catch (error) { return innerWidth >= 810; }
  }
  media.add('(prefers-reduced-motion: no-preference)', function () {
    clouds = gsap.fromTo(sky, { xPercent: -2, yPercent: -.5, scale: 1.08 }, {
      id: 'temple-clouds', xPercent: 2, yPercent: .5, scale: 1.08,
      duration: 4, repeat: -1, yoyo: true, ease: skyEase
    });
    syncSky();
    gsap.timeline({
      id: 'temple-parallax', defaults: { duration: 1, ease: 'none' },
      scrollTrigger: { id: 'temple-depth', trigger: hero, start: 'top top',
        end: function () { return '+=' + distance(); }, scrub: true, invalidateOnRefresh: true }
    })
      .fromTo(hero.querySelector('.entrance-atmosphere'), { y: 0 }, { y: function () { return desktop() ? 18 : 10; } }, 0)
      .fromTo(hero.querySelector('.entrance-temple'), { y: 0 }, { y: function () { return desktop() ? -50 : -30; } }, 0)
      .fromTo(hero.querySelector('.entrance-trees'), { y: 0 }, { y: function () { return desktop() ? -30 : -18; } }, 0)
      .fromTo(hero.querySelector('.entrance-name-layer'), { y: 0 }, { y: distance }, 0);
    return function () { clouds = null; };
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncSky(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', syncSky);
  window.addEventListener('pageshow', function () { ScrollTrigger.refresh(); syncSky(); });
  // The portrait iframe may retain its width while its parent's breakpoint changes.
  try {
    if (window.top !== window) window.top.addEventListener('resize', function () { ScrollTrigger.refresh(); }, { passive: true });
  } catch (error) { /* Cross-origin hosts need no parent listener. */ }
}());
