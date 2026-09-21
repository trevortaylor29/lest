// getlest.app
//
// Four jobs: split the headline into words that climb out of a mask, reveal
// blocks as they arrive, run every parallax layer off one rAF loop, and drive
// the pinned phone so its clip matches the chapter you are reading.
//
// ?static forces everything to its finished state, which is how the page gets
// screenshotted. ?ch=N jumps to one chapter.
(function () {
  var params = new URLSearchParams(location.search);
  var STATIC = params.has('static');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var still = STATIC || reduce;

  // ---- headline: one mask per word ----------------------------------------
  document.querySelectorAll('[data-words]').forEach(function (h) {
    var i = 0;
    h.innerHTML = h.innerHTML.replace(/([^<>\s]+)(?![^<]*>)/g, function (word) {
      return '<span class="w" style="--i:' + i++ + '"><i>' + word + '</i></span>';
    });
    if (still) {
      h.querySelectorAll('.w > i').forEach(function (el) {
        el.style.transform = 'none';
        el.style.animation = 'none';
      });
    }
  });

  // ---- reveal on arrival ---------------------------------------------------
  var reveals = document.querySelectorAll('.reveal');
  if (still) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  // ---- only play what is on screen ----------------------------------------
  function play(v) {
    if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
    var p = v.play();
    if (p && p.catch) { p.catch(function () {}); }
  }
  var vo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.target.classList.contains('ch')) { return; }   // the pinned phone runs itself
      if (e.isIntersecting) { play(e.target); }
      else if (!e.target.paused) { e.target.pause(); }
    });
  }, { rootMargin: '250px 0px', threshold: 0.05 });
  document.querySelectorAll('video').forEach(function (v) { vo.observe(v); });

  // ---- pinned phone: the chapter you are reading picks the clip ------------
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.chapters li'));
  var clips = Array.prototype.slice.call(document.querySelectorAll('.phone .ch'));
  if (chapters.length && clips.length) {
    var setChapter = function (n) {
      chapters.forEach(function (li) {
        li.classList.toggle('active', li.dataset.ch === String(n));
      });
      clips.forEach(function (v) {
        var on = v.dataset.ch === String(n);
        v.classList.toggle('on', on);
        if (on) { v.currentTime = 0; play(v); } else { v.pause(); }
      });
    };
    var forced = params.get('ch');
    if (forced !== null) {
      setChapter(Number(forced));
      document.documentElement.style.scrollBehavior = 'auto';
      chapters[Number(forced)].scrollIntoView({ block: 'center' });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { setChapter(Number(e.target.dataset.ch)); }
        });
      }, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
      chapters.forEach(function (li) { co.observe(li); });
      setChapter(0);
    }
  }

  // ---- parallax ------------------------------------------------------------
  if (still) { return; }

  var nodes = [];
  document.querySelectorAll('[data-par], [data-pointer]').forEach(function (el) {
    nodes.push({
      el: el,
      par: parseFloat(el.dataset.par || 0),
      pt: parseFloat(el.dataset.pointer || 0),
    });
  });
  if (!nodes.length) { return; }

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var tx = 0, ty = 0, px = 0, py = 0, ticking = false;

  if (fine) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      request();
    }, { passive: true });
  }

  function frame() {
    ticking = false;
    var h = window.innerHeight;
    px += (tx - px) * 0.075;
    py += (ty - py) * 0.075;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var r = n.el.getBoundingClientRect();
      if (r.bottom < -h * 0.5 || r.top > h * 1.5) { continue; }
      var x = 0, y = 0;
      // scroll: how far this element's middle sits from the viewport's middle
      if (n.par) { y -= ((r.top + r.height / 2) - h / 2) * n.par; }
      if (n.pt && fine) { x += px * n.pt; y += py * n.pt; }
      n.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
    }
    if (fine && (Math.abs(tx - px) > 0.0015 || Math.abs(ty - py) > 0.0015)) { request(); }
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
})();
