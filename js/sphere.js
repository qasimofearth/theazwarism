/* =========================================
   AZWAR ALI — Light Works
   CSS 3D Photo Sphere  ·  No WebGL
   ========================================= */

/* Full-res paths — used by lightbox */
window.PORTFOLIO_IMAGES = [
  'Fashion%20Photos%20/Portfolio/images/DSCF3710.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF3671.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF1886.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF0536-Enhanced-NR.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF7108-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF8269%203.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF6199-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF9204.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF5628-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF7293-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF8342.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF5787-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF1438-Enhanced-NR-1.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF8393.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF8257%203.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF5917-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/RNI-Films-IMG-1CFBD945-206D-489A-BE13-8BEFEF556B88.JPG',
  'Fashion%20Photos%20/Portfolio/images/DSCF6395.png',
  'Fashion%20Photos%20/Portfolio/images/IMG_9282.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF6400.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF3800.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF3802.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF3779.png',
  'Fashion%20Photos%20/Portfolio/images/RNI-Films-IMG-CD160AFD-9964-4C12-BBCA-1C058EC22E91.JPG',
  'Fashion%20Photos%20/Portfolio/images/DSCF8952.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF1343-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/DSCF1778.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF1867.png',
  'Fashion%20Photos%20/Portfolio/images/DOGUE23.png',
  'Fashion%20Photos%20/Portfolio/images/DSCF1865-Enhanced-NR.jpg',
  'Fashion%20Photos%20/Portfolio/images/RNI-Films-IMG-71D295A4-0F19-42ED-BFB4-F84F51330F5D.JPG',
  'Fashion%20Photos%20/Portfolio/images/DSCF3697.png',
  'Fashion%20Photos%20/Portfolio/images/IMG_9025j.png',
  'Fashion%20Photos%20/Portfolio/images/60x25.png',
  'Fashion%20Photos%20/Portfolio/images/8.jpg',
  'Fashion%20Photos%20/Portfolio/images/14.jpg',
];

/* Convert full-res path → compressed thumbnail (700px JPEG) */
function thumbUrl(src) {
  return src.replace('/images/', '/thumbs/').replace(/\.\w+$/, '.jpg');
}

class PhotoSphere {
  constructor(sceneId, worldId, onClickCb) {
    this.scene     = document.getElementById(sceneId);
    this.world     = document.getElementById(worldId);
    this.onClickCb = onClickCb;

    this.rotY       = 0;
    this.rotX       = 0;
    this.targetRotY = 0;
    this.targetRotX = 0;

    this.isDragging   = false;
    this.lastX        = 0;
    this.lastY        = 0;
    this.autoOn       = true;
    this.draggedFar   = false;
    this.downX        = 0;
    this.downY        = 0;

    this.cursorActive = false;
    this.baseRotY     = 0;

    this.normals = [];

    this._calcSize();
    this._buildCards();
    this._bindEvents();
    this._tick();
  }

  _calcSize() {
    const h = this.scene.offsetHeight;
    const w = this.scene.offsetWidth;
    this.radius = Math.max(160, Math.min(280, Math.min(w, h) * 0.30));
    this.cardW  = Math.max(72, this.radius * 0.40) | 0;
    this.scene.style.perspective = (this.radius * 5) + 'px';
  }

