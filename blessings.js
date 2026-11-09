/* A brief, section-scoped flower shower. No canvas or permanent animation loop. */
(function () {
  'use strict';
  var scene = document.querySelector('.closing-scene');
  var layer = document.querySelector('.blessing-petals');
  var controls = document.querySelector('.blessing-controls');
  var button = document.getElementById('blessings-button');
  var status = document.getElementById('blessings-status');
  if (!scene || !layer || !controls || !button || !status) return;

  // View boxes isolate the six supplied flowers without altering the source sheet.
  var flowers = ['128 72 309 304', '1010 72 314 304', '156 420 260 266', '1040 420 270 266', '146 740 274 278', '1028 740 290 278'];
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var message = 'உங்கள் ஆசிகளுக்கு நன்றி';
  var active = false;
  var run = 0;
  var animations = [];
  var cleanupTimer;
  var statusTimer;

  function finish(token) {
    if (!active || token !== run) return;
    run += 1;
    active = false;
    clearTimeout(cleanupTimer);
    clearTimeout(statusTimer);
    animations.forEach(function (animation) { animation.cancel(); });
    animations = [];
    layer.replaceChildren();
    button.setAttribute('aria-disabled', 'false');
    button.removeAttribute('aria-busy');
    status.textContent = message;
  }

  function flower(index) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', flowers[index % flowers.length]);
    svg.setAttribute('class', 'blessing-petal');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', 'assets/img/blessings/flower-sheet.png');
    image.setAttribute('width', '1451');
    image.setAttribute('height', '1084');
    svg.appendChild(image);
    return svg;
  }

  function shower() {
    if (active) return;
    var rect = scene.getBoundingClientRect(); // Measure once, before all writes.
    var token = ++run;
    active = true;
    scene.classList.add('has-blessing');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-busy', 'true');
    status.textContent = '';
    statusTimer = setTimeout(function () {
      if (active && run === token) status.textContent = message;
    }, 40);

    var still = motion.matches || typeof Element.prototype.animate !== 'function';
    var count = still ? 3 : 16;
    var fragment = document.createDocumentFragment();
    var pending = [];
    for (var i = 0; i < count; i++) {
      var img = flower(still ? i * 2 : i);
      var size = still ? 25 : (i % 6 < 2 ? 25 : 18) + Math.random() * 7;
      img.style.width = size + 'px';
      img.style.height = size + 'px';
      img.style.left = (rect.width * (still ? 0.25 + i * 0.24 : 0.14 + Math.random() * 0.7)) + 'px';
      if (still) {
        img.style.top = (rect.height * (0.39 + i * 0.08)) + 'px';
        img.style.transform = 'rotate(' + (i * 38 - 24) + 'deg)';
      } else {
        var drift = (Math.random() - 0.5) * Math.min(76, rect.width * 0.19);
        var rotation = Math.random() * 120 - 60;
        var turn = (i % 2 ? 1 : -1) * (100 + Math.random() * 150);
        pending.push({ img: img, frames: [
          { offset: 0, opacity: 0, transform: 'translate3d(0,-28px,0) rotate(' + rotation + 'deg) scale(.8)' },
          { offset: 0.12, opacity: 1, transform: 'translate3d(' + drift * 0.2 + 'px,' + rect.height * 0.08 + 'px,0) rotate(' + (rotation + turn * 0.12) + 'deg) scale(1)' },
          { offset: 0.6, opacity: 1, transform: 'translate3d(' + -drift * 0.45 + 'px,' + rect.height * 0.52 + 'px,0) rotate(' + (rotation + turn * 0.6) + 'deg) scale(.95)' },
          { offset: 1, opacity: 0, transform: 'translate3d(' + drift + 'px,' + rect.height * 0.92 + 'px,0) rotate(' + (rotation + turn) + 'deg) scale(.8)' }
        ], duration: 1900 + Math.random() * 380, delay: i * 20 });
      }
      fragment.appendChild(img);
    }
    layer.appendChild(fragment);
    if (still) {
      cleanupTimer = setTimeout(function () { finish(token); }, 1800);
      return;
    }
    try {
      animations = pending.map(function (petal) {
        return petal.img.animate(petal.frames, { duration: petal.duration, delay: petal.delay, easing: 'linear', fill: 'both' });
      });
      Promise.all(animations.map(function (animation) {
        return animation.finished.catch(function () { /* Resize/visibility cancellation is expected. */ });
      })).then(function () { finish(token); });
      cleanupTimer = setTimeout(function () { finish(token); }, 3000);
    } catch (error) {
      finish(token); // Keep the acknowledgement usable if browser animation fails.
    }
  }

  button.addEventListener('click', shower);
  window.addEventListener('resize', function () { finish(run); }, { passive: true });
  window.addEventListener('pagehide', function () { finish(run); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) finish(run); });
  function changedMotion() { finish(run); }
  if (motion.addEventListener) motion.addEventListener('change', changedMotion);
  else motion.addListener(changedMotion);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) finish(run);
    }).observe(scene);
  }
  // Prepare the sprite while guests read the invitation. A first tap must not
  // finish its animation before the flower image has arrived on a slow network.
  var sprite = new Image();
  sprite.onload = function () { controls.hidden = false; };
  sprite.onerror = function () { finish(run); controls.hidden = true; };
  sprite.src = 'assets/img/blessings/flower-sheet.png';
}());
