/* GSAP enhancement; static HTML remains visible without scripts or motion. */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  var media = gsap.matchMedia();
  var seen = new WeakSet();
  var entrances = new Map();
  var symbol = document.getElementById('wedding-thread');
  var threads = Array.from(document.querySelectorAll('.wedding-thread'));
  // Clone the tiny paths so drawing one ornament cannot alter all shared copies.
  threads.forEach(function (thread) {
    if (symbol) thread.replaceChildren.apply(thread, Array.from(symbol.children).map(function (path) { return path.cloneNode(true); }));
  });
  var lengths = new Map();
  threads.forEach(function (thread) {
    thread.querySelectorAll('path').forEach(function (path) { lengths.set(path, path.getTotalLength()); });
  });
  media.add('(prefers-reduced-motion: no-preference)', function (context) {
    function enter(element, build) {
      if (!element || seen.has(element)) return;
      ScrollTrigger.create({ trigger: element, start: 'top 90%', once: true,
        onEnter: function () {
          seen.add(element);
          context.add(function () {
            var timeline = gsap.timeline({ defaults: { duration: .65, ease: 'power2.out' },
              onComplete: function () { entrances.delete(element); } });
            entrances.set(element, timeline);
            build(timeline, element);
          });
        }
      });
    }
    threads.forEach(function (thread) {
      enter(thread, function (timeline) {
        timeline.fromTo(thread.querySelectorAll('path'), {
          strokeDasharray: function (i, path) { return lengths.get(path); },
          strokeDashoffset: function (i, path) { return lengths.get(path); }
        }, { strokeDashoffset: 0, stagger: .1, duration: .95, ease: 'power1.inOut', clearProps: 'strokeDasharray,strokeDashoffset' });
      });
    });
    ['.fi-intro', '.fi-person', '.ce-header h2', '.ce-venue', '.closing-header h2'].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (element) {
        enter(element, function (timeline) {
          timeline.fromTo(element, { y: 14, opacity: .25 }, { y: 0, opacity: 1, clearProps: 'transform,opacity' });
        });
      });
    });
    document.querySelectorAll('.ce-event').forEach(function (event) {
      enter(event, function (timeline) {
        timeline.fromTo(event.querySelector('.ce-number'), { scale: .7, opacity: .4 }, { scale: 1, opacity: 1, duration: .45, clearProps: 'transform,opacity' }, 0)
          .fromTo(event.querySelector('h3'), { x: 10, opacity: .25 }, { x: 0, opacity: 1, clearProps: 'transform,opacity' }, .08)
          .fromTo(event.querySelector('.ce-details'), { y: 12, opacity: .3 }, { y: 0, opacity: 1, clearProps: 'transform,opacity' }, .15)
          .fromTo(event.querySelector('.ce-illustration'), { y: 16, rotation: 1.5, opacity: .4 }, { y: 0, rotation: 0, opacity: 1, duration: .8, clearProps: 'transform,opacity' }, .1);
      });
    });
    var progress = document.querySelector('.ce-thread-progress');
    if (progress) gsap.fromTo(progress, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: {
      trigger: '.ce-timeline', start: 'top 76%', end: 'bottom 66%', scrub: true
    } });
    enter(document.querySelector('.closing-vignette'), function (timeline) {
      timeline.fromTo('.closing-arch', { opacity: .2, y: 8 }, { opacity: 1, y: 0, duration: .9, clearProps: 'transform,opacity' }, 0)
        .fromTo('.closing-garland g use', { opacity: .2, scale: .7, transformOrigin: 'center' }, { opacity: 1, scale: 1, stagger: .045, clearProps: 'transform,opacity,transformOrigin' }, .15)
        .fromTo('.closing-couple', { y: 12, opacity: .35 }, { y: 0, opacity: 1, duration: .9, clearProps: 'transform,opacity' }, .15)
        .fromTo('.closing-lamp', { opacity: .3 }, { opacity: 1, stagger: .12, clearProps: 'opacity' }, .4);
    });
    enter(document.querySelector('.closing-signature'), function (timeline, signature) {
      timeline.fromTo(signature.children, { y: 12, opacity: .2 }, { y: 0, opacity: 1, stagger: .1, duration: .7, clearProps: 'transform,opacity' });
    });
    return function () { entrances.clear(); };
  });
  document.addEventListener('focusin', function (event) {
    entrances.forEach(function (timeline, element) { if (element.contains(event.target)) timeline.progress(1); });
  });
  // The bridge mounts the persistent music player later. Watch actual playback.
  var player = document.getElementById('temple-music');
  function mountMusicMotion() {
    var button = player && player.querySelector('.mp-btn');
    if (!button) return false;
    media.add('(prefers-reduced-motion: no-preference)', function () {
      var bars = gsap.to(player.querySelectorAll('.mp-bars i'), { id: 'music-bars', scaleY: .3,
        duration: .55, stagger: { each: .12, repeat: -1, yoyo: true }, ease: 'sine.inOut', paused: true });
      function sync() { bars.paused(document.hidden || button.getAttribute('aria-pressed') !== 'true'); }
      var observer = new MutationObserver(sync);
      observer.observe(button, { attributes: true, attributeFilter: ['aria-pressed'] });
      document.addEventListener('visibilitychange', sync);
      sync();
      return function () { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
    });
    return true;
  }
  if (player && !mountMusicMotion()) {
    var mount = new MutationObserver(function () { if (mountMusicMotion()) mount.disconnect(); });
    mount.observe(player, { childList: true });
  }
  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
}());
