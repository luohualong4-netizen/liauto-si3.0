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

})();

// ═══════════════════════════════════════
// 室内标准 — Interior Section Logic
// ═══════════════════════════════════════
(function () {
  'use strict';

  let tourInited = false;
  let observerInited = false;

  // ─── Virtual Tour ──────────────────────────────────────────
  function initInteriorTour() {
    if (tourInited) return;
    tourInited = true;

    const hero    = document.getElementById('int-heroSection');
    const wrap    = document.getElementById('int-heroPanWrap');
    const img     = document.getElementById('int-heroImg');
    const hint    = document.getElementById('int-heroPanHint');
    const overlay = document.getElementById('int-heroSceneOverlay');
    if (!hero || !wrap || !img) return;

    const SCENES = [
      {
        src: 'assets/interior/展厅全景图.webp',
        name: '展厅总览',
        hotspots: [{ x: 63, y: 48, label: '家庭区', to: 1 }]
      },
      {
        src: 'assets/interior/家庭区1.jpeg',
        name: '家庭区 1',
        hotspots: [
          { x: 50, y: 48, label: '洽谈区', to: 2 },
          { x: 67, y: 48, label: '儿童区', to: 3 },
          { x: 8,  y: 48, label: '展厅',  to: 0 }
        ]
      },
      {
        src: 'assets/interior/家庭区2.jpeg',
        name: '家庭区 2',
        hotspots: [
          { x: 50, y: 48, label: '家庭区', to: 1 },
          { x: 83, y: 48, label: '展厅',   to: 0 }
        ]
      },
      {
        src: 'assets/interior/儿童区.jpeg',
        name: '儿童区',
        hotspots: [{ x: 50, y: 48, label: '返回家庭区', to: 1 }]
      }
    ];

    let currentScene = 0, maxPan = 0, currentX = 0, targetX = 0;
    let dragging = false, startClientX = 0, startPanX = 0, didDrag = false;

    function calcMaxPan() {
      const r = img.naturalWidth / img.naturalHeight;
      maxPan = Math.max(0, img.offsetHeight * r - hero.offsetWidth) / 2;
    }
    if (img.complete && img.naturalWidth) calcMaxPan();
    img.addEventListener('load', calcMaxPan);
    window.addEventListener('resize', calcMaxPan);

    function clamp(v) { return Math.min(maxPan, Math.max(-maxPan, v)); }

    hero.addEventListener('mousedown', e => {
      if (e.target.closest('.int-hero-hotspot')) return;
      dragging = true; didDrag = false;
      startClientX = e.clientX; startPanX = currentX;
      hero.style.cursor = 'grabbing';
      if (hint) hint.classList.add('fade-out');
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const d = e.clientX - startClientX;
      if (Math.abs(d) > 3) didDrag = true;
      targetX = clamp(startPanX + d);
    });
    window.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; hero.style.cursor = 'grab'; }
      setTimeout(() => { didDrag = false; }, 10);
    });
    hero.addEventListener('touchstart', e => {
      if (e.target.closest('.int-hero-hotspot')) return;
      startClientX = e.touches[0].clientX; startPanX = currentX; didDrag = false;
      if (hint) hint.classList.add('fade-out');
    }, { passive: true });
    hero.addEventListener('touchmove', e => {
      const d = e.touches[0].clientX - startClientX;
      if (Math.abs(d) > 3) didDrag = true;
      targetX = clamp(startPanX + d);
    }, { passive: true });

    function animate() {
      currentX += (targetX - currentX) * 0.08;
      wrap.style.transform = 'translateX(calc(-50% + ' + currentX.toFixed(2) + 'px))';
      requestAnimationFrame(animate);
    }
    animate();

    function buildHotspots(scene) {
      wrap.querySelectorAll('.int-hero-hotspot').forEach(el => el.remove());
      scene.hotspots.forEach(hs => {
        const el = document.createElement('div');
        el.className = 'int-hero-hotspot';
        el.style.cssText = 'left:' + hs.x + '%;top:' + hs.y + '%';
        el.innerHTML =
          '<div class="int-hero-hotspot-ring"></div>' +
          '<div class="int-hero-hotspot-dot"></div>' +
          '<span class="int-hero-hotspot-label">' + hs.label + '</span>';
        el.addEventListener('click', () => { if (!didDrag && hs.to != null) loadScene(hs.to); });
        wrap.appendChild(el);
      });
    }

    function loadScene(idx) {
      if (idx === currentScene) return;
      overlay.classList.add('active');
      setTimeout(() => {
        currentScene = idx;
        const scene = SCENES[idx];
        img.src = scene.src;
        currentX = 0; targetX = 0;
        buildHotspots(scene);
        const reveal = () => { calcMaxPan(); setTimeout(() => overlay.classList.remove('active'), 60); };
        if (img.complete && img.naturalWidth) reveal();
        else img.onload = reveal;
      }, 420);
    }

    buildHotspots(SCENES[0]);
    hero.style.cursor = 'grab';
    calcMaxPan();
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

  // Expose init functions for switchSection
  window.initInteriorTour     = initInteriorTour;
  window.initInteriorObserver = initInteriorObserver;

})();

