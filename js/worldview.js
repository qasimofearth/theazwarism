/* =========================================
   AZWAR ALI — Light Works
   World View  ·  Three.js
   ========================================= */

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

const SPHERE_R   = 3.1;
const HOVER_SCALE = 2.0;
const HOVER_LIFT  = 0.55;

class WorldView {
  constructor(containerId, onClickCb) {
    this.container  = document.getElementById(containerId);
    this.onClickCb  = onClickCb;
    this.w = this.container.offsetWidth;
    this.h = this.container.offsetHeight;

    this.mouse       = new THREE.Vector2(-5, -5);
    this.raycaster   = new THREE.Raycaster();
    this.hoveredMesh = null;
    this.meshes      = [];

    this.isDragging  = false;
    this.dragStart   = { x: 0, y: 0 };
    this.rotY        = 0;
    this.rotX        = 0;
    this.targetRotY  = 0;
    this.targetRotX  = 0;
    this.autoOn      = true;
    this.autoSpeed   = 0.0012;

    this._init();
    this._buildSphere();
    this._addParticles();
    this._addEquatorRing();
    this._bindEvents();
    this._animate();
  }

  /* ---- Scene bootstrap ---- */
  _init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(48, this.w / this.h, 0.1, 200);
    this.camera.position.z = 8.0;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);

    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  /* ---- Fibonacci sphere distribution ---- */
  _fibPoint(i, n, r) {
    const phi   = Math.PI * (3 - Math.sqrt(5));
    const y     = 1 - (i / (n - 1)) * 2;
    const rad   = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    return new THREE.Vector3(
      Math.cos(theta) * rad * r,
      y * r,
      Math.sin(theta) * rad * r
    );
  }

  /* ---- Orient plane so its +Z (normal) faces outward from sphere ---- */
  _orientPlane(mesh, pos) {
    const out = pos.clone().normalize();
    const worldUp = Math.abs(out.y) > 0.97
      ? new THREE.Vector3(1, 0, 0)
      : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, out).normalize();
    const up    = new THREE.Vector3().crossVectors(out, right).normalize();
    const m     = new THREE.Matrix4().makeBasis(right, up, out);
    mesh.setRotationFromMatrix(m);
  }

  /* ---- Build photo sphere ---- */
  _buildSphere() {
    const loader = new THREE.TextureLoader();
    const n = window.PORTFOLIO_IMAGES.length;

    window.PORTFOLIO_IMAGES.forEach((src, i) => {
      const pos   = this._fibPoint(i, n, SPHERE_R);
      const sz    = 0.72 + (Math.random() * 0.14);       // slight organic size variation
      const geo   = new THREE.PlaneGeometry(sz * 0.82, sz);

      const mat = new THREE.MeshBasicMaterial({
        color: 0x181816,
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this._orientPlane(mesh, pos);

      mesh.userData = {
        index:        i,
        src:          src,
        basePos:      pos.clone(),
        hoverPos:     pos.clone().normalize().multiplyScalar(SPHERE_R + HOVER_LIFT),
        hovered:      false,
        targetScale:  1,
        currentScale: 1,
        hoverT:       0,
      };

      this.meshes.push(mesh);
      this.group.add(mesh);

      /* Staggered texture load + fade-in */
      const delay = i * 55;
      loader.load(src, (tex) => {
        tex.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
        mat.map   = tex;
        mat.color.set(0xffffff);
        mat.needsUpdate = true;

        setTimeout(() => {
          const step = () => {
            mat.opacity = Math.min(1, mat.opacity + 0.04);
            mat.needsUpdate = true;
            if (mat.opacity < 1) requestAnimationFrame(step);
          };
          step();
        }, delay);
      }, undefined, () => {
        // placeholder on error
        mat.opacity = 0.12;
      });
    });
  }

  /* ---- Particle starfield ---- */
  _addParticles() {
    const count = 700;
    const pos   = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r     = 9 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xc9a97e,
      transparent: true,
      opacity: 0.30,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    /* Tiny bright core glow */
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc9a97e,
      transparent: true,
      opacity: 0.07,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), coreMat);
    this.group.add(core);
    this.core = core;
  }

  /* ---- Equator ring ---- */
  _addEquatorRing() {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc9a97e,
      transparent: true,
      opacity: 0.07,
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(SPHERE_R * 0.95, 0.012, 6, 100),
      mat
    );
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);
    this.ring = ring;
    this.ringMat = mat;
  }

  /* ---- Events ---- */
  _bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('mousemove', e => this._onMove(e));
    el.addEventListener('mousedown', e => this._onDown(e));
    window.addEventListener('mouseup',  () => this._onUp());
    el.addEventListener('click',     e => this._onClick(e));
    el.addEventListener('touchstart', e => this._onTouchStart(e), { passive: true });
    el.addEventListener('touchmove',  e => this._onTouchMove(e),  { passive: true });
    el.addEventListener('touchend',   e => this._onTouchEnd(e));
    window.addEventListener('resize', () => this._onResize());
  }

  _updateMouse(clientX, clientY) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x =  ((clientX - r.left) / r.width)  * 2 - 1;
    this.mouse.y = -((clientY - r.top)  / r.height) * 2 + 1;
  }

  _raycastHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits   = this.raycaster.intersectObjects(this.meshes);
    const newHit = hits.length ? hits[0].object : null;

    if (newHit !== this.hoveredMesh) {
      if (this.hoveredMesh) {
        this.hoveredMesh.userData.targetScale = 1;
        this.hoveredMesh.userData.hovered     = false;
      }
      this.hoveredMesh = newHit;
      if (newHit) {
        newHit.userData.targetScale = HOVER_SCALE;
        newHit.userData.hovered     = true;
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        this.renderer.domElement.style.cursor = 'grab';
      }
    }
  }

  _onMove(e) {
    this._updateMouse(e.clientX, e.clientY);
    if (this.isDragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.targetRotY += dx * 0.0042;
      this.targetRotX  = Math.max(-1.0, Math.min(1.0, this.targetRotX + dy * 0.0042));
      this.dragStart   = { x: e.clientX, y: e.clientY };
    }
    this._raycastHover();
  }

  _onDown(e) {
    this.isDragging = true;
    this.dragStart  = { x: e.clientX, y: e.clientY };
    this.autoOn     = false;
    this.renderer.domElement.style.cursor = 'grabbing';
    // Hide drag hint
    const hint = document.getElementById('worldHint');
    if (hint) hint.style.opacity = '0';
  }

  _onUp() {
    this.isDragging = false;
    this.renderer.domElement.style.cursor = 'grab';
    clearTimeout(this._resumeT);
    this._resumeT = setTimeout(() => { this.autoOn = true; }, 2800);
  }

  _onClick(e) {
    if (Math.abs(e.clientX - this.dragStart.x) > 4 ||
        Math.abs(e.clientY - this.dragStart.y) > 4) return;
    this._updateMouse(e.clientX, e.clientY);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.meshes);
    if (hits.length) this.onClickCb(hits[0].object.userData.index);
  }

  _onTouchStart(e) {
    this.isDragging = true;
    this.dragStart  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    this.autoOn     = false;
    const hint = document.getElementById('worldHint');
    if (hint) hint.style.opacity = '0';
  }

  _onTouchMove(e) {
    if (!this.isDragging) return;
    const dx = e.touches[0].clientX - this.dragStart.x;
    const dy = e.touches[0].clientY - this.dragStart.y;
    this.targetRotY += dx * 0.0042;
    this.targetRotX  = Math.max(-1.0, Math.min(1.0, this.targetRotX + dy * 0.0042));
    this.dragStart   = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  _onTouchEnd(e) {
    this.isDragging = false;
    clearTimeout(this._resumeT);
    this._resumeT = setTimeout(() => { this.autoOn = true; }, 2800);
    const t = e.changedTouches[0];
    this._updateMouse(t.clientX, t.clientY);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.meshes);
    if (hits.length) this.onClickCb(hits[0].object.userData.index);
  }

  _onResize() {
    this.w = this.container.offsetWidth;
    this.h = this.container.offsetHeight;
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.w, this.h);
  }

  /* ---- Render loop ---- */
  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());

    if (this.autoOn) this.targetRotY += this.autoSpeed;

    // Smooth rotation with inertia
    this.rotY += (this.targetRotY - this.rotY) * 0.035;
    this.rotX += (this.targetRotX - this.rotX) * 0.035;
    this.group.rotation.y = this.rotY;
    this.group.rotation.x = this.rotX;

    // Ambient ring pulse
    const t = Date.now() * 0.0008;
    this.ringMat.opacity = 0.03 + Math.sin(t) * 0.04;
    this.ring.rotation.z += 0.0008;

    // Slow starfield drift
    this.particles.rotation.y += 0.00015;
    this.particles.rotation.x += 0.00008;

    // Mesh hover interpolation
    this.meshes.forEach(m => {
      // Scale
      const ts  = m.userData.targetScale;
      const cs  = m.userData.currentScale;
      const ns  = cs + (ts - cs) * 0.11;
      m.userData.currentScale = ns;
      m.scale.setScalar(ns);

      // Position (pop outward on hover)
      const ht = m.userData.hovered ? 1 : 0;
      const ct = m.userData.hoverT  || 0;
      const nt = ct + (ht - ct) * 0.11;
      m.userData.hoverT = nt;
      m.position.lerpVectors(m.userData.basePos, m.userData.hoverPos, nt);
    });

    this.renderer.render(this.scene, this.camera);
  }

  pause()  { cancelAnimationFrame(this._raf); }
  resume() { this._animate(); }

  destroy() {
    this.pause();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

window.WorldView = WorldView;
