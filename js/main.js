/* =========================================
   AZWAR ALI — Light Works
   Main JS  ·  Cursor / Nav / Transitions
   ========================================= */

(function () {

  /* ---- Custom Cursor ---- */
  const cursor = document.getElementById('cursor');
  if (cursor) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .portfolio-item, .brand-card, .service-card, .vt-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });
  }

  /* ---- Mobile Navigation ---- */
  const toggle  = document.getElementById('navToggle');
  const mobileM = document.getElementById('mobileMenu');
  if (toggle && mobileM) {
    toggle.addEventListener('click', () => {
      const open = mobileM.classList.toggle('open');
      toggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileM.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileM.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Page Transitions ---- */
  document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.3s';
      document.body.style.opacity    = '0';
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });

  /* ---- Scroll Fade-in (non-index pages) ---- */
  const fadeEls = document.querySelectorAll('.service-card, .stat-cell, .brand-card');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s var(--ease), transform 0.6s var(--ease)';
      io.observe(el);
    });
  }

  /* ---- Grid-view lightbox (about/clients pages don't have this — only index) ---- */
  /* The index.html has its own inline lightbox script that uses PORTFOLIO_IMAGES */

})();
