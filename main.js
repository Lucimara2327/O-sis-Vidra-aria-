/* ══════════════════════════════════════════════
   OÁSIS VIDRAÇARIA — main.js
   Funcionalidades: Nav, Reveal, Carrossel,
   Galeria, Contador, Formulário, Back-to-top
══════════════════════════════════════════════ */

'use strict';

/* ── DOMContentLoaded wrapper ── */
document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════
     1. NAVIGATION — scroll + mobile toggle
  ══════════════════════════════════════ */
  const nav        = document.getElementById('nav');
  const navToggle  = document.getElementById('navToggle');
  const navLinks   = document.getElementById('navLinks');

  // Overlay para fechar menu ao clicar fora
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function openMenu() {
    navLinks.classList.add('open');
    navToggle.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Fechar ao clicar em link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Scroll: adiciona classe scrolled + ativa link ativo
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);

    // Back-to-top
    backTop.classList.toggle('visible', y > 500);

    lastScroll = y;
  }, { passive: true });


  /* ══════════════════════════════════════
     2. SMOOTH SCROLL PARA LINKS INTERNOS
  ══════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ══════════════════════════════════════
     3. REVEAL ON SCROLL (IntersectionObserver)
  ══════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  /* ══════════════════════════════════════
     4. CONTADORES ANIMADOS (Hero stats)
  ══════════════════════════════════════ */
  const counters = document.querySelectorAll('[data-count]');
  let countersStarted = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;

      const tick = () => {
        current += step;
        if (current >= target) {
          counter.textContent = target.toLocaleString('pt-BR');
          return;
        }
        counter.textContent = Math.floor(current).toLocaleString('pt-BR');
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  const heroSection = document.querySelector('.hero');
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      setTimeout(animateCounters, 600);
    }
  }, { threshold: 0.3 });

  if (heroSection) counterObserver.observe(heroSection);


  /* ══════════════════════════════════════
     5. CARROSSEL DE TRABALHOS
  ══════════════════════════════════════ */
  const track        = document.getElementById('carouselTrack');
  const prevBtn      = document.getElementById('carouselPrev');
  const nextBtn      = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.carousel__card');
    const total = cards.length;
    let currentIndex = 0;

    // Criar dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel__dot');

    function getCardWidth() {
      if (!cards[0]) return 0;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap) || 24;
      return cards[0].offsetWidth + gap;
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, total - 1));
      track.scrollTo({ left: currentIndex * getCardWidth(), behavior: 'smooth' });
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Sync dots ao arrastar/scrollar
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const w = getCardWidth();
        if (w === 0) return;
        const idx = Math.round(track.scrollLeft / w);
        currentIndex = idx;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }, 80);
    }, { passive: true });

    // Auto-play
    let autoPlay = setInterval(() => {
      const next = (currentIndex + 1) % total;
      goTo(next);
    }, 4500);

    [prevBtn, nextBtn, track].forEach(el => {
      el.addEventListener('mouseenter', () => clearInterval(autoPlay));
      el.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => goTo((currentIndex + 1) % total), 4500);
      });
    });
  }


  /* ══════════════════════════════════════
     6. FILTRO DA GALERIA
  ══════════════════════════════════════ */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galeriaItems = document.querySelectorAll('.galeria__item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Ativa botão
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galeriaItems.forEach(item => {
        const cat = item.getAttribute('data-cat');
        const match = filter === 'all' || cat === filter;

        if (match) {
          item.classList.remove('hidden');
          // Reativar reveal se necessário
          item.style.display = '';
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });


  /* ══════════════════════════════════════
     7. FORMULÁRIO DE CONTATO
  ══════════════════════════════════════ */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validação básica
      const nome = form.querySelector('#nome').value.trim();
      if (!nome) {
        shakeField(form.querySelector('#nome'));
        return;
      }

      // Simula envio (substituir por fetch/API real)
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

      setTimeout(() => {
        form.style.display = 'none';
        formSuccess.classList.add('show');
      }, 1400);
    });
  }

  function shakeField(el) {
    el.style.borderColor = '#e05a5a';
    el.style.animation = 'none';
    requestAnimationFrame(() => {
      el.style.animation = 'shake 0.4s ease';
    });
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.animation = '';
    }, 800);
  }

  // Injetar animação shake no CSS dinamicamente
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);


  /* ══════════════════════════════════════
     8. MÁSCARA DE TELEFONE
  ══════════════════════════════════════ */
  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }
      e.target.value = v;
    });
  }


  /* ══════════════════════════════════════
     9. BACK TO TOP
  ══════════════════════════════════════ */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════
     10. ANO DINÂMICO NO RODAPÉ
  ══════════════════════════════════════ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ══════════════════════════════════════
     11. PARALLAX SUAVE NO HERO
  ══════════════════════════════════════ */
  const heroOrbs = document.querySelectorAll('.hero__orb');
  if (heroOrbs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      heroOrbs.forEach((orb, i) => {
        const speed = 0.08 + i * 0.04;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }


  /* ══════════════════════════════════════
     12. FECHAR MENU AO REDIMENSIONAR
  ══════════════════════════════════════ */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) closeMenu();
  });

});
