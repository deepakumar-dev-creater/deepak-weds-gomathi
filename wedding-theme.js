/* Visible static ornaments gain one brief entrance; no scroll polling. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (!motion.matches) entry.target.classList.add('thread-arriving');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.65 });
  document.querySelectorAll('.wedding-thread').forEach(function (thread) {
    observer.observe(thread);
    thread.addEventListener('animationend', function () {
      thread.classList.remove('thread-arriving');
    });
  });
}());
