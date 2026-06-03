/* ══════════════════════════════════════════════
   OÁSIS VIDRAÇARIA — main.js
══════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVIGATION ── */
  const nav        = document.getElementById('nav');
  const navToggle  = document.getElementById('navToggle');
  const navDrawer  = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');
  const backTop    = document.getElementById('backTop');

  const openMenu  = () => { navDrawer.classList.add('open'); navToggle.classList.add('open'); navOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { navDrawer.classList.remove('open'); navToggle.classList.remove('open'); navOverlay.classList.remove('open'); document.body.style.overflow = ''; };

  navToggle.addEventListener('click', () => navDrawer.classList.contains('open') ? closeMenu() : openMenu());
  navOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav__drawer-link, .nav__drawer-whatsapp').forEach(l => l.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });

  /* ── 2. SCROLL ── */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  /* ── 3. SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 8, behavior: 'smooth' });
    });
  });

  /* ── 4. REVEAL ── */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); revObs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  /* ── 5. CARROSSEL ── */
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.carousel__card');
    let cur = 0;

    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });

    const dots = dotsWrap.querySelectorAll('.carousel__dot');
    const gw = () => { const s = window.getComputedStyle(track); return (cards[0]?.offsetWidth || 0) + (parseFloat(s.columnGap || s.gap) || 20); };

    const goTo = (i) => {
      cur = Math.max(0, Math.min(i, cards.length - 1));
      track.scrollTo({ left: cur * gw(), behavior: 'smooth' });
      dots.forEach((d, j) => d.classList.toggle('active', j === cur));
    };

    prevBtn.addEventListener('click', () => goTo(cur - 1));
    nextBtn.addEventListener('click', () => goTo(cur + 1));

    let st;
    track.addEventListener('scroll', () => {
      clearTimeout(st);
      st = setTimeout(() => {
        const w = gw();
        if (w) { cur = Math.round(track.scrollLeft / w); dots.forEach((d, i) => d.classList.toggle('active', i === cur)); }
      }, 80);
    }, { passive: true });

    let ap = setInterval(() => goTo((cur + 1) % cards.length), 4500);
    [prevBtn, nextBtn, track].forEach(el => {
      el.addEventListener('mouseenter', () => clearInterval(ap));
      el.addEventListener('mouseleave', () => { ap = setInterval(() => goTo((cur + 1) % cards.length), 4500); });
    });
  }

  /* ── 6. FILTRO GALERIA ── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.galeria__item').forEach(item => {
        const match = f === 'all' || item.getAttribute('data-cat') === f;
        item.style.display = match ? '' : 'none';
      });
    });
  });

  /* ── 7. SIMULADOR ── */
  const PORTAS_FIXAS = [
    { maxL: 0.80, maxA: 2.10, preco: 380  },
    { maxL: 0.90, maxA: 2.20, preco: 480  },
    { maxL: 1.00, maxA: 2.40, preco: 620  },
    { maxL: 1.20, maxA: 2.40, preco: 820  },
    { maxL: 1.50, maxA: 2.70, preco: 1150 },
    { maxL: 9.99, maxA: 9.99, preco: null },
  ];
  const MULT = { porta: 1.0, janela: 0.95, box: 1.10, basculante: 0.90 };
  const NUM  = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  // Seleção de opções
  ['tipoProduto', 'tipoVidro'].forEach(id => {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.querySelectorAll('.sim__opt').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.sim__opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  const getActive = id => document.querySelector(`#${id} .sim__opt.active`);
  const fmt4 = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const capFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

  document.getElementById('btnCalcular').addEventListener('click', () => {
    const largEl = document.getElementById('largura');
    const altEl  = document.getElementById('altura');
    const larg   = parseFloat(largEl.value.replace(',', '.'));
    const alt    = parseFloat(altEl.value.replace(',', '.'));

    largEl.classList.remove('error');
    altEl.classList.remove('error');

    let valid = true;
    if (!larg || larg <= 0 || larg > 10) { largEl.classList.add('error'); valid = false; }
    if (!alt  || alt  <= 0 || alt  > 10) { altEl.classList.add('error');  valid = false; }
    if (!valid) return;

    const prodEl   = getActive('tipoProduto');
    const vidEl    = getActive('tipoVidro');
    const produto  = prodEl.getAttribute('data-value');
    const vidro    = vidEl.getAttribute('data-value');
    const precoM2  = parseFloat(vidEl.getAttribute('data-preco'));
    const area     = larg * alt;
    const mult     = MULT[produto] || 1;
    const nomeProd = capFirst(produto);
    const nomeVid  = capFirst(vidro === 'fume' ? 'Fumê' : vidro);

    let valorFinal, formula, precoLabel;

    if (produto === 'porta') {
      const faixa = PORTAS_FIXAS.find(f => larg <= f.maxL && alt <= f.maxA);
      if (!faixa || faixa.preco === null) {
        exibirResultado({ nomeProd, nomeVid, larg, alt, area, formula: '—', precoLabel: 'Sob consulta', valorFinal: null });
        return;
      }
      valorFinal = faixa.preco;
      formula    = `Porta ${larg.toFixed(2)} × ${alt.toFixed(2)} m (tabela fixa)`;
      precoLabel = `${NUM.format(faixa.preco)} (fixo por tamanho)`;
    } else {
      valorFinal = area * precoM2 * mult;
      formula    = `${fmt4(area)} m² × R$${precoM2}/m²${mult !== 1 ? ` × ${mult}` : ''}`;
      precoLabel = `R$ ${precoM2}/m²`;
    }

    exibirResultado({ nomeProd, nomeVid, larg, alt, area, formula, precoLabel, valorFinal });
  });

  function exibirResultado({ nomeProd, nomeVid, larg, alt, area, formula, precoLabel, valorFinal }) {
    document.getElementById('resProduto').textContent  = nomeProd;
    document.getElementById('resVidro').textContent    = nomeVid;
    document.getElementById('resMedidas').textContent  = `${larg.toFixed(2)} × ${alt.toFixed(2)} m`;
    document.getElementById('resArea').textContent     = `${fmt4(area)} m²`;
    document.getElementById('resPrecoM2').textContent  = precoLabel;
    document.getElementById('resFormula').textContent  = formula;

    const totalEl = document.getElementById('resTotal');
    if (valorFinal === null) {
      totalEl.textContent = 'Sob consulta';
      totalEl.style.fontSize = '1.1rem';
    } else {
      totalEl.textContent = NUM.format(valorFinal);
      totalEl.style.fontSize = '';
    }

    // Montar mensagem WhatsApp
    const msg = [
      '🪟 *Oásis Vidraçaria — Solicitação de Orçamento*',
      '',
      `📦 *Produto:* ${nomeProd}`,
      `💎 *Tipo de vidro:* ${nomeVid}`,
      `📐 *Medidas:* ${larg.toFixed(2)} × ${alt.toFixed(2)} m`,
      `📊 *Área:* ${fmt4(area)} m²`,
      valorFinal !== null
        ? `💰 *Valor estimado:* ${NUM.format(valorFinal)}`
        : '💰 *Valor:* Sob consulta (dimensão especial)',
      '',
      'Gostaria de confirmar o orçamento e agendar a medição.',
    ].join('\n');

    document.getElementById('btnWhatsApp').href =
      `https://wa.me/5575998797159?text=${encodeURIComponent(msg)}`;

    const res = document.getElementById('simResultado');
    res.classList.remove('show');
    void res.offsetWidth;
    res.classList.add('show');
    setTimeout(() => res.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
  }

  ['largura', 'altura'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => el.classList.remove('error'));
  });

  /* ── 8. BACK TO TOP ── */
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── 9. ANO DINÂMICO ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 10. PARALLAX HERO ── */
  const heroOrbs = document.querySelectorAll('.hero__orb');
  if (heroOrbs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      heroOrbs.forEach((o, i) => { o.style.transform = `translateY(${y * (0.07 + i * 0.03)}px)`; });
    }, { passive: true });
  }

});