  _fibPoint(i, n) {
    const golden    = Math.PI * (3 - Math.sqrt(5));
    const y         = 1 - (i / (n - 1)) * 2;
    const azimuth   = golden * i * (180 / Math.PI);
    const elevation = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI);
    return { azimuth, elevation };
  }

  _buildCards() {
    const imgs = window.PORTFOLIO_IMAGES;
    const n    = imgs.length;
    this.cards   = [];
    this.normals = [];

    imgs.forEach((src, i) => {
      const { azimuth, elevation } = this._fibPoint(i, n);
      const azRad = azimuth   * Math.PI / 180;
      const elRad = elevation * Math.PI / 180;

      // Unit outward normal — CSS Y is downward so negate elevation
      const ux = Math.cos(elRad) * Math.sin(azRad);
      const uy = -Math.sin(elRad);
      const uz = Math.cos(elRad) * Math.cos(azRad);
      this.normals.push([ux, uy, uz]);

      const card = document.createElement('div');
      card.className   = 'sphere-card';
      card.style.width = this.cardW + 'px';
      // Initial position (rotY=0, rotX=0) — updated every frame in _updateCards
      card.style.transform = `translate3d(${ux * this.radius}px,${uy * this.radius}px,${uz * this.radius}px) translateX(-50%) translateY(-50%)`;
      card.style.opacity   = uz > 0 ? '1' : '0';

      const inner = document.createElement('div');
      inner.className = 'sphere-card-inner';

      const img = document.createElement('img');
      img.src       = thumbUrl(src);
      img.alt       = 'Azwar Ali';
      img.loading   = i < 9 ? 'eager' : 'lazy';
      img.draggable = false;

      inner.appendChild(img);
      card.appendChild(inner);

      card.addEventListener('click', () => {
        if (this.draggedFar) return;
        this.onClickCb(i);
      });

      this.world.appendChild(card);
      this.cards.push(card);
    });
  }

  _bindEvents() {
    const sc = this.scene;

    /* ── Cursor control ── */
    sc.addEventListener('mouseenter', () => {
      if (this.isDragging) return;
      this.cursorActive = true;
      this.autoOn       = false;
      this.baseRotY     = this.rotY;
    });

    sc.addEventListener('mousemove', e => {
      if (this.isDragging) return;
      if (!this.cursorActive) return;
      const rect = sc.getBoundingClientRect();
      const nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      this.targetRotY = this.baseRotY + nx * 120;
      this.targetRotX = Math.max(-22, Math.min(22, -ny * 22));
    });

    sc.addEventListener('mouseleave', () => {
      this.cursorActive = false;
      this.targetRotX   = 0;
      clearTimeout(this._rt);
      this._rt = setTimeout(() => {
        this.baseRotY = this.rotY;
        this.autoOn   = true;
      }, 900);
    });

    /* ── Drag ── */
    sc.addEventListener('mousedown', e => {
      this.isDragging   = true;
      this.cursorActive = false;
      this.draggedFar   = false;
      this.downX        = this.lastX = e.clientX;
      this.downY        = this.lastY = e.clientY;
      this.autoOn       = false;
      sc.style.cursor   = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.targetRotY += dx * 0.35;
      this.targetRotX  = Math.max(-28, Math.min(28, this.targetRotX + dy * 0.35));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (Math.abs(e.clientX - this.downX) > 5 || Math.abs(e.clientY - this.downY) > 5) {
        this.draggedFar = true;
      }
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      sc.style.cursor = 'grab';
      clearTimeout(this._rt);
      this._rt = setTimeout(() => {
        this.baseRotY = this.rotY;
        this.autoOn   = true;
      }, 2400);
    });

    /* ── Touch ── */
    sc.addEventListener('touchstart', e => {
      this.isDragging   = true;
      this.cursorActive = false;
      this.draggedFar   = false;
      this.downX = this.lastX = e.touches[0].clientX;
      this.downY = this.lastY = e.touches[0].clientY;
      this.autoOn = false;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.lastX;
      const dy = e.touches[0].clientY - this.lastY;
      this.targetRotY += dx * 0.35;
      this.targetRotX  = Math.max(-28, Math.min(28, this.targetRotX + dy * 0.35));
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      if (Math.abs(e.touches[0].clientX - this.downX) > 8 ||
          Math.abs(e.touches[0].clientY - this.downY) > 8) {
        this.draggedFar = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      clearTimeout(this._rt);
      this._rt = setTimeout(() => { this.autoOn = true; }, 2400);
    });

    /* ── Resize ── */
    window.addEventListener('resize', () => {
      this._calcSize();
      this.cards.forEach(card => { card.style.width = this.cardW + 'px'; });
    });
  }

  /*
   * Per-frame: rotate each card's POSITION mathematically.
   * The card element itself has NO rotation — always faces camera flat.
   * Only translate3d moves — GPU compositing handles this efficiently.
   */
  _updateCards() {
    const ry   = this.rotY * Math.PI / 180;
    const rx   = this.rotX * Math.PI / 180;
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const r    = this.radius;

    this.cards.forEach((card, i) => {
      const [ux, uy, uz] = this.normals[i];

      // Rotate unit normal by Rx(rx) * Ry(ry) — same order as old CSS transform
      // Step 1: rotateY
      const px_ry = ux * cosY + uz * sinY;
      const pz_ry = -ux * sinY + uz * cosY;
      // Step 2: rotateX
      const finalX = px_ry;
      const finalY = uy * cosX - pz_ry * sinX;
      const finalZ = uy * sinX + pz_ry * cosX;

      // Update position — no rotation on card, always flat to camera
      card.style.transform =
        `translate3d(${(finalX * r).toFixed(1)}px,${(finalY * r).toFixed(1)}px,${(finalZ * r).toFixed(1)}px) translateX(-50%) translateY(-50%)`;

      // Show front hemisphere, hide back
      const vis = finalZ > 0 ? '1' : '0';
      if (card.style.opacity !== vis) card.style.opacity = vis;
    });
  }

  _tick() {
    this._raf = requestAnimationFrame(() => this._tick());

    if (this.autoOn) this.targetRotY += 0.18;

    this.rotY += (this.targetRotY - this.rotY) * 0.06;
    this.rotX += (this.targetRotX - this.rotX) * 0.06;

    const dy     = Math.abs(this.targetRotY - this.rotY);
    const dx     = Math.abs(this.targetRotX - this.rotX);
    const moving = this.autoOn || dy > 0.003 || dx > 0.003;
    if (!moving) return;

    this._updateCards();
  }

  pause()  { cancelAnimationFrame(this._raf); }
  resume() { if (!this._raf) this._tick(); else { cancelAnimationFrame(this._raf); this._tick(); } }
}

window.PhotoSphere = PhotoSphere;
