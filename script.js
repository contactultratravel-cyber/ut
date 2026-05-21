document.addEventListener('DOMContentLoaded', () => {

  /* ── MOBILE NAV ── */
  const toggle  = document.getElementById('nav-toggle');
  const nav     = document.getElementById('main-nav');
  const overlay = document.getElementById('nav-overlay');

  function closeNav() {
    toggle.classList.remove('open');
    nav.classList.remove('open');
    overlay.classList.remove('show');
  }

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
  });
  overlay?.addEventListener('click', closeNav);
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));


  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        e.preventDefault();
        const el = document.querySelector(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── SCROLL ANIMATIONS ── */
  const aosObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-in');
        aosObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-aos]').forEach(el => aosObs.observe(el));


  /* ── COUNT-UP ── */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1400;
      const step   = target / (dur / 16);
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.floor(cur);
        if (cur >= target) clearInterval(t);
      }, 16);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));


  /* ── DOC TABS ── */
  const tabs   = document.querySelectorAll('.doc-tab');
  const panels = document.querySelectorAll('.doc-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.panel);
      if (target) target.classList.add('active');
    });
  });


  /* ── GALLERY — load images from assets/visas/ ── */
  const grid = document.getElementById('gallery-grid');
  const lbEl = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbClose = document.getElementById('lb-close');
  let loaded = 0;

  lbClose?.addEventListener('click', () => lbEl.classList.remove('show'));
  lbEl?.addEventListener('click', e => { if (e.target === lbEl) lbEl.classList.remove('show'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lbEl.classList.remove('show'); });

  function addThumb(src) {
    if (loaded === 0) grid.innerHTML = '';
    loaded++;
    const div = document.createElement('div');
    div.className = 'gthumb';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Visa accordé';
    img.loading = 'lazy';
    div.appendChild(img);
    div.addEventListener('click', () => {
      lbImg.src = src;
      lbEl.classList.add('show');
    });
    grid.appendChild(div);
  }

  // Try to load visa images 1 through 30 — only those that exist will show
  for (let i = 1; i <= 30; i++) {
    const src = `assets/visas/${i}.jpg`;
    const probe = new Image();
    probe.onload = () => addThumb(src);
    probe.src = src;
  }
  // Also try .png
  for (let i = 1; i <= 30; i++) {
    const src = `assets/visas/${i}.png`;
    const probe = new Image();
    probe.onload = () => addThumb(src);
    probe.src = src;
  }


  /* ── CONTACT FORM ── */
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const prenom = form.querySelector('#f-prenom').value.trim();
    const nom    = form.querySelector('#f-nom').value.trim();
    const tel    = form.querySelector('#f-tel').value.trim();
    const msg    = form.querySelector('#f-msg').value.trim();
    const subject = 'Demande de visa — Ultra Travel';
    const body    = `Prénom : ${prenom}\nNom : ${nom}\nTéléphone : ${tel}\n\nMessage :\n${msg}`;
    window.location.href = `mailto:Contact.ultratravel@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });


  /* ── HEADER SHADOW ON SCROLL ── */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(6,48,99,.12)'
      : '0 2px 8px rgba(6,48,99,.07)';
  }, { passive: true });

});
