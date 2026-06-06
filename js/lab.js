/**
 * lab.js — Interactive Data Lab
 * ===============================================
 * Author : Sanny Un Sowadh Wamik
 * Site   : WAMIK.DATA — Data Scientist Portfolio
 *
 * Three hands-on data-science mini-tools, shown in a tabbed panel on the
 * DATA LAB slide. Everything is rendered on <canvas> in the site's blood-red /
 * cyan / pitch-black theme.
 *
 *   1. K-Means Clustering — click to scatter points, choose K, watch
 *      Lloyd's algorithm converge (k-means++ seeding, animated iterations).
 *   2. Linear Regression  — click to drop points, a least-squares line plus
 *      R² are fitted live, with residuals drawn to the line.
 *   3. Guess the Correlation — a scored mini-game: a scatter is generated with
 *      a hidden correlation, you slide to guess r, then reveal the truth.
 *
 * Public API:  window.DataLab.onSlideShown(slideEl)
 *   Called by main.js whenever a slide becomes active so the lab can size its
 *   canvases (they have no layout until visible) and pause work when hidden.
 */

'use strict';

(function () {

  /* ─────────────────────────────────────────────
     SHARED HELPERS
     ───────────────────────────────────────────── */

  /** Distinct cluster colours (theme-friendly: cyan, red, amber, green, violet) */
  const PALETTE = ['#00f0ff', '#cc0000', '#ff9d00', '#39ff14', '#b388ff'];

  /**
   * Size a canvas to its parent's box, accounting for device pixel ratio so
   * lines stay crisp. Returns { w, h, ctx } in CSS pixels, or null if the
   * canvas has no layout yet (e.g. its slide is not visible).
   */
  function fitCanvas(canvas) {
    const wrap = canvas.parentElement;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // Draw in CSS-pixel coordinates
    return { w, h, ctx };
  }

  /** Standard-normal random via Box–Muller (used for nice scattered blobs) */
  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /** Map a pointer/click event to canvas-local CSS pixel coordinates */
  function localXY(canvas, e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /** Clear to near-black and draw the faint cyan reference grid */
  function gridBg(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#040406';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0,240,255,0.05)';
    ctx.lineWidth = 1;
    const g = 32;
    for (let x = g; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = g; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  }

  /** Draw a glowing dot (soft radial halo + solid core) */
  function glowDot(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, color + 'cc');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }


  /* ═════════════════════════════════════════════
     MODULE 1 — K-MEANS CLUSTERING
     ═════════════════════════════════════════════ */

  function makeKmeans() {
    const canvas = document.getElementById('labKmeansCanvas');
    if (!canvas) return null;

    const statusEl = document.getElementById('labKmeansStatus');
    const kSlider  = document.getElementById('labK');
    const kVal     = document.getElementById('labKVal');

    let dim   = null;                       // { w, h, ctx }
    let pts   = [];                          // [{ x, y, c }]  c = cluster index (-1 = none)
    let cents = [];                          // [{ x, y, color }]
    let k     = parseInt(kSlider.value, 10);
    let iter  = 0;
    let timer = null;                        // Convergence-animation timeout

    const setStatus = s => { if (statusEl) statusEl.textContent = s; };
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    function stop() { if (timer) { clearTimeout(timer); timer = null; } }

    /** Scatter a fresh set of gaussian blobs so clustering looks satisfying */
    function seed() {
      stop();
      fit();
      if (!dim) return;
      pts = []; cents = [];
      const { w, h } = dim;
      const blobs = Math.max(k, 3);
      for (let b = 0; b < blobs; b++) {
        const cx = w * (0.16 + 0.68 * Math.random());
        const cy = h * (0.16 + 0.68 * Math.random());
        const n  = 10 + Math.floor(Math.random() * 8);
        for (let i = 0; i < n; i++) {
          pts.push({
            x: clamp(cx + gauss() * w * 0.05, 6, w - 6),
            y: clamp(cy + gauss() * h * 0.05, 6, h - 6),
            c: -1,
          });
        }
      }
      setStatus('// ' + pts.length + ' POINTS · READY');
      draw();
    }

    function clearAll() { stop(); pts = []; cents = []; setStatus('// CLEARED'); draw(); }

    /** k-means++ seeding: spread initial centroids proportional to distance² */
    function seedCentroids() {
      const chosen = [pts[Math.floor(Math.random() * pts.length)]];
      while (chosen.length < k) {
        let sum = 0;
        const d2 = pts.map(p => {
          let m = Infinity;
          chosen.forEach(c => { const dx = p.x - c.x, dy = p.y - c.y; const d = dx * dx + dy * dy; if (d < m) m = d; });
          sum += m;
          return m;
        });
        let r = Math.random() * sum, idx = d2.length - 1;
        for (let i = 0; i < d2.length; i++) { r -= d2[i]; if (r <= 0) { idx = i; break; } }
        chosen.push(pts[idx]);
      }
      return chosen.map((p, i) => ({ x: p.x, y: p.y, color: PALETTE[i % PALETTE.length] }));
    }

    /** Assignment step: each point → nearest centroid */
    function assign() {
      pts.forEach(p => {
        let m = Infinity, c = -1;
        cents.forEach((ct, i) => { const dx = p.x - ct.x, dy = p.y - ct.y; const d = dx * dx + dy * dy; if (d < m) { m = d; c = i; } });
        p.c = c;
      });
    }

    /** Update step: move each centroid to its members' mean. Returns total shift. */
    function update() {
      let move = 0;
      cents.forEach((ct, i) => {
        let sx = 0, sy = 0, n = 0;
        pts.forEach(p => { if (p.c === i) { sx += p.x; sy += p.y; n++; } });
        if (n > 0) {
          const nx = sx / n, ny = sy / n;
          move += Math.hypot(nx - ct.x, ny - ct.y);
          ct.x = nx; ct.y = ny;
        } else {
          // Empty cluster — re-seed it onto a random point
          const rp = pts[Math.floor(Math.random() * pts.length)];
          ct.x = rp.x; ct.y = rp.y; move += 999;
        }
      });
      return move;
    }

    /** Run Lloyd's algorithm, animating one iteration at a time */
    function run() {
      k = parseInt(kSlider.value, 10);
      fit();
      if (pts.length < k) { setStatus('// ADD MORE POINTS (need ≥ ' + k + ')'); return; }
      stop();
      cents = seedCentroids();
      iter = 0;

      const stepFn = () => {
        assign();
        draw();
        iter++;
        timer = setTimeout(() => {
          const moved = update();
          draw();
          if (moved < 0.6 || iter >= 14) {
            setStatus('// CONVERGED · ' + iter + ' ITER · K=' + k);
            timer = null;
          } else {
            setStatus('// ITER ' + String(iter).padStart(2, '0') + ' · K=' + k);
            timer = setTimeout(stepFn, 420);
          }
        }, 420);
      };

      setStatus('// RUNNING · K=' + k);
      stepFn();
    }

    function draw() {
      fit();
      if (!dim) return;
      const { ctx, w, h } = dim;
      gridBg(ctx, w, h);

      // Spokes from each point to its centroid
      if (cents.length) {
        ctx.lineWidth = 0.6;
        pts.forEach(p => {
          if (p.c >= 0 && cents[p.c]) {
            const ct = cents[p.c];
            ctx.strokeStyle = ct.color + '33';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ct.x, ct.y); ctx.stroke();
          }
        });
      }

      // Points (coloured by cluster, or dim teal when unassigned)
      pts.forEach(p => glowDot(ctx, p.x, p.y, 3, (p.c >= 0 && cents[p.c]) ? cents[p.c].color : '#3a6f7a'));

      // Centroids as glowing diamonds with a white core
      cents.forEach(ct => {
        ctx.save();
        ctx.translate(ct.x, ct.y);
        ctx.rotate(Math.PI / 4);
        const s = 7;
        ctx.shadowColor = ct.color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = ct.color;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
        ctx.restore();
      });
    }

    /* Events (wired once) */
    canvas.addEventListener('click', e => {
      const { x, y } = localXY(canvas, e);
      pts.push({ x, y, c: -1 });
      setStatus('// ' + pts.length + ' POINTS');
      draw();
    });
    kSlider.addEventListener('input', () => { k = parseInt(kSlider.value, 10); kVal.textContent = k; });
    document.getElementById('labKmeansGen').addEventListener('click', seed);
    document.getElementById('labKmeansRun').addEventListener('click', run);
    document.getElementById('labKmeansClear').addEventListener('click', clearAll);

    return {
      fit,
      draw,
      stop,
      show() { fit(); if (!pts.length) seed(); else draw(); },
    };
  }


  /* ═════════════════════════════════════════════
     MODULE 2 — LINEAR REGRESSION
     ═════════════════════════════════════════════ */

  function makeRegression() {
    const canvas = document.getElementById('labRegCanvas');
    if (!canvas) return null;

    const eqEl = document.getElementById('labRegEq');
    const r2El = document.getElementById('labRegR2');
    const nEl  = document.getElementById('labRegN');

    let dim = null;
    let pts = [];                 // points in data space, x & y ∈ [0, 10]
    const PAD = 34;               // left/bottom gutter for axes

    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    /* Coordinate transforms between data space and canvas pixels */
    const toPx = p => {
      const { w, h } = dim;
      return { x: PAD + (p.x / 10) * (w - PAD - 12), y: (h - PAD) - (p.y / 10) * (h - PAD - 12) };
    };
    const toData = (px, py) => {
      const { w, h } = dim;
      return {
        x: clamp(((px - PAD) / (w - PAD - 12)) * 10, 0, 10),
        y: clamp(((h - PAD - py) / (h - PAD - 12)) * 10, 0, 10),
      };
    };

    /** Seed a noisy upward trend so the line has something to fit */
    function sample() {
      pts = [];
      for (let i = 0; i < 8; i++) {
        const x = clamp(1 + i * 1.05 + Math.random() * 0.3, 0, 10);
        const y = clamp(0.75 * x + 1 + gauss() * 0.8, 0, 10);
        pts.push({ x, y });
      }
      draw();
    }

    function clearAll() { pts = []; draw(); }

    /** Ordinary least-squares fit → { m, b, r2 } (null if undefined) */
    function regress() {
      const n = pts.length;
      if (n < 2) return null;
      let mx = 0, my = 0;
      pts.forEach(p => { mx += p.x; my += p.y; });
      mx /= n; my /= n;
      let sxy = 0, sxx = 0, syy = 0;
      pts.forEach(p => { const dx = p.x - mx, dy = p.y - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; });
      if (sxx === 0) return null;
      const m  = sxy / sxx;
      const b  = my - m * mx;
      const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
      return { m, b, r2 };
    }

    function draw() {
      fit();
      if (!dim) return;
      const { ctx, w, h } = dim;
      gridBg(ctx, w, h);

      // Axes (L-shape)
      ctx.strokeStyle = 'rgba(0,240,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, 8);
      ctx.lineTo(PAD, h - PAD);
      ctx.lineTo(w - 8, h - PAD);
      ctx.stroke();

      const f = regress();
      if (f) {
        const p0 = toPx({ x: 0,  y: f.b });
        const p1 = toPx({ x: 10, y: f.m * 10 + f.b });

        // Residuals (dashed red drop-lines from point to the line)
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(204,0,0,0.55)';
        ctx.lineWidth = 1;
        pts.forEach(p => {
          const pp = toPx(p);
          const pl = toPx({ x: p.x, y: f.m * p.x + f.b });
          ctx.beginPath(); ctx.moveTo(pp.x, pp.y); ctx.lineTo(pl.x, pl.y); ctx.stroke();
        });
        ctx.setLineDash([]);

        // Best-fit line
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
        ctx.shadowBlur = 0;

        eqEl.textContent = 'y = ' + f.m.toFixed(2) + 'x ' + (f.b >= 0 ? '+ ' : '− ') + Math.abs(f.b).toFixed(2);
        r2El.textContent = f.r2.toFixed(3);
      } else {
        eqEl.textContent = 'y = —';
        r2El.textContent = '—';
      }

      // Data points
      pts.forEach(p => { const pp = toPx(p); glowDot(ctx, pp.x, pp.y, 3.2, '#cc0000'); });
      nEl.textContent = String(pts.length);
    }

    /* Events */
    canvas.addEventListener('click', e => {
      fit();
      if (!dim) return;
      const { x, y } = localXY(canvas, e);
      pts.push(toData(x, y));
      draw();
    });
    document.getElementById('labRegSeed').addEventListener('click', sample);
    document.getElementById('labRegClear').addEventListener('click', clearAll);

    return {
      fit,
      draw,
      stop() {},
      show() { fit(); if (!pts.length) sample(); else draw(); },
    };
  }


  /* ═════════════════════════════════════════════
     MODULE 3 — GUESS THE CORRELATION (game)
     ═════════════════════════════════════════════ */

  function makeCorrelation() {
    const canvas = document.getElementById('labCorrCanvas');
    if (!canvas) return null;

    const guess    = document.getElementById('labCorrGuess');
    const gVal     = document.getElementById('labCorrGuessVal');
    const resEl    = document.getElementById('labCorrResult');
    const scoreEl  = document.getElementById('labCorrScore');
    const roundEl  = document.getElementById('labCorrRound');
    const revealEl = document.getElementById('labCorrReveal');

    let dim = null;
    let pts = [];                 // [{ nx, ny }] normalised to [0, 1]
    let truth = null;             // actual Pearson r of the displayed scatter
    let revealed = false;
    let score = 0;
    let round = 1;
    const PAD = 18;

    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    /** Pearson correlation of an [{x, y}] array */
    function pearson(a) {
      const n = a.length;
      let mx = 0, my = 0;
      a.forEach(p => { mx += p.x; my += p.y; });
      mx /= n; my /= n;
      let sxy = 0, sxx = 0, syy = 0;
      a.forEach(p => { const dx = p.x - mx, dy = p.y - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; });
      const d = Math.sqrt(sxx * syy);
      return d === 0 ? 0 : sxy / d;
    }

    const px = p => {
      const { w, h } = dim;
      return { x: PAD + p.nx * (w - PAD * 2), y: (h - PAD) - p.ny * (h - PAD * 2) };
    };

    /** Generate a new scatter with a random hidden correlation */
    function newRound() {
      revealed = false;
      if (revealEl) revealEl.textContent = '';

      const target = Math.random() * 1.9 - 0.95;             // desired r in [-0.95, 0.95]
      const raw = [];
      for (let i = 0; i < 42; i++) {
        const z1 = gauss(), z2 = gauss();
        raw.push({ x: z1, y: target * z1 + Math.sqrt(Math.max(0, 1 - target * target)) * z2 });
      }
      truth = pearson(raw);                                  // truth = actual sample r

      // Normalise to the unit square for display
      let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
      raw.forEach(p => { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); });
      pts = raw.map(p => ({ nx: (p.x - minx) / ((maxx - minx) || 1), ny: (p.y - miny) / ((maxy - miny) || 1) }));

      resEl.textContent = '// GUESS r THEN SUBMIT';
      roundEl.textContent = String(round);
      draw();
    }

    /** Score the current guess and reveal the answer */
    function submit() {
      if (truth === null || revealed) return;
      revealed = true;
      const g = parseInt(guess.value, 10) / 100;
      const err = Math.abs(g - truth);
      const gained = Math.max(0, Math.round(100 - err * 100));
      score += gained;
      scoreEl.textContent = String(score);
      resEl.textContent = '// TRUE r=' + truth.toFixed(2) + ' · YOU ' + g.toFixed(2) + ' · +' + gained + ' PTS';
      if (revealEl) revealEl.textContent = 'r = ' + truth.toFixed(2);
      round++;
      draw();
    }

    function draw() {
      fit();
      if (!dim) return;
      const { ctx, w, h } = dim;
      gridBg(ctx, w, h);

      // On reveal, draw the trend line (regression in normalised space)
      if (revealed && pts.length) {
        let mx = 0, my = 0;
        pts.forEach(p => { mx += p.nx; my += p.ny; });
        mx /= pts.length; my /= pts.length;
        let sxy = 0, sxx = 0;
        pts.forEach(p => { const dx = p.nx - mx, dy = p.ny - my; sxy += dx * dy; sxx += dx * dx; });
        if (sxx > 0) {
          const m = sxy / sxx, b = my - m * mx;
          const A = px({ nx: 0, ny: b }), B = px({ nx: 1, ny: m + b });
          ctx.strokeStyle = '#cc0000';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#cc0000';
          ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      pts.forEach(p => { const q = px(p); glowDot(ctx, q.x, q.y, 2.8, '#00f0ff'); });
    }

    /* Events */
    guess.addEventListener('input', () => { gVal.textContent = (parseInt(guess.value, 10) / 100).toFixed(2); });
    document.getElementById('labCorrSubmit').addEventListener('click', submit);
    document.getElementById('labCorrNew').addEventListener('click', newRound);

    return {
      fit,
      draw,
      stop() {},
      show() { fit(); if (truth === null) newRound(); else draw(); },
    };
  }


  /* ═════════════════════════════════════════════
     SHARED HELPERS FOR THE ANIMATED VISUALS
     ═════════════════════════════════════════════ */

  const lerp = (a, b, t) => a + (b - a) * t;

  /** Map 0–1 → a cyber heat gradient (dark → cyan → red → amber) */
  function heatColor(v) {
    v = clamp(v, 0, 1);
    const stops = [[0, [6, 10, 22]], [0.35, [0, 150, 190]], [0.65, [204, 0, 0]], [1, [255, 180, 40]]];
    for (let i = 0; i < stops.length - 1; i++) {
      const [a, ca] = stops[i], [b, cb] = stops[i + 1];
      if (v <= b) { const t = (v - a) / ((b - a) || 1); return `rgb(${Math.round(lerp(ca[0], cb[0], t))},${Math.round(lerp(ca[1], cb[1], t))},${Math.round(lerp(ca[2], cb[2], t))})`; }
    }
    return 'rgb(255,180,40)';
  }


  /* ═════════════════════════════════════════════
     MODULE 4 — GEOGRAPHIC HEAT MAP (IDW field)
     ═════════════════════════════════════════════ */

  function makeHeatmap() {
    const canvas = document.getElementById('labHeatCanvas'); if (!canvas) return null;
    const info = document.getElementById('labHeatInfo');
    let dim = null, stations = [], sv = [], t = 0, mouse = null;
    const CELL = 15;
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    function gen() {
      stations = [];
      const n = 11 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) stations.push({ fx: 0.07 + 0.86 * Math.random(), fy: 0.07 + 0.86 * Math.random(), base: 0.2 + 0.6 * Math.random(), amp: 0.15 + 0.25 * Math.random(), ph: Math.random() * 6.28, spd: 0.3 + Math.random() * 0.7 });
      if (info) info.textContent = '// ' + stations.length + ' STATIONS';
    }
    function field(px, py) {
      const { w, h } = dim; let num = 0, den = 0;
      for (let i = 0; i < stations.length; i++) { const s = stations[i]; const dx = px - s.fx * w, dy = py - s.fy * h; let d2 = dx * dx + dy * dy; if (d2 < 25) d2 = 25; const wt = 1 / (d2 * d2); num += wt * sv[i]; den += wt; }
      return den ? num / den : 0;
    }
    function tick(dt) { t += dt; }
    function draw() {
      fit(); if (!dim) return; const { ctx, w, h } = dim;
      sv = stations.map(s => clamp(s.base + s.amp * Math.sin(t * s.spd + s.ph), 0, 1));
      for (let y = 0; y < h; y += CELL) for (let x = 0; x < w; x += CELL) { ctx.fillStyle = heatColor(field(x + CELL / 2, y + CELL / 2)); ctx.fillRect(x, y, CELL + 1, CELL + 1); }
      for (let i = 0; i < stations.length; i++) { const s = stations[i]; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(s.fx * w, s.fy * h, 2.5, 0, 6.29); ctx.fill(); }
      if (mouse) {
        const v = field(mouse.x, mouse.y);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 11, 0, 6.29); ctx.stroke();
        if (info) info.textContent = '// VALUE ' + v.toFixed(2);
      }
    }
    canvas.addEventListener('pointermove', e => { mouse = localXY(canvas, e); });
    canvas.addEventListener('pointerleave', () => { mouse = null; if (info) info.textContent = '// ' + stations.length + ' STATIONS'; });
    document.getElementById('labHeatNew').addEventListener('click', gen);
    gen();
    return { fit, draw, tick, stop() {}, show() { fit(); if (!stations.length) gen(); draw(); } };
  }


  /* ═════════════════════════════════════════════
     MODULE 5 — FORCE-DIRECTED NETWORK
     ═════════════════════════════════════════════ */

  function makeNetwork() {
    const canvas = document.getElementById('labNetCanvas'); if (!canvas) return null;
    const info = document.getElementById('labNetInfo');
    let dim = null, nodes = [], edges = [], drag = -1, mouse = null;
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };
    const updateInfo = () => { if (info) info.textContent = '// NODES ' + nodes.length + ' · EDGES ' + edges.length; };

    function addNode(x, y) {
      const { w, h } = dim || { w: 300, h: 200 };
      nodes.push({ x: x != null ? x : w * (0.3 + 0.4 * Math.random()), y: y != null ? y : h * (0.3 + 0.4 * Math.random()), vx: 0, vy: 0, r: 3 + Math.random() * 3, color: Math.random() > 0.5 ? '#00f0ff' : '#cc0000' });
    }
    function gen(n) {
      fit(); nodes = []; edges = [];
      for (let i = 0; i < n; i++) addNode();
      for (let i = 1; i < n; i++) edges.push([i, Math.floor(Math.random() * i)]);   // spanning tree
      for (let k = 0; k < Math.floor(n * 0.5); k++) { const a = Math.floor(Math.random() * n), b = Math.floor(Math.random() * n); if (a !== b && !edges.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) edges.push([a, b]); }
      updateInfo();
    }
    function tick(dt) {
      if (!dim) return; const { w, h } = dim; const step = Math.min(dt * 60, 2);
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
        const d = Math.sqrt(d2), f = 900 / d2, fx = f * dx / d, fy = f * dy / d;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      for (const [i, j] of edges) { const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1; const f = (d - 80) * 0.01, fx = f * dx / d, fy = f * dy / d; a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy; }
      const cx = w / 2, cy = h / 2;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (drag === i && mouse) { n.x = mouse.x; n.y = mouse.y; n.vx = n.vy = 0; continue; }
        n.vx += (cx - n.x) * 0.003; n.vy += (cy - n.y) * 0.003; n.vx *= 0.85; n.vy *= 0.85;
        const sp = Math.hypot(n.vx, n.vy); if (sp > 6) { n.vx *= 6 / sp; n.vy *= 6 / sp; }
        n.x = clamp(n.x + n.vx * step, 6, w - 6); n.y = clamp(n.y + n.vy * step, 6, h - 6);
      }
    }
    function draw() {
      fit(); if (!dim) return; const { ctx, w, h } = dim; gridBg(ctx, w, h);
      ctx.lineWidth = 0.9;
      for (const [i, j] of edges) { const a = nodes[i], b = nodes[j]; const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y); g.addColorStop(0, a.color + '66'); g.addColorStop(1, b.color + '66'); ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      nodes.forEach((n, i) => glowDot(ctx, n.x, n.y, drag === i ? n.r + 2 : n.r, n.color));
    }
    function nodeAt(p) { let best = -1, bd = 256; for (let i = 0; i < nodes.length; i++) { const dx = nodes[i].x - p.x, dy = nodes[i].y - p.y; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } } return best; }
    canvas.addEventListener('pointerdown', e => { mouse = localXY(canvas, e); drag = nodeAt(mouse); if (drag >= 0 && canvas.setPointerCapture) try { canvas.setPointerCapture(e.pointerId); } catch (_) {} });
    canvas.addEventListener('pointermove', e => { mouse = localXY(canvas, e); });
    canvas.addEventListener('pointerup', () => { drag = -1; });
    canvas.addEventListener('pointerleave', () => { drag = -1; });
    document.getElementById('labNetAdd').addEventListener('click', () => { fit(); addNode(); const i = nodes.length - 1; let best = -1, bd = Infinity; for (let k = 0; k < i; k++) { const dx = nodes[k].x - nodes[i].x, dy = nodes[k].y - nodes[i].y; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = k; } } if (best >= 0) edges.push([i, best]); updateInfo(); });
    document.getElementById('labNetShake').addEventListener('click', () => { for (const n of nodes) { n.vx += (Math.random() - 0.5) * 50; n.vy += (Math.random() - 0.5) * 50; } });
    document.getElementById('labNetReset').addEventListener('click', () => gen(16));
    return { fit, draw, tick, stop() {}, show() { fit(); if (!nodes.length) gen(16); else draw(); } };
  }


  /* ═════════════════════════════════════════════
     MODULE 6 — BEESWARM PLOT
     ═════════════════════════════════════════════ */

  function makeBeeswarm() {
    const canvas = document.getElementById('labBeeCanvas'); if (!canvas) return null;
    const info = document.getElementById('labBeeInfo');
    let dim = null, pts = [], hover = -1, mouse = null;
    const GROUPS = [{ name: 'A', color: '#00f0ff', mean: 0.34 }, { name: 'B', color: '#cc0000', mean: 0.62 }, { name: 'C', color: '#ff9d00', mean: 0.5 }];
    const PAD = 30;
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    function gen() {
      fit(); if (!dim) { pts = []; return; }
      pts = [];
      GROUPS.forEach((g, gi) => { const n = 18 + Math.floor(Math.random() * 8); for (let i = 0; i < n; i++) { const v = clamp(g.mean + gauss() * 0.13, 0.02, 0.98); pts.push({ v, g: gi, color: g.color, x: Math.random() * dim.w, y: Math.random() * dim.h, tx: 0, ty: 0 }); } });
      layout(); if (info) info.textContent = '// ' + pts.length + ' POINTS · 3 GROUPS';
    }
    function layout() {
      const { w, h } = dim; const r = 4.2, laneH = (h - PAD * 2) / GROUPS.length;
      GROUPS.forEach((g, gi) => {
        const lane = PAD + laneH * (gi + 0.5);
        const gp = pts.filter(p => p.g === gi).sort((a, b) => a.v - b.v), placed = [];
        gp.forEach(p => {
          p.tx = PAD + p.v * (w - PAD * 2);
          let y = lane, k = 0, dir = 1;
          while (placed.some(q => { const dx = q.tx - p.tx, dy = q.ty - y; return dx * dx + dy * dy < (r * 2) * (r * 2); })) { k++; y = lane + dir * Math.ceil(k / 2) * (r * 1.7); dir *= -1; if (Math.abs(y - lane) > laneH / 2 - r) { y = lane + (Math.random() - 0.5) * (laneH - 2 * r); break; } }
          p.ty = y; placed.push(p);
        });
      });
    }
    function tick(dt) { const s = Math.min(dt * 8, 0.3); for (const p of pts) { p.x += (p.tx - p.x) * s; p.y += (p.ty - p.y) * s; } }
    function draw() {
      fit(); if (!dim) return; const { ctx, w, h } = dim; gridBg(ctx, w, h);
      const laneH = (h - PAD * 2) / GROUPS.length;
      ctx.font = "10px 'Share Tech Mono', monospace";
      GROUPS.forEach((g, gi) => { const lane = PAD + laneH * (gi + 0.5); ctx.fillStyle = g.color + 'cc'; ctx.fillText('GROUP ' + g.name, 6, lane - laneH / 2 + 13); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(PAD, lane); ctx.lineTo(w - PAD, lane); ctx.stroke(); });
      hover = -1; if (mouse) { let bd = 90; for (let i = 0; i < pts.length; i++) { const dx = pts[i].x - mouse.x, dy = pts[i].y - mouse.y; const d = dx * dx + dy * dy; if (d < bd) { bd = d; hover = i; } } }
      pts.forEach((p, i) => glowDot(ctx, p.x, p.y, i === hover ? 6 : 3.4, p.color));
      if (hover >= 0 && info) { const p = pts[hover]; info.textContent = '// GROUP ' + GROUPS[p.g].name + ' · VALUE ' + p.v.toFixed(2); }
    }
    canvas.addEventListener('pointermove', e => { mouse = localXY(canvas, e); });
    canvas.addEventListener('pointerleave', () => { mouse = null; if (info) info.textContent = '// ' + pts.length + ' POINTS · 3 GROUPS'; });
    document.getElementById('labBeeNew').addEventListener('click', gen);
    return { fit, draw, tick, stop() {}, show() { fit(); if (!pts.length) gen(); else { layout(); draw(); } } };
  }


  /* ═════════════════════════════════════════════
     MODULE 7 — VIOLIN PLOT (KDE)
     ═════════════════════════════════════════════ */

  function makeViolin() {
    const canvas = document.getElementById('labViolinCanvas'); if (!canvas) return null;
    const info = document.getElementById('labViolinInfo');
    let dim = null, cats = [], t = 0, prog = 0, hover = -1, mouse = null;
    const COLORS = ['#00f0ff', '#cc0000', '#ff9d00', '#39ff14'];
    const PAD = 26;
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    function gen() {
      cats = []; const n = 4;
      for (let i = 0; i < n; i++) {
        const samples = [], m1 = 0.3 + Math.random() * 0.4, bimodal = Math.random() > 0.5, m2 = clamp(m1 + (Math.random() > 0.5 ? 0.28 : -0.28), 0.1, 0.9), sd = 0.06 + Math.random() * 0.05;
        for (let k = 0; k < 120; k++) { let v = (bimodal && Math.random() > 0.5) ? m2 + gauss() * sd : m1 + gauss() * sd; samples.push(clamp(v, 0, 1)); }
        const G = 46, bw = 0.05, dens = []; let mx = 0;
        for (let gi = 0; gi < G; gi++) { const y = gi / (G - 1); let s = 0; for (const v of samples) { const u = (y - v) / bw; s += Math.exp(-0.5 * u * u); } dens.push(s); if (s > mx) mx = s; }
        const sorted = [...samples].sort((a, b) => a - b);
        cats.push({ color: COLORS[i % COLORS.length], dens: dens.map(d => d / (mx || 1)), med: sorted[sorted.length >> 1], label: String.fromCharCode(65 + i) });
      }
      prog = 0; if (info) info.textContent = '// ' + n + ' DISTRIBUTIONS';
    }
    function tick(dt) { t += dt; if (prog < 1) prog = Math.min(1, prog + dt * 1.6); }
    function draw() {
      fit(); if (!dim) return; const { ctx, w, h } = dim; gridBg(ctx, w, h);
      const n = cats.length, slot = (w - PAD * 2) / n;
      hover = -1; if (mouse) { const idx = Math.floor((mouse.x - PAD) / slot); if (idx >= 0 && idx < n) hover = idx; }
      cats.forEach((c, ci) => {
        const cx = PAD + slot * (ci + 0.5), maxW = slot * 0.42 * (hover === ci ? 1.08 : 1), G = c.dens.length, breathe = 1 + 0.05 * Math.sin(t * 1.5 + ci);
        ctx.beginPath();
        for (let gi = 0; gi < G; gi++) { const y = (h - PAD) - (gi / (G - 1)) * (h - PAD * 2), wd = c.dens[gi] * maxW * prog * breathe; gi === 0 ? ctx.moveTo(cx - wd, y) : ctx.lineTo(cx - wd, y); }
        for (let gi = G - 1; gi >= 0; gi--) { const y = (h - PAD) - (gi / (G - 1)) * (h - PAD * 2), wd = c.dens[gi] * maxW * prog * breathe; ctx.lineTo(cx + wd, y); }
        ctx.closePath();
        const grd = ctx.createLinearGradient(cx - maxW, 0, cx + maxW, 0); grd.addColorStop(0, c.color + '12'); grd.addColorStop(0.5, c.color + '55'); grd.addColorStop(1, c.color + '12');
        ctx.fillStyle = grd; ctx.fill();
        ctx.strokeStyle = c.color; ctx.lineWidth = hover === ci ? 2 : 1.2; ctx.shadowColor = c.color; ctx.shadowBlur = hover === ci ? 12 : 6; ctx.stroke(); ctx.shadowBlur = 0;
        const my = (h - PAD) - c.med * (h - PAD * 2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - maxW * 0.5, my); ctx.lineTo(cx + maxW * 0.5, my); ctx.stroke();
        ctx.fillStyle = c.color + 'cc'; ctx.font = "10px 'Share Tech Mono', monospace"; ctx.textAlign = 'center'; ctx.fillText(c.label, cx, h - 8); ctx.textAlign = 'start';
      });
      if (hover >= 0 && info) info.textContent = '// DIST ' + cats[hover].label + ' · MEDIAN ' + cats[hover].med.toFixed(2);
    }
    canvas.addEventListener('pointermove', e => { mouse = localXY(canvas, e); });
    canvas.addEventListener('pointerleave', () => { mouse = null; if (info) info.textContent = '// ' + cats.length + ' DISTRIBUTIONS'; });
    document.getElementById('labViolinNew').addEventListener('click', gen);
    gen();
    return { fit, draw, tick, stop() {}, show() { fit(); if (!cats.length) gen(); prog = 0; draw(); } };
  }


  /* ═════════════════════════════════════════════
     MODULE 8 — CONVEX (VORONOI) TREEMAP + Lloyd relaxation
     ═════════════════════════════════════════════ */

  function makeTreemap() {
    const canvas = document.getElementById('labTreeCanvas'); if (!canvas) return null;
    const info = document.getElementById('labTreeInfo');
    let dim = null, seeds = [], cells = [], hover = -1, mouse = null;
    const LABELS = ['Python', 'SQL', 'ML', 'MLflow', 'FastAPI', 'Docker', 'pandas', 'GeoPandas', 'SHAP', 'Spark', 'R', 'Plotly'];
    const fit = () => { const d = fitCanvas(canvas); if (d) dim = d; };

    function gen() {
      fit(); if (!dim) { seeds = []; return; }
      const { w, h } = dim, n = 9 + Math.floor(Math.random() * 4); seeds = [];
      for (let i = 0; i < n; i++) seeds.push({ x: w * (0.12 + 0.76 * Math.random()), y: h * (0.12 + 0.76 * Math.random()), val: 0.3 + Math.random() * 0.7, color: PALETTE[i % PALETTE.length], label: LABELS[i % LABELS.length] });
      compute(); if (info) info.textContent = '// ' + n + ' CELLS';
    }
    function clip(poly, nx, ny, c) {   // keep points where nx*x + ny*y <= c
      const out = [], N = poly.length;
      for (let i = 0; i < N; i++) {
        const a = poly[i], b = poly[(i + 1) % N], da = nx * a.x + ny * a.y - c, db = nx * b.x + ny * b.y - c;
        if (da <= 0) out.push(a);
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) { const t = da / (da - db); out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }); }
      }
      return out;
    }
    function centroid(poly) {
      let a = 0, cx = 0, cy = 0; const N = poly.length;
      for (let i = 0; i < N; i++) { const p = poly[i], q = poly[(i + 1) % N], cr = p.x * q.y - q.x * p.y; a += cr; cx += (p.x + q.x) * cr; cy += (p.y + q.y) * cr; }
      a *= 0.5;
      if (Math.abs(a) < 1e-6) { let sx = 0, sy = 0; poly.forEach(p => { sx += p.x; sy += p.y; }); return { x: sx / N, y: sy / N, area: 0 }; }
      return { x: cx / (6 * a), y: cy / (6 * a), area: Math.abs(a) };
    }
    function compute() {
      const { w, h } = dim; cells = [];
      for (let i = 0; i < seeds.length; i++) {
        let poly = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
        const si = seeds[i];
        for (let j = 0; j < seeds.length && poly.length; j++) {
          if (i === j) continue; const sj = seeds[j];
          const nx = sj.x - si.x, ny = sj.y - si.y, c = ((sj.x * sj.x + sj.y * sj.y) - (si.x * si.x + si.y * si.y)) / 2;
          poly = clip(poly, nx, ny, c);
        }
        cells.push({ poly, c: centroid(poly), seed: si });
      }
    }
    function tick(dt) {
      if (!dim || !cells.length) return; const s = Math.min(dt * 1.4, 0.12);
      for (const cell of cells) { if (cell.c.area > 0) { cell.seed.x = lerp(cell.seed.x, cell.c.x, s); cell.seed.y = lerp(cell.seed.y, cell.c.y, s); } }
      compute();
    }
    function pip(poly, px, py) { let inside = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if (((a.y > py) !== (b.y > py)) && (px < (b.x - a.x) * (py - a.y) / (b.y - a.y) + a.x)) inside = !inside; } return inside; }
    function draw() {
      fit(); if (!dim) return; const { ctx, w, h } = dim; ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#040406'; ctx.fillRect(0, 0, w, h);
      hover = -1; if (mouse) for (let i = 0; i < cells.length; i++) if (cells[i].poly.length > 2 && pip(cells[i].poly, mouse.x, mouse.y)) { hover = i; break; }
      cells.forEach((cell, i) => {
        if (cell.poly.length < 3) return; const col = cell.seed.color, on = i === hover;
        ctx.beginPath(); ctx.moveTo(cell.poly[0].x, cell.poly[0].y); for (let k = 1; k < cell.poly.length; k++) ctx.lineTo(cell.poly[k].x, cell.poly[k].y); ctx.closePath();
        ctx.fillStyle = col + (on ? '55' : '2a'); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = on ? 2.2 : 1.2; ctx.shadowColor = col; ctx.shadowBlur = on ? 14 : 5; ctx.stroke(); ctx.shadowBlur = 0;
        if (cell.c.area > 1400) { ctx.fillStyle = '#fff'; ctx.font = "10px 'Share Tech Mono', monospace"; ctx.textAlign = 'center'; ctx.fillText(cell.seed.label, cell.c.x, cell.c.y); ctx.textAlign = 'start'; }
      });
      if (hover >= 0 && info) { const total = cells.reduce((s, c) => s + c.c.area, 0) || 1; info.textContent = '// ' + cells[hover].seed.label.toUpperCase() + ' · ' + Math.round(cells[hover].c.area / total * 100) + '% AREA'; }
    }
    canvas.addEventListener('pointermove', e => { mouse = localXY(canvas, e); });
    canvas.addEventListener('pointerleave', () => { mouse = null; if (info) info.textContent = '// ' + cells.length + ' CELLS'; });
    document.getElementById('labTreeNew').addEventListener('click', gen);
    return { fit, draw, tick, stop() {}, show() { fit(); if (!seeds.length) gen(); else { compute(); draw(); } } };
  }


  /* ═════════════════════════════════════════════
     CONTROLLER — tabs + lifecycle + animation loop
     ═════════════════════════════════════════════ */

  const DataLab = (function () {
    let inited = false;
    let current = 'kmeans';
    const mods = {};

    // Single shared RAF loop — only runs while an *animated* tab is on screen
    let rafId = null, lastT = 0;
    function frame(now) {
      const dt = Math.min((now - lastT) / 1000, 0.05); lastT = now;
      const m = mods[current];
      if (m && m.tick) { m.tick(dt); m.draw(); }
      rafId = requestAnimationFrame(frame);
    }
    function startLoop() { if (rafId == null) { lastT = performance.now(); rafId = requestAnimationFrame(frame); } }
    function stopLoop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

    function init() {
      if (inited) return;
      inited = true;

      mods.kmeans      = makeKmeans();
      mods.regression  = makeRegression();
      mods.correlation = makeCorrelation();
      mods.heatmap     = makeHeatmap();
      mods.network     = makeNetwork();
      mods.beeswarm    = makeBeeswarm();
      mods.violin      = makeViolin();
      mods.treemap     = makeTreemap();

      document.querySelectorAll('.lab-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.lab));
      });

      // Re-fit the visible module on resize (debounced to one frame)
      let raf = null;
      window.addEventListener('resize', () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { const m = mods[current]; if (m) { m.fit(); m.draw(); } });
      });
    }

    function syncLoop() { const m = mods[current]; if (m && m.tick) startLoop(); else stopLoop(); }

    function switchTab(name) {
      if (!mods[name]) return;
      current = name;

      document.querySelectorAll('.lab-tab').forEach(b => b.classList.toggle('active', b.dataset.lab === name));
      document.querySelectorAll('.lab-panel').forEach(p => p.classList.toggle('active', p.dataset.lab === name));

      if (mods.kmeans && name !== 'kmeans') mods.kmeans.stop();   // Don't animate hidden clustering
      mods[name].show();
      syncLoop();
    }

    /**
     * Called by main.js when any slide becomes active.
     * Sizes/draws & animates the lab when on screen; pauses everything otherwise.
     */
    function onSlideShown(slide) {
      const isLab = slide && slide.querySelector && slide.querySelector('#labKmeansCanvas');
      if (!isLab) { stopLoop(); if (mods.kmeans) mods.kmeans.stop(); return; }
      init();
      const m = mods[current];
      if (m) m.show();
      syncLoop();
    }

    return { onSlideShown };
  })();

  window.DataLab = DataLab;

})();
