/**
 * ============================================================================
 * Televizija K37 - TV Logo Watermark Overlay Script
 * ============================================================================
 * Automatski prikazuje TV logo kao transparentni watermark sloj preko 
 * video playera (HTML5 video ili Vidiyo iframe embed).
 * 
 * Karakteristike:
 * - pointer-events: none (ne blokira klikove, kontrole, ton, fullscreen)
 * - Automatsko responzivno skaliranje (ResizeObserver)
 * - Automatsko ponovno postavljanje pri re-renderovanju playera (MutationObserver)
 * - Zaštita od dupliranja elemenata
 * - Podrška za Fullscreen
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // CONFIG SEKCIJA - Prilagodite parametre ovde
  // --------------------------------------------------------------------------
  const CONFIG = {
    // Putanja ili URL do PNG logotipa
    logoUrl: '/k37_gradient_logo_badge.png',

    // Pozicija na video slici: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    position: 'top-right',

    // Širina logotipa u procentima u odnosu na širinu samog playera
    widthPercent: 13, // ~13% širine video playera (za malu nijansu smanjeno)

    // Minimalna i maksimalna širina u pikselima
    minWidthPx: 65,
    maxWidthPx: 195,

    // Margine od ivice videa (u procentima ili pikselima - pomereno još jednu nijansu dole i ulevo)
    margin: '6.5%',

    // Providnost: 70% (0.70)
    opacity: 0.70,

    // Z-index sloja
    zIndex: 9999,

    // ID elementa za sprečavanje dupliranja
    overlayId: 'tv-logo-overlay',

    // Selektori za automatsko pronalaženje containera / playera
    targetSelectors: [
      '[data-tv-player-container]',
      '.tv-player-screen',
      'iframe[src*="vidiyo.com"]',
      'iframe[src*="embed"]',
      '.video-container',
      '.aspect-video',
      'video'
    ]
  };

  // --------------------------------------------------------------------------
  // LOGIKA OVERLAY-A
  // --------------------------------------------------------------------------

  function findTargetContainer() {
    for (const selector of CONFIG.targetSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        // Ako je selektor pronašao video ili iframe, koristimo njegov roditeljski kontejner
        if (el.tagName.toLowerCase() === 'iframe' || el.tagName.toLowerCase() === 'video') {
          return el.parentElement || el;
        }
        return el;
      }
    }
    return null;
  }

  function applyPositionStyles(logoEl) {
    logoEl.style.top = 'auto';
    logoEl.style.bottom = 'auto';
    logoEl.style.left = 'auto';
    logoEl.style.right = 'auto';

    switch (CONFIG.position) {
      case 'top-left':
        logoEl.style.top = CONFIG.margin;
        logoEl.style.left = CONFIG.margin;
        break;
      case 'bottom-left':
        logoEl.style.bottom = CONFIG.margin;
        logoEl.style.left = CONFIG.margin;
        break;
      case 'bottom-right':
        logoEl.style.bottom = CONFIG.margin;
        logoEl.style.right = CONFIG.margin;
        break;
      case 'top-right':
      default:
        logoEl.style.top = CONFIG.margin;
        logoEl.style.right = CONFIG.margin;
        break;
    }
  }

  function updateLogoSize(container, logoEl) {
    if (!container || !logoEl) return;
    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth;
    if (width > 0) {
      let calculatedWidth = width * (CONFIG.widthPercent / 100);
      calculatedWidth = Math.max(CONFIG.minWidthPx, Math.min(CONFIG.maxWidthPx, calculatedWidth));
      logoEl.style.width = Math.round(calculatedWidth) + 'px';
      logoEl.style.height = 'auto';
    }
  }

  function attachOverlay() {
    const container = findTargetContainer();
    if (!container) return;

    // Zaštita od dupliranja
    let logo = document.getElementById(CONFIG.overlayId);

    if (logo) {
      if (logo.parentElement === container) {
        // Već je u ispravnom kontejneru, samo ažuriraj dimenzije
        updateLogoSize(container, logo);
        return;
      } else {
        // Plejer je premešten/re-renderovan, ukloni stari element
        logo.remove();
        logo = null;
      }
    }

    // Osiguraj position: relative na kontejneru
    const computedPos = window.getComputedStyle(container).position;
    if (computedPos === 'static' || !computedPos) {
      container.style.position = 'relative';
    }

    // Kreiraj novi overlay element
    logo = document.createElement('img');
    logo.id = CONFIG.overlayId;
    logo.src = CONFIG.logoUrl;
    logo.alt = 'K37 TV Logo Watermark';

    // Obavezni stilovi prema zahtevu
    logo.style.position = 'absolute';
    logo.style.zIndex = CONFIG.zIndex.toString();
    logo.style.pointerEvents = 'none'; // Apsolutno ne blokira nikakve klikove ili kontrole
    logo.style.userSelect = 'none';
    logo.style.webkitUserSelect = 'none';
    logo.style.opacity = CONFIG.opacity.toString();
    logo.style.objectFit = 'contain';
    logo.style.filter = 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.75))';
    logo.style.transition = 'width 0.2s ease, opacity 0.2s ease';

    // Primeni poziciju i širinu
    applyPositionStyles(logo);
    updateLogoSize(container, logo);

    // Dodaj u kontejner iznad videa
    container.appendChild(logo);

    // Responzivno praćenje promene veličine kontejnera
    if (window.ResizeObserver && !container._tvResizeObs) {
      const resizeObserver = new ResizeObserver(() => {
        const currentLogo = document.getElementById(CONFIG.overlayId);
        if (currentLogo) updateLogoSize(container, currentLogo);
      });
      resizeObserver.observe(container);
      container._tvResizeObs = resizeObserver;
    }
  }

  // --------------------------------------------------------------------------
  // POKRETANJE & POSMATRAČI PROMENA
  // --------------------------------------------------------------------------

  // Inicijalno vezivanje
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachOverlay);
  } else {
    attachOverlay();
  }
  window.addEventListener('load', attachOverlay);

  // Sinhronizacija pri promeni Fullscreen režima
  document.addEventListener('fullscreenchange', () => {
    setTimeout(attachOverlay, 100);
  });
  document.addEventListener('webkitfullscreenchange', () => {
    setTimeout(attachOverlay, 100);
  });

  // MutationObserver: Ako se plejer ponovo učita ili promeni DOM
  const domObserver = new MutationObserver((mutations) => {
    let shouldReattach = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
        shouldReattach = true;
        break;
      }
    }
    if (shouldReattach) {
      attachOverlay();
    }
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Globalni export ako korisnik želi ručno da promeni konfiguraciju
  window.K37TvOverlay = {
    config: CONFIG,
    update: attachOverlay,
  };
})();
