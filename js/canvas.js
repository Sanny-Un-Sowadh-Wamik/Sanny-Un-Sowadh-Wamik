/**
 * canvas.js — Data Science Cyber Background Animation
 * =====================================================
 * Renders a live canvas animation on all non-home slides.
 *
 * Layers (bottom → top):
 *  1. Pitch-black base fill
 *  2. Blood-red / cyan pulsing grid
 *  3. Falling data streams (matrix-style with DS symbols)
 *  4. Floating data science terms & math symbols
 *  5. Neural-network nodes with animated edges
 *  6. Data packets travelling along node edges
 *
 * Colour palette: #cc0000 (blood red) · #00f0ff (cyan) · #000000 (pitch black)
 */

'use strict';

class DataScienceCanvas {
  /**
   * @param {HTMLCanvasElement} canvas - The target <canvas> element
   */
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    // Animation state
    this.nodes   = [];   // Neural-network nodes
    this.packets = [];   // Data packets travelling edges
    this.symbols = [];   // Floating DS labels
    this.streams = [];   // Matrix-style falling columns
    this.t       = 0;    // Frame counter (used for sine-wave effects)

    this._init();
  }

  /* ─── Initialisation ─────────────────────────── */

  _init() {
    this._resize();
    this._initNodes();
    this._initSymbols();
    this._initStreams();

    // Re-layout on window resize (debounced via RAF)
    window.addEventListener('resize', () => this._resize());

    this._animate();
  }

  /** Resize canvas to match its CSS display size */
  _resize() {
    this.W = this.canvas.width  = this.canvas.offsetWidth  || window.innerWidth;
    this.H = this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
  }

  /* ─── Node (Neural Network) Setup ───────────── */

  _initNodes() {
    this.nodes = [];

    // Scale node count to screen area (min 18 for small screens)
    const count = Math.max(Math.floor((this.W * this.H) / 22000), 18);

    /** Labels drawn next to each node */
    const LABELS = ['σ', 'μ', '∇', 'Σ', 'λ', 'β', 'θ', 'R²', '∂', 'ML', 'AI', 'px', 'y=', '∫', 'ε', 'α'];

    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x:     Math.random() * this.W,
        y:     Math.random() * this.H,
        vx:    (Math.random() - 0.5) * 0.35,   // Horizontal drift speed
        vy:    (Math.random() - 0.5) * 0.35,   // Vertical drift speed
        r:     Math.random() * 3 + 2,           // Base radius
        pulse: Math.random() * Math.PI * 2,    // Phase offset for pulsing
        color: Math.random() > 0.5 ? '#cc0000' : '#00f0ff',
        label: LABELS[Math.floor(Math.random() * LABELS.length)],
      });
    }
  }

  /* ─── Floating Symbol Setup ──────────────────── */

  _initSymbols() {
    this.symbols = [];

    /** Data science & math terms to drift across the screen */
    const TERMS = [
      '01','10','σ²','∇L','P(x)','f(x)','Σwᵢ','argmax','∂/∂θ',
      'KNN','AUC','ROC','NaN','CSV','API','GBM','CNN','RNN',
      'LSTM','SVD','PCA','XGBoost','pandas','numpy',
      '0.99','1.00','loss','y_hat','X_train','sklearn','torch','keras',
    ];

    for (let i = 0; i < 20; i++) {
      this.symbols.push({
        x:     Math.random() * this.W,
        y:     Math.random() * this.H,
        vy:    Math.random() * 0.4 + 0.1,                           // Upward drift
        text:  TERMS[Math.floor(Math.random() * TERMS.length)],
        alpha: Math.random() * 0.4 + 0.1,
        size:  Math.floor(Math.random() * 5 + 8),
        color: Math.random() > 0.6 ? '#cc0000' : '#00f0ff',
      });
    }
  }

  /* ─── Matrix Stream Setup ────────────────────── */

  _initStreams() {
    this.streams = [];

    /** Character pool: binary, kana, and DS symbols */
    const POOL = '01アイウエオカkσ∇Σ';

    for (let i = 0; i < 6; i++) {
      // Each stream is a vertical column of random characters
      const len = Math.floor(Math.random() * 10 + 6);
      this.streams.push({
        x:     Math.random() * this.W,
        y:     -40,                                              // Start above viewport
        speed: Math.random() * 1.2 + 0.5,
        chars: Array.from({ length: len }, () => POOL.charAt(Math.floor(Math.random() * POOL.length))),
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '#cc0000' : '#00f0ff',
      });
    }
  }

  /* ─── Packet Spawning ────────────────────────── */

  /**
   * Spawn a glowing data packet that travels from node[from] → node[to]
   * @param {number} from - Source node index
   * @param {number} to   - Target node index
   */
  _spawnPacket(from, to) {
    this.packets.push({
      from,
      to,
      prog:  0,
      speed: Math.random() * 0.012 + 0.006,
      color: Math.random() > 0.5 ? '#cc0000' : '#00f0ff',
    });
  }

  /* ─── Draw Routines ──────────────────────────── */

  /** Draw the red grid + pulsing cyan accent lines */
  _drawGrid() {
    const { ctx, W, H, t } = this;
    const GRID = 50;

    // Subtle red grid
    ctx.strokeStyle = 'rgba(204,0,0,0.04)';
    ctx.lineWidth   = 0.5;

    for (let x = 0; x < W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Two horizontal accent lines that pulse in brightness
    const pulse = (Math.sin(t * 0.02) + 1) / 2;
    ctx.strokeStyle = `rgba(0,240,255,${0.03 + pulse * 0.04})`;
    ctx.lineWidth   = 1;

    [H * 0.33, H * 0.66].forEach(y => {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    });
  }

  /** Draw neural network nodes and their connecting edges */
  _drawNodes() {
    const { ctx, nodes, W, H } = this;
    const MAX_DIST = Math.min(W, H) * 0.3;  // Only connect nodes within this radius

    /* Edges — drawn first so nodes render on top */
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx   = b.x - a.x;
        const dy   = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= MAX_DIST) continue;

        // Fade out edge as nodes get further apart
        const alpha = (1 - dist / MAX_DIST) * 0.25;

        // Gradient line from node a's colour to node b's colour
        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, a.color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
        grad.addColorStop(1, b.color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 0.8;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Randomly launch a packet along this edge
        if (Math.random() < 0.0008) this._spawnPacket(i, j);
      }
    }

    /* Nodes */
    nodes.forEach(n => {
      n.pulse += 0.035;
      const pr = n.r + Math.sin(n.pulse) * 1.5;   // Pulsing radius

      // Soft radial glow
      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pr * 5);
      grd.addColorStop(0, n.color + 'aa');
      grd.addColorStop(1, n.color + '00');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pr * 5, 0, Math.PI * 2);
      ctx.fill();

      // Solid core
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
      ctx.fill();

      // Tiny label beside node
      ctx.fillStyle = n.color + 'cc';
      ctx.font      = "9px 'Share Tech Mono', monospace";
      ctx.fillText(n.label, n.x + pr + 3, n.y + 3);

      // Move node & bounce off edges
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > this.W) n.vx *= -1;
      if (n.y < 0 || n.y > this.H) n.vy *= -1;
    });
  }

  /** Animate data packets moving along edges */
  _drawPackets() {
    const { ctx, nodes } = this;

    this.packets = this.packets.filter(p => {
      p.prog = Math.min(p.prog + p.speed, 1);

      const a = nodes[p.from];
      const b = nodes[p.to];
      if (!a || !b) return false;

      // Interpolate position along the edge
      const x = a.x + (b.x - a.x) * p.prog;
      const y = a.y + (b.y - a.y) * p.prog;

      // Glowing orb
      const trail = ctx.createRadialGradient(x, y, 0, x, y, 6);
      trail.addColorStop(0, p.color + 'ff');
      trail.addColorStop(1, p.color + '00');

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = trail;
      ctx.fill();

      // Remove packet once it reaches its destination
      return p.prog < 1;
    });
  }

  /** Draw floating data science / math symbol labels */
  _drawSymbols() {
    const { ctx, t } = this;

    this.symbols.forEach(s => {
      // Alpha oscillates slowly per symbol (offset by x position for variety)
      ctx.globalAlpha = s.alpha * (0.6 + Math.sin(t * 0.02 + s.x) * 0.4);
      ctx.fillStyle   = s.color;
      ctx.font        = `${s.size}px 'Share Tech Mono', monospace`;
      ctx.fillText(s.text, s.x, s.y);

      // Drift upward, wrap back to bottom when off-screen
      s.y += s.vy;
      if (s.y > this.H + 20) {
        s.y = -20;
        s.x = Math.random() * this.W;
      }
    });

    ctx.globalAlpha = 1;
  }

  /** Draw falling matrix-style character streams */
  _drawStreams() {
    const ctx = this.ctx;

    this.streams.forEach(s => {
      s.chars.forEach((ch, i) => {
        const y    = s.y + i * 16;
        const fade = Math.max(0, 1 - i / s.chars.length);   // Head is brightest

        ctx.globalAlpha = s.alpha * fade;
        // First character is bright white (leading cell)
        ctx.fillStyle   = i === 0 ? '#ffffff' : s.color;
        ctx.font        = "11px 'Share Tech Mono', monospace";
        ctx.fillText(ch, s.x, y);
      });

      // Move stream down, wrap when fully off-screen
      s.y += s.speed;
      if (s.y > this.H + s.chars.length * 16) {
        s.y = -40;
        s.x = Math.random() * this.W;
      }
    });

    ctx.globalAlpha = 1;
  }

  /* ─── Main Animation Loop ────────────────────── */

  _animate() {
    const { ctx, W, H } = this;

    // Clear frame
    ctx.clearRect(0, 0, W, H);

    // Pitch-black base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // Draw each layer (back to front)
    this._drawGrid();
    this._drawStreams();
    this._drawSymbols();
    this._drawNodes();
    this._drawPackets();

    this.t++;

    // Schedule next frame
    requestAnimationFrame(() => this._animate());
  }
}


/* ─────────────────────────────────────────────────
   Initialise a DataScienceCanvas on every
   .data-canvas element found in the document.
   ───────────────────────────────────────────────── */
document.querySelectorAll('.data-canvas').forEach(canvas => {
  new DataScienceCanvas(canvas);
});
