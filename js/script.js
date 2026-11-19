/* =========================================================
   Shreyash Gurav – Portfolio | Vanilla JavaScript (ES6+)
   ========================================================= */
(() => {
  'use strict';

  const EMAIL = 'shreyashsgurav10s@gmail.com';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: scroll state, mobile menu, active link ---------- */
  const navbar = $('#navbar');
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');
  const toTop = $('#to-top');

  // backdrop behind the mobile drawer
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const setMenu = (open) => {
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  navToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 920) setMenu(false); });

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 600);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  // Highlight the nav link of the section currently in view
  if ('IntersectionObserver' in window) {
    const sections = navLinks
      .map((l) => $(l.getAttribute('href')))
      .filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach((l) => {
            const active = l.getAttribute('href') === id;
            l.classList.toggle('active', active);
            if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Scroll reveal (+ staggered skill badges) ---------- */
  $$('.skill-card .badge').forEach((b, i, all) => {
    // stagger resets per card
    const siblings = $$('.badge', b.closest('.skill-card'));
    b.style.setProperty('--i', siblings.indexOf(b));
  });

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      // small stagger for hero items present on load
      if (el.closest('.hero')) el.style.transitionDelay = `${Math.min(i, 8) * 90}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Typing effect (hero) ---------- */
  const typedEl = $('#typed');
  const roles = ['Web Developer', 'Frontend Developer', 'Angular Developer', 'IT Professional'];
  if (typedEl) {
    if (prefersReducedMotion) {
      typedEl.textContent = roles.join(' | ');
    } else {
      let r = 0, c = 0, deleting = false;
      const tick = () => {
        const word = roles[r];
        c += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, c);
        let delay = deleting ? 38 : 85;
        if (!deleting && c === word.length) { deleting = true; delay = 1700; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 380; }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 600);
    }
  }

  /* ---------- Project images: graceful placeholder if screenshot missing ---------- */
  $$('.project-media img').forEach((img) => {
    const showPlaceholder = () => {
      const wrap = img.parentElement;
      if (wrap.classList.contains('no-image')) return;
      wrap.classList.add('no-image');
      const label = document.createElement('div');
      label.className = 'no-image-label';
      label.innerHTML = '<span></span><small>Add screenshot: ' + img.getAttribute('src') + '</small>';
      label.firstChild.textContent = img.dataset.fallback || 'Project preview';
      wrap.appendChild(label);
    };
    if (img.complete && img.naturalWidth === 0) showPlaceholder();
    img.addEventListener('error', showPlaceholder);
  });

  /* ---------- Hero background: subtle network of nodes (canvas) ---------- */
  const canvas = $('#hero-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, nodes = [], rafId = null, running = false;
    const BLUE = '0, 123, 167';
    const ROSE = '255, 45, 149';

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(60, Math.floor((w * h) / 24000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.6 + .7, rose: Math.random() < .22
      }));
    };

    // Mouse interaction: nodes gently repel from the cursor and link to it with rose lines
    const mouse = { x: -999, y: -999 };
    const heroEl = canvas.closest('.hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const maxD = 140;
      const mR = 170;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < mR && md > 0.1) {
          const f = (1 - md / mR);
          a.x += (mdx / md) * f * 1.4; a.y += (mdy / md) * f * 1.4;
          ctx.strokeStyle = `rgba(${ROSE}, ${f * .55})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(${BLUE}, ${(1 - d / maxD) * .35})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${a.rose ? ROSE : BLUE}, ${a.rose ? .8 : .7})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(draw); } };
    const stop = () => { running = false; if (rafId) cancelAnimationFrame(rafId); };

    resize();
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });

    // Only animate while the hero is visible and the tab is active (keeps the site fast)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => entries[0].isIntersecting ? start() : stop()).observe(canvas);
    } else { start(); }
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  }

  /* ---------- Contact form: validates, then opens the user's email app (mailto) ---------- */
  const form = $('#contact-form');
  const status = $('#form-status');
  if (form) {
    const rules = {
      name: (v) => v.trim().length >= 2 || 'Please enter your name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
      subject: (v) => v.trim().length >= 3 || 'Please enter a subject.',
      message: (v) => v.trim().length >= 10 || 'Please write a message (at least 10 characters).'
    };

    const validateField = (name) => {
      const input = form.elements[name];
      const result = rules[name](input.value);
      const field = input.closest('.field');
      const err = $('#' + name + '-error');
      const ok = result === true;
      field.classList.toggle('invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : result;
      return ok;
    };

    Object.keys(rules).forEach((name) => {
      form.elements[name].addEventListener('blur', () => validateField(name));
      form.elements[name].addEventListener('input', () => {
        if (form.elements[name].closest('.field').classList.contains('invalid')) validateField(name);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const allValid = Object.keys(rules).map(validateField).every(Boolean);
      status.classList.remove('ok');
      if (!allValid) {
        status.textContent = 'Please fix the highlighted fields and try again.';
        const firstBad = form.querySelector('.invalid input, .invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }
      const name = form.elements.name.value.trim();
      const from = form.elements.email.value.trim();
      const subject = form.elements.subject.value.trim();
      const message = form.elements.message.value.trim();
      const body = `${message}\n\n— ${name}\n${from}`;
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Opening your email app… If nothing opens, please email me directly at ' + EMAIL + ' or message me on LinkedIn.';
      status.classList.add('ok');
      window.location.href = href;
    });
  }
})();


/* =========================================================
   Interactive effects: cursor, scroll progress, parallax,
   split titles, tilt/spotlight, magnetic buttons, timeline
   ========================================================= */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Directional reveals + stagger ---------- */
  const addClass = (sel, cls) => $$(sel).forEach((el) => el.classList.add(cls));
  addClass('.about-text', 'reveal-left');
  addClass('.career-card', 'reveal-right');
  addClass('.contact-list', 'reveal-left');
  addClass('.contact-form', 'reveal-right');
  $$('.timeline-col').forEach((col, i) => $$('.timeline-item', col).forEach((el) => el.classList.add(i === 0 ? 'reveal-left' : 'reveal-right')));
  ['.projects-grid .project-card', '.cert-grid .cert-card', '.connect-grid .connect-card'].forEach((sel) =>
    $$(sel).forEach((el, i) => el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right')));
  addClass('.service-card', 'reveal-zoom');
  addClass('.skill-card', 'reveal-zoom');
  addClass('.resume-card', 'reveal-zoom');

  ['.skills-grid', '.services-grid'].forEach((sel) => {
    const grid = $(sel);
    if (grid) Array.from(grid.children).forEach((c, i) => { c.style.transitionDelay = `${(i % 3) * 110}ms`; });
  });

  // After the entrance transition ends, drop the slow transition/delay so hover & tilt feel snappy
  document.addEventListener('transitionend', (e) => {
    const el = e.target;
    if (el.classList && el.classList.contains('reveal') && e.propertyName === 'transform') {
      el.classList.add('done');
      el.style.transitionDelay = '';
    }
  });

  /* ---------- Split section titles into rising words ---------- */
  if (!reduce) {
    let wordIndex = 0;
    const makeWord = (text, gradient) => {
      const outer = document.createElement('span');
      outer.className = 'split-word';
      const inner = document.createElement('span');
      if (gradient) inner.className = 'gradient-text';
      inner.textContent = text;
      outer.style.setProperty('--w', wordIndex++);
      inner.style.setProperty('--w', 0);
      outer.appendChild(inner);
      return outer;
    };
    $$('.section-title').forEach((title) => {
      wordIndex = 0;
      const label = title.textContent.replace(/\s+/g, ' ').trim();
      const frag = document.createDocumentFragment();
      Array.from(title.childNodes).forEach((node) => {
        const gradient = node.nodeType === 1 && node.classList.contains('gradient-text');
        const words = node.textContent.split(/\s+/).filter(Boolean);
        const hadLeadSpace = /^\s/.test(node.textContent);
        if (hadLeadSpace) frag.appendChild(document.createTextNode(' '));
        words.forEach((wd, i) => {
          frag.appendChild(makeWord(wd, gradient));
          if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
        });
        if (/\s$/.test(node.textContent)) frag.appendChild(document.createTextNode(' '));
      });
      title.setAttribute('aria-label', label);
      title.textContent = '';
      title.appendChild(frag);
      $$('.split-word', title).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    });
  }

  /* ---------- Section kicker: "decrypt" scramble when revealed ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const glyphs = '01<>/{}[]#*+=_';
    const scramble = (el) => {
      const original = el.textContent;
      el.textContent = '';
      const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = original;
      const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
      el.append(sr, vis);
      const start = performance.now(); const dur = 800;
      const step = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const fixed = Math.floor(t * original.length);
        vis.textContent = original.split('').map((ch, i) =>
          (ch === ' ' || ch === '/' || i < fixed) ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        if (t < 1) requestAnimationFrame(step); else vis.textContent = original;
      };
      requestAnimationFrame(step);
    };
    const kio = new IntersectionObserver((entries, obs) => entries.forEach((en) => {
      if (en.isIntersecting) { scramble(en.target); obs.unobserve(en.target); }
    }), { threshold: 0.6 });
    $$('.section-kicker').forEach((k) => kio.observe(k));
  }

  /* ---------- Scroll progress + timeline draw + hero parallax ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const hero = $('.hero');
  const heroInner = $('.hero-inner');
  const heroPhoto = $('.hero-photo');
  const glowB = $('.hero-glow-blue');
  const glowR = $('.hero-glow-rose');
  const timelines = $$('.timeline');
  const mouseN = { tx: 0, ty: 0, cx: 0, cy: 0 };   // normalized -0.5..0.5
  let sy = 0, scrollTick = false, heroVisible = true, parallaxRaf = null;

  const updateScroll = () => {
    scrollTick = false;
    sy = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(sy / max, 0, 1) : 0})`;
    if (reduce) return;
    const vh = window.innerHeight;
    timelines.forEach((tl) => {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--p', clamp((vh * 0.78 - r.top) / r.height, 0.02, 1).toFixed(3));
      $$('.timeline-item', tl).forEach((it) => it.classList.toggle('reached', it.getBoundingClientRect().top < vh * 0.72));
    });
  };
  window.addEventListener('scroll', () => { if (!scrollTick) { scrollTick = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  if (hero && !reduce) {
    const applyParallax = () => {
      mouseN.cx += (mouseN.tx - mouseN.cx) * 0.08;
      mouseN.cy += (mouseN.ty - mouseN.cy) * 0.08;
      const fade = clamp(1 - sy / (hero.offsetHeight * 0.85), 0, 1);
      if (heroInner) { heroInner.style.translate = `0 ${(sy * 0.14).toFixed(1)}px`; heroInner.style.opacity = fade.toFixed(3); }
      if (heroPhoto) heroPhoto.style.translate = `${(mouseN.cx * -26).toFixed(1)}px ${(mouseN.cy * -26 - sy * 0.05).toFixed(1)}px`;
      if (glowB) glowB.style.translate = `${(mouseN.cx * 60).toFixed(1)}px ${(mouseN.cy * 60 + sy * 0.22).toFixed(1)}px`;
      if (glowR) glowR.style.translate = `${(mouseN.cx * -50).toFixed(1)}px ${(mouseN.cy * -50 + sy * 0.1).toFixed(1)}px`;
      parallaxRaf = heroVisible ? requestAnimationFrame(applyParallax) : null;
    };
    const startParallax = () => { if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax); };
    if (finePointer) {
      hero.addEventListener('mousemove', (e) => {
        mouseN.tx = e.clientX / window.innerWidth - 0.5;
        mouseN.ty = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
      hero.addEventListener('mouseleave', () => { mouseN.tx = mouseN.ty = 0; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; if (heroVisible) startParallax(); }).observe(hero);
    }
    startParallax();
  }

  /* ---------- Everything below is for mouse devices only ---------- */
  if (!finePointer || reduce) return;

  /* ---------- Card spotlight + 3D tilt ---------- */
  $$('.skill-card, .project-card, .service-card, .cert-card, .connect-card').forEach((c) => c.classList.add('tilt'));
  $$('.glass').forEach((card) => {
    const tilt = card.classList.contains('tilt');
    const max = card.classList.contains('project-card') ? 3 : 6;
    card.addEventListener('mouseenter', () => { card.style.setProperty('--spot', 1); if (tilt) card.style.setProperty('--ty', '-6px'); });
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (tilt) {
        card.style.setProperty('--ry', ((x / r.width - 0.5) * max * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-(y / r.height - 0.5) * max * 2).toFixed(2) + 'deg');
      }
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--spot', 0);
      if (tilt) { card.style.setProperty('--ty', '0px'); card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); }
    });
  });

  /* ---------- Magnetic buttons + ripple ---------- */
  $$('.btn, .icon-btn, .logo-mark').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.28;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    }, { passive: true });
    el.addEventListener('mouseleave', () => { el.style.translate = ''; });
  });
  $$('.btn').forEach((btn) => btn.addEventListener('click', (e) => {
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.left = (e.clientX - r.left) + 'px';
    rip.style.top = (e.clientY - r.top) + 'px';
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  }));

  /* ---------- Custom cursor: dot + trailing ring + glow trail ---------- */
  $$('.project-media').forEach((el) => el.setAttribute('data-cursor', 'View'));
  $$('.cert-thumb').forEach((el) => el.setAttribute('data-cursor', 'Open'));
  $$('.hero-photo').forEach((el) => el.setAttribute('data-cursor', 'Hi!'));

  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  const label = document.createElement('span'); label.className = 'cursor-label';
  ring.appendChild(label);
  const trail = document.createElement('canvas'); trail.className = 'cursor-trail';
  [dot, ring, trail].forEach((n) => n.setAttribute('aria-hidden', 'true'));
  document.body.append(trail, ring, dot);
  document.documentElement.classList.add('has-cursor');

  const tctx = trail.getContext('2d');
  const sizeTrail = () => { trail.width = window.innerWidth; trail.height = window.innerHeight; };
  sizeTrail();
  window.addEventListener('resize', sizeTrail);

  let mx = -100, my = -100, rx = -100, ry = -100, lastX = -100, lastY = -100, first = true, loopOn = false;
  const particles = [];

  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;

    tctx.clearRect(0, 0, trail.width, trail.height);
    tctx.globalCompositeOperation = 'lighter';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 0.035;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      const g = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(${p.c}, ${p.life * 0.55})`);
      g.addColorStop(1, `rgba(${p.c}, 0)`);
      tctx.fillStyle = g;
      tctx.beginPath(); tctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); tctx.fill();
    }
    const settled = Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1 && particles.length === 0;
    if (settled || document.hidden) { loopOn = false; return; }
    requestAnimationFrame(loop);
  };
  const wake = () => { if (!loopOn) { loopOn = true; requestAnimationFrame(loop); } };

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (first) { first = false; rx = mx; ry = my; lastX = mx; lastY = my; }
    document.documentElement.classList.add('cursor-on');
    const dx = mx - lastX, dy = my - lastY;
    if (dx * dx + dy * dy > 49 && particles.length < 36) {
      particles.push({
        x: mx, y: my, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
        r: Math.random() * 2.5 + 2, life: 1, c: Math.random() < .35 ? '255, 45, 149' : '0, 123, 167'
      });
      lastX = mx; lastY = my;
    }
    wake();
  }, { passive: true });

  document.addEventListener('mouseleave', () => document.documentElement.classList.remove('cursor-on'));
  document.addEventListener('mouseenter', () => { if (!first) document.documentElement.classList.add('cursor-on'); });
  window.addEventListener('mousedown', () => ring.classList.add('is-down'));
  window.addEventListener('mouseup', () => ring.classList.remove('is-down'));

  const INTERACTIVE = 'a, button, .btn, [role="button"], summary, label, select';
  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    const textField = t.closest('input, textarea');
    const labelled = t.closest('[data-cursor]');
    const link = t.closest(INTERACTIVE);
    ring.classList.toggle('is-text', !!textField);
    dot.classList.toggle('is-hidden', !!textField);
    ring.classList.toggle('has-label', !!labelled && !textField);
    label.textContent = labelled ? labelled.getAttribute('data-cursor') : '';
    ring.classList.toggle('is-link', !!link && !labelled && !textField);
  });
})();