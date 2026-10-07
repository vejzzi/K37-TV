/**
 * Televizija K37 - Security & Anti-Inspection Shield
 * 
 * Štiti skripte, plejer i video signal od neovlašćenog preuzimanja,
 * otvaranja Inspect Element konzole, prečica pretraživača i kopiranja.
 */

export function initSecurityShield(): void {
  if (typeof window === 'undefined') return;

  // 1. Zabrana prečica na tastaturi (F12, Inspect, View Source, Save)
  const blockShortcuts = (e: KeyboardEvent) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.shiftKey &&
      ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Mac Cmd+Option+I, Cmd+Option+J, Cmd+Option+C
    if (
      e.metaKey &&
      e.altKey &&
      ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Page Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  window.addEventListener('keydown', blockShortcuts, { capture: true, passive: false });

  // 2. Globalna zaštita od desnog klika nad video plejerom i osetljivim zonama
  const blockContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target) {
      const isSensitiveArea = target.closest(
        '[data-tv-player-container], .aspect-video, video, iframe, #tv-logo-overlay, header, .vdy-embed-player'
      );
      if (isSensitiveArea) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  };

  window.addEventListener('contextmenu', blockContextMenu, { capture: true, passive: false });

  // 3. Anti-DevTools aktivna detekcija & Debugger Trap
  // Ako korisnik pokuša da otvori Inspect Element / Developer Tools,
  // aktivira se debugger zamka koja zamrzava analizu koda.
  let devtoolsDetected = false;
  const threshold = 160;

  const triggerAntiDebug = () => {
    try {
      const start = performance.now();
      // Dinamički evaluirana debugger petlja
      const fn = new Function('debugger');
      fn();
      if (performance.now() - start > 100) {
        devtoolsDetected = true;
      }
    } catch {
      // Ignoriši u normalnom režimu
    }
  };

  // Periodična provera otvaranja konzole kroz odstupanje unutrašnjih/spoljašnjih dimenzija
  setInterval(() => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if (widthDiff || heightDiff) {
      if (!devtoolsDetected) {
        devtoolsDetected = true;
        try {
          console.clear();
        } catch {}
      }
      triggerAntiDebug();
    } else {
      devtoolsDetected = false;
    }
  }, 1200);

  // 4. Zaštita konzole od curenja mrežnih tokena u produkciji
  if (process.env.NODE_ENV === 'production') {
    try {
      const noop = () => {};
      console.log = noop;
      console.info = noop;
      console.debug = noop;
    } catch {}
  }
}
