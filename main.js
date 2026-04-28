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
    const btn = document.querySelector(`.nav-item[data-section="${id}"]`);
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById('section-' + id);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    nav.classList.toggle('nav-dark', id === 'home');
  }

  navItems.forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
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

  // ─── Nav dark: apply on load if starting at home ─────────
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
