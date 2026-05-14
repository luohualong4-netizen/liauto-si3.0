// ═══════════════════════════════════════
// 理想汽车 SI3.0 — 交互逻辑
// ═══════════════════════════════════════
(function () {
  'use strict';

  // ─── Nav Logo → go home ──────────────────────────────────
  const nav = document.querySelector('.nav');

  document.getElementById('navLogo').addEventListener('click', () => {
    switchSection('home');
  });

  // ─── Nav: section switching ──────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');

  function switchSection(id) {
    navItems.forEach(b => b.classList.remove('active'));

    // facade/interior are sub-sections under 综合中心标准
    let navKey = id;
    if (id === 'facade' || id === 'interior') navKey = 'integrated';

    const btn = document.querySelector(`.nav-item[data-section="${navKey}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + id);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    nav.classList.toggle('nav-dark', id === 'home' || id === 'agent');

    if (id === 'home') {
      // Restart landing page animations on re-entry
      const resetEls = document.querySelectorAll(
        '.home-lp-bg, .home-lp-title, .home-lp-subtitle, .home-lp-btns'
      );
      resetEls.forEach(el => { el.style.animation = 'none'; void el.offsetHeight; el.style.animation = ''; });
    }

    if (id === 'interior') {
      initInteriorTour();
      initInteriorObserver();
    }
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSection(btn.dataset.section);
    });
  });

  // Landing page buttons
  const lpBtnAgent = document.getElementById('lpBtnAgent');
  const lpBtnIntegrated = document.getElementById('lpBtnIntegrated');
  const lpBtnRetail = document.getElementById('lpBtnRetail');
  if (lpBtnAgent) lpBtnAgent.addEventListener('click', () => switchSection('agent'));
  if (lpBtnIntegrated) lpBtnIntegrated.addEventListener('click', () => switchSection('integrated'));
  if (lpBtnRetail) lpBtnRetail.addEventListener('click', () => switchSection('retail'));

  // ─── Split panel clicks ───────────────────────────────────
  function showToast(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
  }

  const splitIntFacade = document.getElementById('splitIntFacade');
  const splitIntInterior = document.getElementById('splitIntInterior');
  if (splitIntFacade) splitIntFacade.addEventListener('click', () => switchSection('facade'));
  if (splitIntInterior) splitIntInterior.addEventListener('click', () => switchSection('interior'));

  document.querySelectorAll('#section-retail .split-panel--disabled').forEach(panel => {
    panel.addEventListener('click', () => showToast('零售中心标准建设中，敬请期待'));
  });

  // ─── Modal ───────────────────────────────────────────────
  const overlay    = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody  = document.getElementById('modalBody');
  const closeBtn   = document.getElementById('modalClose');

  let lazyObserver = null;

  function observeModalImages() {
    if (lazyObserver) lazyObserver.disconnect();
    lazyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const src = img.dataset.src;
        if (!src) return;
        img.src = src;
        delete img.dataset.src;
        lazyObserver.unobserve(img);
      });
    }, { root: modalBody, rootMargin: '300px 0px' });
    modalBody.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
  }

  function openModal(id) {
    const data = HOTSPOT_DATA[id];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalBody.innerHTML = '';

    data.content.forEach(block => {
      if (block.type === 'text') {
        const p = document.createElement('p');
        p.className = 'mb-text';
        p.textContent = block.value;
        modalBody.appendChild(p);

      } else if (block.type === 'image') {
        const wrap = document.createElement('div');
        wrap.className = 'mb-image';
        const img = document.createElement('img');
        img.dataset.src = block.src;
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        img.alt = block.caption || '';
        // Show placeholder if image fails to load
        img.onerror = function () {
          const ph = document.createElement('div');
          ph.className = 'mb-placeholder';
          ph.innerHTML = `<strong>📁 图片待添加</strong>将图片保存至：<code>assets/standards/${block.src.split('/').pop()}</code>`;
          wrap.replaceChild(ph, img);
        };
        wrap.appendChild(img);
        if (block.caption) {
          const cap = document.createElement('p');
          cap.className = 'mb-caption';
          cap.textContent = block.caption;
          wrap.appendChild(cap);
        }
        modalBody.appendChild(wrap);

      } else if (block.type === 'table') {
        const table = document.createElement('table');
        table.className = 'mb-table';

        const thead = document.createElement('thead');
        const trH = document.createElement('tr');
        block.headers.forEach(h => {
          const th = document.createElement('th');
          th.textContent = h;
          trH.appendChild(th);
        });
        thead.appendChild(trH);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        block.rows.forEach(row => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        modalBody.appendChild(table);
      }
    });

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    modalBody.scrollTop = 0;
    observeModalImages();
  }

  function closeModal() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (lazyObserver) { lazyObserver.disconnect(); lazyObserver = null; }
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ─── Hotspot zones: click ────────────────────────────────
  document.querySelectorAll('.hz').forEach(zone => {
    zone.addEventListener('click', e => {
      e.stopPropagation();
      openModal(zone.dataset.id);
    });
  });

  // ─── Hotspot zones: hover → sync indicator dot ───────────
  // Build map: id → array of .hi elements
  const hiMap = {};
  document.querySelectorAll('.hi').forEach(hi => {
    const id = hi.dataset.id;
    if (!hiMap[id]) hiMap[id] = [];
    hiMap[id].push(hi);
  });

  document.querySelectorAll('.hz').forEach(zone => {
    zone.addEventListener('mouseenter', () => {
      (hiMap[zone.dataset.id] || []).forEach(hi => hi.classList.add('is-hovered'));
    });
    zone.addEventListener('mouseleave', () => {
      (hiMap[zone.dataset.id] || []).forEach(hi => hi.classList.remove('is-hovered'));
    });
  });

  // ─── Guide dropdown ──────────────────────────────────────
  const guideBtn      = document.getElementById('guideBtn');
  const guideDropdown = document.getElementById('guideDropdown');
  const guideWrap     = document.getElementById('guideWrap');

  guideBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isHidden = guideDropdown.classList.contains('hidden');
    guideDropdown.classList.toggle('hidden');
    // Re-trigger animation
    if (isHidden) {
      guideDropdown.style.animation = 'none';
      requestAnimationFrame(() => {
        guideDropdown.style.animation = '';
      });
    }
  });

  guideDropdown.querySelectorAll('.guide-item').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      guideDropdown.classList.add('hidden');
      openModal(item.dataset.id);
    });
  });

  document.addEventListener('click', e => {
    if (!guideWrap.contains(e.target)) guideDropdown.classList.add('hidden');
  });

  // ─── Scroll reveal ────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ─── Nav dark: apply on load (starts at home = dark) ────────
  nav.classList.add('nav-dark');

  // ─── SI Agent ─────────────────────────────────────────────
  const agentMessages = document.getElementById('agentMessages');
  const agentInput    = document.getElementById('agentInput');
  const agentSend     = document.getElementById('agentSend');
  const agentChips    = document.getElementById('agentChips');

  if (agentMessages && agentInput && agentSend) {

    function addAiMessage(html) {
      const div = document.createElement('div');
      div.className = 'msg msg-ai';
      div.innerHTML = '<div class="msg-html">' + html + '</div>';
      agentMessages.appendChild(div);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function addUserMessage(text) {
      const div = document.createElement('div');
      div.className = 'msg msg-user';
      div.textContent = text;
      agentMessages.appendChild(div);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'typing-indicator';
      el.id = 'typingIndicator';
      el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
      agentMessages.appendChild(el);
      agentMessages.scrollTop = agentMessages.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('typingIndicator');
      if (el) el.remove();
    }

    function queryKB(text) {
      const lower = text.toLowerCase();
      for (const entry of AGENT_KB) {
        if (entry.keywords.some(kw => lower.includes(kw.toLowerCase()))) return entry;
      }
      return null;
    }

    function buildResponseEl(entry) {
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-html';
      wrapper.innerHTML = entry.html;

      if (entry.cta) {
        const ctaBtn = document.createElement('button');
        ctaBtn.className = 'msg-cta-btn';
        ctaBtn.textContent = '查看规范图册 →';
        ctaBtn.addEventListener('click', () => openModal(entry.cta));
        wrapper.appendChild(ctaBtn);
      }

      if (entry.suCad) {
        const ask = document.createElement('p');
        ask.style.cssText = 'margin-top:10px;color:rgba(255,255,255,0.75)';
        ask.textContent = '需要 SU 模型或 CAD 文件吗？';
        wrapper.appendChild(ask);
        const row = document.createElement('div');
        row.className = 'msg-download-row';
        const suBtn = document.createElement('button');
        suBtn.className = 'msg-dl-btn';
        suBtn.innerHTML = '⬇ <span translate="no">SU</span> 模型';
        suBtn.addEventListener('click', () => alert('SU 模型文件即将上线，敬请期待'));
        const cadBtn = document.createElement('button');
        cadBtn.className = 'msg-dl-btn';
        cadBtn.innerHTML = '⬇ <span translate="no">CAD</span> 文件';
        cadBtn.addEventListener('click', () => alert('CAD 文件即将上线，敬请期待'));
        row.appendChild(suBtn);
        row.appendChild(cadBtn);
        wrapper.appendChild(row);
      }

      return wrapper;
    }

    function sendMessage(text) {
      text = text.trim();
      if (!text) return;
      addUserMessage(text);
      agentInput.value = '';
      showTyping();
      setTimeout(() => {
        hideTyping();
        const entry = queryKB(text);
        if (entry) {
          const msgDiv = document.createElement('div');
          msgDiv.className = 'msg msg-ai';
          msgDiv.appendChild(buildResponseEl(entry));
          agentMessages.appendChild(msgDiv);
        } else {
          addAiMessage(AGENT_FALLBACK_HTML.replace('{Q}', text));
        }
        agentMessages.scrollTop = agentMessages.scrollHeight;
      }, 700 + Math.random() * 400);
    }

    addAiMessage(AGENT_WELCOME_HTML);

    agentSend.addEventListener('click', () => sendMessage(agentInput.value));
    agentInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(agentInput.value); });

    if (agentChips) {
      agentChips.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => sendMessage(chip.dataset.query));
      });
    }
  }

  // Feature cards → section nav
  document.querySelectorAll('.feature-card[data-section]').forEach(card => {
    card.addEventListener('click', () => switchSection(card.dataset.section));
  });

  // Deep-link from sub-pages (e.g. interior-overview → section-interior)
  const gotoSection = sessionStorage.getItem('gotoSection');
  if (gotoSection) {
    sessionStorage.removeItem('gotoSection');
    switchSection(gotoSection);
  }

// ─── Interior Section Logic ──────────────────────────────

  let tourInited = false;
  let observerInited = false;

  // ─── 360° Virtual Tour ───────────────────────────────────
  function initInteriorTour() {
    if (tourInited) return;
    tourInited = true;

    const hero    = document.getElementById('int-heroSection');
    const hint    = document.getElementById('int-heroPanHint');
    const overlay = document.getElementById('int-heroSceneOverlay');
    if (!hero || typeof THREE === 'undefined') return;

    const SCENES = [
      {
        src: 'assets/interior/全景图.jpeg',
        name: '展厅总览',
        fov: 60, initLon: 270, initLat: 0, offset: 0,
        hotspots: [
          { lon: 292, lat: -5,  label: '家庭区', arrow: true, to: 1 },
          { lon: 235, lat: -4,  label: '洽谈区', arrow: true, to: 2 }
        ]
      },
      {
        src: 'assets/interior/全景家庭区2.jpeg',
        name: '家庭区',
        fov: 60, initLon: 270, initLat: 0, offset: 0, exposure: 0.7,
        hotspots: [
          { lon: 226, lat: -10, label: '展厅区',    arrow: true, arrowSrc: 'assets/interior/箭头3.png', to: 0 },
          { lon: 270, lat: -20, label: '选配洽谈区', arrow: true, to: 3 }
        ]
      },
      {
        src: 'assets/interior/全景洽谈区.jpeg',
        name: '洽谈区',
        fov: 60, initLon: 270, initLat: 0, offset: 0,
        hotspots: [
          { lon: 310, lat: -8,  label: '展厅区',    arrow: true, arrowSrc: 'assets/interior/箭头2.png', to: 0 },
          { lon: 268, lat: -15, label: '选配洽谈区', arrow: true, to: 3 }
        ]
      },
      {
        src: 'assets/interior/全景家庭区1.jpeg',
        name: '家庭区1',
        fov: 60, initLon: 270, initLat: 0, offset: 0, exposure: 0.7,
        hotspots: [
          { lon: 360, lat: -10, label: '返回洽谈区', arrow: true, to: 2 },
          { lon: 175, lat: -15, label: '家庭区',     arrow: true, to: 1 }
        ]
      }
    ];

    /* Three.js setup */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    hero.insertBefore(renderer.domElement, hero.firstChild);

    const scene3 = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
    camera.target = new THREE.Vector3();

    const geo = new THREE.SphereGeometry(500, 60, 40);
    geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    scene3.add(mesh);

    const hsLayer = document.createElement('div');
    hsLayer.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden;';
    hero.appendChild(hsLayer);

    const HFOV = 90;
    function resizeRenderer() {
      const W = hero.offsetWidth, H = hero.offsetHeight;
      if (!W || !H) return;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.fov = 2 * Math.atan(Math.tan(HFOV * Math.PI / 360) / camera.aspect) * 180 / Math.PI;
      camera.updateProjectionMatrix();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    let lon = 0, lat = 5, targetLon = 0, targetLat = 5;
    let dragging = false, startX = 0, startY = 0, startLon = 0, startLat = 0, didDrag = false;
    let hsEls = [];

    const texCache = {};
    function loadTex(src, cb) {
      if (texCache[src]) { cb(texCache[src]); return; }
      new THREE.TextureLoader().load(src, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        texCache[src] = tex; cb(tex);
      });
    }

    function buildHotspots(sc) {
      hsLayer.innerHTML = ''; hsEls = [];
      (sc.hotspots || []).forEach(hs => {
        const el = document.createElement('div');
        el.style.pointerEvents = 'all';
        if (hs.arrow) {
          const imgClass = hs.arrowSrc && hs.arrowSrc.includes('箭头3') ? 'int-hero-arrow-img arrow3'
            : hs.arrowSrc && hs.arrowSrc.includes('箭头2') ? 'int-hero-arrow-img arrow2'
            : 'int-hero-arrow-img';
          el.className = 'int-hero-arrow';
          const labelMargin = hs.arrowSrc && hs.arrowSrc.includes('箭头3') ? '50px' : '-20px';
          const labelOffset = hs.arrowSrc && hs.arrowSrc.includes('箭头3') ? 'margin-left:60px;' : '';
          el.innerHTML = '<img class="' + imgClass + '" src="' + (hs.arrowSrc || 'assets/interior/箭头1.png') + '" alt="">'
            + (hs.label ? '<div style="text-align:center;font-size:9px;color:rgba(255,255,255,.5);margin-top:' + labelMargin + ';' + labelOffset + 'transform:rotateX(40deg);transform-origin:top center;letter-spacing:.06em;white-space:nowrap;text-shadow:0 0 6px rgba(0,0,0,.6)">' + hs.label + '</div>' : '');
        } else {
          el.className = 'int-hero-hotspot';
          el.innerHTML = '<div class="int-hero-hotspot-ring"></div><div class="int-hero-hotspot-dot"></div>'
            + (hs.label ? '<span class="int-hero-hotspot-label">' + hs.label + '</span>' : '');
        }
        el.addEventListener('click', () => { if (!didDrag && hs.to != null) loadScene(hs.to); });
        hsLayer.appendChild(el);
        hsEls.push({ el, hs });
      });
    }

    function updateHotspots() {
      const W = hero.offsetWidth, H = hero.offsetHeight;
      hsEls.forEach(({ el, hs }) => {
        const phi   = THREE.MathUtils.degToRad(90 - (hs.lat || 0));
        const theta = THREE.MathUtils.degToRad(hs.lon || 0);
        const v = new THREE.Vector3(
          500 * Math.sin(phi) * Math.cos(theta),
          500 * Math.cos(phi),
          500 * Math.sin(phi) * Math.sin(theta)
        );
        v.project(camera);
        const inFront = v.z < 1;
        el.style.display = inFront ? 'block' : 'none';
        if (inFront) {
          el.style.left = ((v.x + 1) / 2 * W) + 'px';
          el.style.top  = ((-v.y + 1) / 2 * H) + 'px';
        }
      });
    }

    function loadScene(idx) {
      const sc = SCENES[idx];
      if (!sc) return;
      overlay.classList.add('active');
      setTimeout(() => {
        loadTex(sc.src, tex => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.offset.x = sc.offset || 0;
          mat.map = tex; mat.needsUpdate = true;
          camera.fov = sc.fov || 75;
          camera.updateProjectionMatrix();
          targetLon = sc.initLon || 0;
          targetLat = sc.initLat || 0;
          renderer.toneMappingExposure = sc.exposure || 1.0;
          buildHotspots(sc);
          setTimeout(() => overlay.classList.remove('active'), 50);
        });
      }, 350);
    }

    hero.addEventListener('mousedown', e => {
      if (e.target.closest('.int-hero-hotspot, .int-hero-arrow')) return;
      dragging = true; didDrag = false;
      startX = e.clientX; startY = e.clientY;
      startLon = targetLon; startLat = targetLat;
      hero.style.cursor = 'grabbing';
      if (hint) hint.classList.add('fade-out');
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) didDrag = true;
      targetLon = startLon - dx * 0.15;
      targetLat = Math.max(-85, Math.min(85, startLat + dy * 0.08));
    });
    window.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; hero.style.cursor = 'grab'; }
      setTimeout(() => { didDrag = false; }, 10);
    });
    hero.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      startLon = targetLon; startLat = targetLat; didDrag = false;
      if (hint) hint.classList.add('fade-out');
    }, { passive: true });
    hero.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) didDrag = true;
      targetLon = startLon - dx * 0.15;
      targetLat = Math.max(-85, Math.min(85, startLat + dy * 0.08));
    }, { passive: true });

    function animate() {
      requestAnimationFrame(animate);
      lon += (targetLon - lon) * 0.07;
      lat += (targetLat - lat) * 0.07;
      const phi   = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      camera.target.set(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(camera.target);
      updateHotspots();
      renderer.render(scene3, camera);
    }

    loadScene(0);
    animate();
  }

  // ─── Fade-up Observer (interior) ───────────────────────────
  function initInteriorObserver() {
    if (observerInited) return;
    observerInited = true;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('#section-interior .fade-up').forEach(el => obs.observe(el));
  }

  // ─── Lightbox ───────────────────────────────────────────────
  const lbOverlay = document.getElementById('intLbOverlay');
  const lbImg     = document.getElementById('intLbImg');
  const lbClose   = document.getElementById('intLbClose');
  const lbPrev    = document.getElementById('intLbPrev');
  const lbNext    = document.getElementById('intLbNext');
  const lbCounter = document.getElementById('intLbCounter');

  let lbImages = [], lbIndex = 0;

  function lbOpen(images, idx) {
    lbImages = images;
    lbIndex = idx;
    lbImg.src = images[idx];
    lbCounter.textContent = (idx + 1) + ' / ' + images.length;
    lbOverlay.classList.add('active');
  }
  function lbGo(delta) {
    lbIndex = (lbIndex + delta + lbImages.length) % lbImages.length;
    lbImg.src = lbImages[lbIndex];
    lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
  }
  function lbClose_fn() { lbOverlay.classList.remove('active'); }

  if (lbClose)   lbClose.addEventListener('click', lbClose_fn);
  if (lbPrev)    lbPrev.addEventListener('click', () => lbGo(-1));
  if (lbNext)    lbNext.addEventListener('click', () => lbGo(1));
  if (lbOverlay) lbOverlay.addEventListener('click', e => { if (e.target === lbOverlay || e.target === lbImg) lbClose_fn(); });

  document.addEventListener('keydown', e => {
    if (!lbOverlay || !lbOverlay.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  lbGo(-1);
    if (e.key === 'ArrowRight') lbGo(1);
    if (e.key === 'Escape')     lbClose_fn();
  });

  document.querySelectorAll('#section-interior .int-gallery-row').forEach(row => {
    const cells = row.querySelectorAll('.int-gallery-cell');
    cells.forEach((cell, idx) => {
      const imgs = Array.from(cells).map(c => c.querySelector('img').src);
      cell.addEventListener('click', () => lbOpen(imgs, idx));
    });
  });

  // ─── Zone Card Modal ────────────────────────────────────────
  const zcOverlay = document.getElementById('intZcOverlay');
  const zcClose   = document.getElementById('intZcClose');
  const zcImg     = document.getElementById('intZcImg');

  function zcOpen(src) {
    zcImg.src = src;
    zcOverlay.classList.add('active');
  }
  function zcClose_fn() { zcOverlay.classList.remove('active'); }

  if (zcClose)   zcClose.addEventListener('click', zcClose_fn);
  if (zcOverlay) zcOverlay.addEventListener('click', e => { if (e.target === zcOverlay) zcClose_fn(); });
  document.addEventListener('keydown', e => {
    if (zcOverlay && zcOverlay.classList.contains('active') && e.key === 'Escape') zcClose_fn();
  });

  const hotspotRetail = document.getElementById('int-hotspot-retail');
  if (hotspotRetail) {
    hotspotRetail.addEventListener('click', () => zcOpen('assets/interior/空间构成.jpeg'));
  }

})();
