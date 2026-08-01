/* Google tag (gtag.js) só carrega depois de consentimento explícito no
   banner de cookies (ver IIFE abaixo) — nenhuma requisição sai pro Google
   antes do aceite. Fica fora do IIFE porque `gtag` precisa ser global (é a
   interface padrão do gtag.js), e num arquivo 'self' (não inline) pra CSP
   script-src continuar sem 'unsafe-inline'. */
function loadAnalytics() {
  if (window.__analyticsLoaded) return;
  window.__analyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    dataLayer.push(arguments);
  };
  gtag('js', new Date());
  // 'config' já dispara o page_view automático do GA4 (comportamento padrão
  // do gtag.js) — como o carregamento é adiado até o consentimento, esse
  // page_view sai só agora, não no load real da página.
  //
  // allow_google_signals/allow_ad_personalization_signals desligados: sem
  // isso, o gtag.js manda dados de "Google Signals" (ads/remarketing, não
  // pedido) pra um conjunto de domínios do Google praticamente impossível
  // de listar numa CSP (analytics.google.com, stats.g.doubleclick.net,
  // www.google.com, até domínios regionais tipo google.com.br) — a CSP
  // acabava bloqueando o hit de analytics de verdade. Com isso desligado, o
  // gtag.js só fala com o domínio de coleta padrão do GA4.
  gtag('config', 'GT-TB7VR756', {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=GT-TB7VR756';
  document.head.appendChild(script);
}

(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- marcas de grau da bússola ---- */
  const ticks = document.getElementById("ticks");
  if (ticks) {
    let d = "";
    for (let i = 0; i < 72; i++) {
      const major = i % 6 === 0;
      const a = (i * 5 - 90) * Math.PI / 180;
      const r1 = 196, r2 = 196 - (major ? 13 : 6);
      d += `M${200 + r1 * Math.cos(a)} ${200 + r1 * Math.sin(a)}L${200 + r2 * Math.cos(a)} ${200 + r2 * Math.sin(a)}`;
    }
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("stroke-width", "1");
    p.setAttribute("stroke-opacity", ".3");
    ticks.appendChild(p);
  }

  /* ---- telefones de tema ---- */
  const THEMES = [
    { cls: "t-navy",    name: "Dark Navy",     hint: "Sóbrio",     bal: "R$ 12.450,00" },
    { cls: "t-light",   name: "Classic Light", hint: "Alto contraste", bal: "R$ 8.320,00" },
    { cls: "t-emerald", name: "Emerald Night", hint: "Foco",       bal: "R$ 21.700,00" },
    { cls: "t-gold",    name: "Sunset Gold",   hint: "Padrão",     bal: "R$ 5.980,00" }
  ];
  const BARS = [
    [40, 62, 34, 78, 50],
    [55, 30, 70, 44, 88],
    [72, 45, 60, 36, 54],
    [34, 80, 48, 66, 42]
  ];

  const swatches = document.getElementById("swatches");
  if (swatches) {
    swatches.innerHTML = THEMES.map((t, i) => `
      <div class="swatch reveal" style="--d:${i * 90}ms">
        <div class="phone ${t.cls}">
          <div class="phone__screen">
            <span class="phone__notch"></span>
            <div>
              <p class="scr__label">Saldo total</p>
              <p class="scr__balance">${t.bal}</p>
              <p class="scr__delta">Atualizado agora</p>
            </div>
            <div class="scr__chart">
              ${BARS[i].map((h, j) => `<i class="${j === 3 ? "on" : ""}" style="height:${h}%"></i>`).join("")}
            </div>
            <div class="scr__rows">
              <div class="scr__row"><span class="scr__ico"></span><span class="scr__bars"><b></b><i></i></span></div>
              <div class="scr__row"><span class="scr__ico"></span><span class="scr__bars"><b style="width:50%"></b><i style="width:32%"></i></span></div>
            </div>
            <div class="scr__nav"><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
        <div class="swatch__meta">
          <p class="swatch__name">${t.name}</p>
          <p class="swatch__hint">${t.hint}</p>
        </div>
      </div>
    `).join("");
  }

  /* ---- QR decorativo (substituir pelo QR real da loja) ---- */
  const qr = document.getElementById("qr");
  if (qr) {
    const N = 25;
    let seed = 20240412;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    const finder = (r, c) => {
      for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
        const y = r + i, x = c + j;
        if (y < 0 || x < 0 || y >= N || x >= N) continue;
        const edge = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        grid[y][x] = (edge || core) && i >= 0 && i <= 6 && j >= 0 && j <= 6 ? 1 : 0;
      }
    };
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid[r][c] = rnd() > 0.53 ? 1 : 0;
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    for (let i = 8; i < N - 8; i++) { grid[6][i] = i % 2 ? 0 : 1; grid[i][6] = i % 2 ? 0 : 1; }
    let path = "";
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c]) path += `M${c} ${r}h1v1h-1z`;
    qr.innerHTML = `<path d="${path}" fill="#0B0A10"/>`;
  }

  /* ---- reveal no scroll ---- */
  const revealables = () => document.querySelectorAll(".reveal:not(.is-in)");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables().forEach(el => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables().forEach(el => io.observe(el));
  }

  /* ---- nav ---- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-stuck", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  links.addEventListener("click", e => {
    if (e.target.closest("a")) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- FAQ ---- */
  document.getElementById("faqList").addEventListener("click", e => {
    const btn = e.target.closest(".qa__q");
    if (!btn) return;
    const qa = btn.closest(".qa");
    const open = qa.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });

  /* ---- rodapé: ano atual ---- */
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ---- tracking: clique nos botões de download ---- */
  document.querySelectorAll(".js-download-link").forEach(el => {
    el.addEventListener("click", () => {
      if (typeof gtag === "function") {
        gtag("event", "download_click", {
          link_location: el.dataset.trackLocation || "unknown",
        });
      }
    });
  });

  /* ---- versão + link de download (latest.json) ---- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  fetch("latest.json?_=" + Date.now())
    .then(r => r.json())
    .then(latest => {
      const versionEl = document.getElementById("version");
      const footerVersionEl = document.getElementById("footer-version");
      if (versionEl) versionEl.textContent = "Versão " + latest.version;
      if (footerVersionEl) footerVersionEl.textContent = "v" + latest.version;
      document.querySelectorAll(".js-download-link").forEach(el => {
        el.href = latest.apkFileName;
      });
    })
    .catch(() => {
      const errorEl = document.getElementById("error");
      if (errorEl) errorEl.style.display = "block";
    });

  /* ---- histórico de versões (changelog.json) ---- */
  fetch("changelog.json?_=" + Date.now())
    .then(r => r.json())
    .then(changelog => {
      const list = document.getElementById("changelog-list");
      if (!list) return;
      list.innerHTML = changelog
        .map(
          (entry, i) => `
            <div class="qa reveal is-in" style="--d:${i * 60}ms">
              <div class="qa__q" style="cursor:default;">
                <span>v${escapeHtml(entry.version)}</span>
                <span class="download__version" style="font-size:11px;">${new Date(entry.publishedAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div class="qa__a" style="grid-template-rows:1fr;">
                <div><p style="white-space:pre-wrap;">${escapeHtml(entry.releaseNotes)}</p></div>
              </div>
            </div>`
        )
        .join("");
    })
    .catch(() => {});

  /* ---- modal: aviso de responsabilidade ---- */
  const disclaimerModal = document.getElementById("disclaimerModal");
  if (disclaimerModal) {
    const openModal = () => {
      disclaimerModal.classList.add("is-open");
      disclaimerModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
      disclaimerModal.classList.remove("is-open");
      disclaimerModal.setAttribute("aria-hidden", "true");
      localStorage.setItem("disclaimerSeen", "true");
      document.body.style.overflow = "auto";
    };
    document.querySelectorAll('[data-modal-open="disclaimer"]').forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        openModal();
      });
    });
    disclaimerModal.querySelectorAll("[data-modal-close]").forEach(el => {
      el.addEventListener("click", closeModal);
    });
    addEventListener("keydown", e => {
      if (e.key === "Escape") closeModal();
    });
    if (localStorage.getItem("disclaimerSeen") !== "true") {
      openModal();
    }
  }

  /* ---- banner: consentimento de cookies/analytics ---- */
  const cookieBanner = document.getElementById("cookieBanner");
  if (cookieBanner) {
    const CONSENT_KEY = "analyticsConsent";

    const showBanner = () => {
      cookieBanner.classList.add("is-open");
      cookieBanner.setAttribute("aria-hidden", "false");
    };
    const hideBanner = () => {
      cookieBanner.classList.remove("is-open");
      cookieBanner.setAttribute("aria-hidden", "true");
    };

    cookieBanner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "granted");
      hideBanner();
      loadAnalytics();
    });
    cookieBanner.querySelector("[data-cookie-decline]").addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "denied");
      hideBanner();
    });
    document.querySelectorAll("[data-cookie-open]").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        showBanner();
      });
    });

    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === "granted") {
      loadAnalytics();
    } else if (consent !== "denied") {
      showBanner();
    }
  }
})();
