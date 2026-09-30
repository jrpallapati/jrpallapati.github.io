(() => {
  const still = new URLSearchParams(location.search).has('still');
  const reduce = still || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) document.documentElement.classList.add('still');
  document.getElementById('yr').textContent = new Date().getFullYear();

  // Nav + progress + timeline fill
  const nav = document.querySelector('.nav'), prog = document.querySelector('.progress');
  const tl = document.querySelector('.timeline'), fill = document.querySelector('.timeline-fill');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    prog.style.width = (y / h * 100) + '%';
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    fill.style.height = (p * 100) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (!el.closest('.hero')) el.style.transitionDelay = ((i % 3) * 90) + 'ms';
    io.observe(el);
  });

  // Counters
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
    const t0 = performance.now(), dur = 1800;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - k, 4));
      el.textContent = v.toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    reduce ? (el.textContent = to.toFixed(dec)) : requestAnimationFrame(step);
    cio.unobserve(el);
  }), { threshold: .6 });
  document.querySelectorAll('.count').forEach(el => cio.observe(el));

  // Typewriter
  const typed = document.querySelector('.typed');
  const words = typed.dataset.words.split('|');
  let wi = 0, ci = 0, del = false;
  const type = () => {
    const w = words[wi];
    typed.textContent = w.slice(0, ci);
    if (!del && ci < w.length) ci++;
    else if (!del) { del = true; return setTimeout(type, 1800); }
    else if (ci > 0) ci--;
    else { del = false; wi = (wi + 1) % words.length; }
    setTimeout(type, del ? 30 : 60);
  };
  reduce ? (typed.textContent = words[0]) : setTimeout(type, 1200);

  if (reduce) return;

  // Cursor glow
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

  // Tilt + spotlight
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px'); card.style.setProperty('--my', y + 'px');
      const rx = ((y / r.height) - .5) * -8, ry = ((x / r.width) - .5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // Particle network background
  const c = document.getElementById('bg'), ctx = c.getContext('2d');
  let W, H, pts, mouse = { x: -9999, y: -9999 };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr;
    const n = Math.min(90, Math.floor(innerWidth * innerHeight / 16000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3 * dpr, vy: (Math.random() - .5) * .3 * dpr }));
  };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  const link = 130 * dpr;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140 * dpr) { p.x += dx / d * .8; p.y += dy / d * .8; }
      ctx.fillStyle = 'rgba(160,170,255,.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 * dpr, 0, 7); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < link) {
        ctx.strokeStyle = `rgba(124,92,255,${(1 - d / link) * .22})`;
        ctx.lineWidth = dpr * .8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
})();
