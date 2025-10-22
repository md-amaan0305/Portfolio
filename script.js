// Portfolio interactions for Mohammed Amaan
// - Smooth scrolling
// - Mobile nav toggle
// - Back-to-top accessibility
// - Contact form simple validation (frontend-only)
// - Year auto-update

(function () {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const bgCanvas = document.getElementById('bg-canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const themeToggle = document.getElementById('themeToggle');

  // Mobile nav
  hamburger && hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    document.body.classList.toggle('nav-open');
  });

  // Close nav when clicking a link (mobile)
  nav && nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
  }));

  // Smooth scroll (enhancement; CSS handles most)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Year auto-update
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Contact form: validate + submit via Formspree
  const form = document.getElementById('contactForm');
  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');
    let status = form.querySelector('.form-note');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-note';
      form.appendChild(status);
    }
    // Ensure screen readers announce updates
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const errors = [];
    if (!name.value.trim()) errors.push('Name is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.push('Valid email is required');
    if (!message.value.trim()) errors.push('Message is required');
    if (errors.length) {
      status.textContent = 'Oops! Something went wrong. Please try again.';
      status.style.color = 'var(--primary)';
      return;
    }

    const endpoint = 'https://formspree.io/f/mrbywbrl';
    const data = new FormData(form);
    try {
      submitBtn && (submitBtn.disabled = true);
      status.textContent = 'Sending…';
      status.style.color = 'var(--muted)';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });
      if (res.ok) {
        status.textContent = 'Thank you! Your message has been sent.';
        status.style.color = 'var(--accent)';
        form.reset();
      } else {
        // Try to surface Formspree validation errors
        let fallback = 'Oops! Something went wrong. Please try again.';
        try {
          const json = await res.json();
          if (json && json.errors && json.errors.length) {
            fallback = json.errors.map(e => e.message).join(' ');
          }
        } catch (_) { /* ignore */ }
        status.textContent = fallback;
        status.style.color = 'var(--primary)';
      }
    } catch (err) {
      status.textContent = 'Oops! Something went wrong. Please try again.';
      status.style.color = 'var(--primary)';
    } finally {
      submitBtn && (submitBtn.disabled = false);
    }
  });

  // Resume download: force download behavior consistently (GitHub Pages compatible)
  const resumeLinks = Array.from(document.querySelectorAll('a[href$="assets/resume.pdf"], a[href$="assets/resume.pdf#"], a[href*="assets/resume.pdf?"]'));
  resumeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Prevent navigation and trigger a download via a temporary anchor
      e.preventDefault();
      const href = link.getAttribute('href');
      const url = href ? new URL(href, location.href).toString() : 'assets/resume.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', ''); // let browser use filename
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });

  // Theme toggle: Valorant <-> Game of Thrones
  (function theme() {
    const key = 'site-theme';
    function applyTheme(name) {
      if (name === 'got') document.body.classList.add('theme-got');
      else document.body.classList.remove('theme-got');
      localStorage.setItem(key, name || 'valorant');
      document.documentElement.setAttribute('data-theme', name || 'valorant');
      // Update toggle label
      const label = themeToggle && themeToggle.querySelector('.label');
      if (label) label.textContent = (name === 'got') ? 'Game of Thrones Theme' : 'Valorant Theme';
    }
    // Expose for landing overlay
    window.setSiteTheme = applyTheme;
    const saved = localStorage.getItem(key);
    if (saved) applyTheme(saved);
    themeToggle && themeToggle.addEventListener('click', () => {
      const active = document.body.classList.contains('theme-got');
      applyTheme(active ? 'valorant' : 'got');
    });
  })();

  // First-visit theme landing overlay
  (function landingOverlay() {
    const overlay = document.getElementById('theme-landing');
    if (!overlay) return;
    const key = 'site-theme';
    const saved = localStorage.getItem(key);
    function show() { overlay.hidden = false; document.body.classList.add('landing-open'); requestAnimationFrame(()=>overlay.classList.add('in')); }
    function hide() { overlay.classList.remove('in'); document.body.classList.remove('landing-open'); overlay.hidden = true; }
    if (!saved) show();
    const vBtn = document.getElementById('chooseValorant');
    const gBtn = document.getElementById('chooseGOT');
    vBtn && vBtn.addEventListener('click', () => { window.setSiteTheme && window.setSiteTheme('valorant'); hide(); });
    gBtn && gBtn.addEventListener('click', () => { window.setSiteTheme && window.setSiteTheme('got'); hide(); });
  })();

  // Background animation: soft particle field
  (function animateBackground() {
    if (!bgCanvas) return;
    const ctx = bgCanvas.getContext('2d');
    let particles = [];
    let width, height, rafId;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      width = bgCanvas.clientWidth;
      height = bgCanvas.clientHeight;
      bgCanvas.width = Math.floor(width * dpr);
      bgCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Recreate particles based on size
      const count = Math.max(30, Math.floor((width * height) / 28000));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.2 + Math.random() * 2.6,
        vx: -0.3 + Math.random() * 0.6,
        vy: -0.3 + Math.random() * 0.6,
        hue: 210 + Math.floor(Math.random() * 30)
      }));
    }
      // Subtle parallax drift for decorative layers
      (function parallax() {
        const l1 = document.getElementById('parallax-1');
        const l2 = document.getElementById('parallax-2');
        if (!l1 || !l2) return;
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        let t0 = performance.now();
        function step(t) {
          const dt = (t - t0) / 1000;
          const x1 = Math.sin(dt * 0.06) * 8; // px
          const y1 = Math.cos(dt * 0.04) * 6;
          const x2 = Math.cos(dt * 0.05) * 10;
          const y2 = Math.sin(dt * 0.03) * 8;
          l1.style.transform = `translate(${x1}px, ${y1}px)`;
          l2.style.transform = `translate(${x2}px, ${y2}px)`;
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      })();


    function step() {
      ctx.clearRect(0, 0, width, height);
      // subtle gradient overlay
      const got = document.body.classList.contains('theme-got');
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (got) {
        grad.addColorStop(0, 'rgba(194,157,91,0.07)');
        grad.addColorStop(1, 'rgba(160,199,218,0.04)');
      } else {
        grad.addColorStop(0, 'rgba(255,70,85,0.06)');
        grad.addColorStop(1, 'rgba(0,229,255,0.04)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // draw particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -5) p.x = width + 5; else if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5; else if (p.y > height + 5) p.y = -5;
        ctx.beginPath();
        // Alternate between red and cyan hues
        const color = document.body.classList.contains('theme-got')
          ? (Math.random() < 0.5 ? 'rgba(194,157,91,0.35)' : 'rgba(160,199,218,0.35)')
          : (Math.random() < 0.5 ? 'rgba(255,70,85,0.35)' : 'rgba(0,229,255,0.35)');
        ctx.fillStyle = color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 120 * 120) {
            const alpha = 0.12 * (1 - dist2 / (120 * 120));
            const got = document.body.classList.contains('theme-got');
            ctx.strokeStyle = got ? `rgba(194,157,91,${alpha})` : `rgba(0,229,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    function start() {
      resize();
      if (!prefersReduced) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(step);
      }
    }
    window.addEventListener('resize', start);
    // Repaint on theme change
    const observer = new MutationObserver(start);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    start();
  })();

  // Scroll reveal animations
  (function revealOnScroll() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    els.forEach(el => io.observe(el));
  })();

  // Tech button spark effects
  (function techButtons() {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const btns = document.querySelectorAll('.btn.tech');
    btns.forEach(btn => {
      const layer = btn.querySelector('.spark-layer');
      if (!layer) return;
      let lastMouse = null;
      btn.addEventListener('mousemove', (ev) => {
        lastMouse = { x: ev.clientX, y: ev.clientY };
      });
      btn.addEventListener('mouseenter', () => {
        if (prefersReduced) return;
        // create 10-16 sparks per hover
        const rect = btn.getBoundingClientRect();
        const count = 10 + Math.floor(Math.random() * 7);
        for (let i = 0; i < count; i++) {
          const s = document.createElement('span');
          s.className = 'spark';
          const x = Math.random() * rect.width;
          const y = rect.height * (0.3 + Math.random() * 0.4);
          s.style.left = x + 'px';
          s.style.top = y + 'px';
          s.style.opacity = '1';
          layer.appendChild(s);
          // animate out
          // Direction: bias away from cursor if available
          let angle = (-60 + Math.random() * 120) * Math.PI/180;
          if (lastMouse) {
            const cx = rect.left + x, cy = rect.top + y;
            const vx = (x + rect.left) - lastMouse.x;
            const vy = (y + rect.top) - lastMouse.y;
            if (vx !== 0 || vy !== 0) angle = Math.atan2(vy, vx);
          }
          const got = document.body.classList.contains('theme-got');
          const speed = 80 + Math.random() * 140;
          const duration = 500 + Math.random() * 500;
          const start = performance.now();
          function anim(t) {
            const dt = t - start;
            const p = dt / duration;
            const dx = Math.cos(angle) * speed * (dt/1000);
            const drift = got ? -40 : -160; // embers rise slower
            const dy = Math.sin(angle) * speed * (dt/1000) + drift * (dt/1000) * (dt/1000);
            s.style.transform = `translate(${dx}px, ${dy}px)`;
            s.style.opacity = String(1 - p);
            if (dt < duration) requestAnimationFrame(anim); else s.remove();
          }
          requestAnimationFrame(anim);
        }
      });
      // Emit soft sparks while moving cursor across the button
      btn.addEventListener('mousemove', (ev) => {
        if (prefersReduced) return;
        if (Math.random() > 0.25) return; // throttle
        const rect = btn.getBoundingClientRect();
        const s = document.createElement('span');
        s.className = 'spark';
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.opacity = '1';
        layer.appendChild(s);
        const got = document.body.classList.contains('theme-got');
        const angle = (-20 + Math.random() * 40) * Math.PI/180;
        const speed = 60 + Math.random() * 100;
        const duration = 300 + Math.random() * 300;
        const start = performance.now();
        function anim(t) {
          const dt = t - start;
          const p = dt / duration;
          const dx = Math.cos(angle) * speed * (dt/1000);
          const drift = got ? -30 : -120;
          const dy = Math.sin(angle) * speed * (dt/1000) + drift * (dt/1000) * (dt/1000);
          s.style.transform = `translate(${dx}px, ${dy}px)`;
          s.style.opacity = String(1 - p);
          if (dt < duration) requestAnimationFrame(anim); else s.remove();
        }
        requestAnimationFrame(anim);
      });
      btn.addEventListener('mouseleave', () => {
        // clean up lingering sparks quickly
        Array.from(layer.querySelectorAll('.spark')).forEach(n => n.remove());
      });
    });
  })();
})();
