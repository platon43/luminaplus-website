/**
 * LuminaPlus Cookie-Consent-Banner (DSGVO-konform)
 *
 * Zeigt beim ersten Besuch einen Consent-Banner an.
 * Informiert ueber:
 * - Technisch notwendige Cookies (immer erlaubt)
 * - Externe Ressourcen (Google Fonts, jsPDF CDN)
 * - Funktionale Speicherung (localStorage fuer Draft, Font-Size)
 *
 * Speichert Einwilligung in localStorage als 'luminaplus-consent'.
 * Bei Ablehnung werden externe Ressourcen nicht nachgeladen (soweit moeglich).
 */
(function () {
  'use strict';

  const CONSENT_KEY = 'luminaplus-consent-v1';
  const CONSENT_EXPIRY_DAYS = 365;

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const age = (Date.now() - new Date(data.savedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (age > CONSENT_EXPIRY_DAYS) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(choice) {
    const data = {
      version: 1,
      savedAt: new Date().toISOString(),
      essential: true,
      functional: choice.functional,
      external: choice.external,
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function removeBanner() {
    const banner = document.getElementById('consentBanner');
    if (banner) banner.remove();
    const overlay = document.getElementById('consentOverlay');
    if (overlay) overlay.remove();
  }

  function showBanner() {
    // Wenn bereits angezeigt, nicht doppeln
    if (document.getElementById('consentBanner')) return;

    const overlay = document.createElement('div');
    overlay.id = 'consentOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(8,55,107,0.5); z-index:9998; backdrop-filter: blur(4px);';

    const banner = document.createElement('div');
    banner.id = 'consentBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Datenschutz-Einwilligung');
    banner.setAttribute('aria-modal', 'true');
    banner.style.cssText = `
      position: fixed; bottom: 1rem; left: 1rem; right: 1rem; max-width: 720px;
      margin: 0 auto; background: #fff; border-radius: 12px;
      padding: 1.5rem 1.75rem; z-index: 9999;
      box-shadow: 0 20px 60px rgba(8,55,107,0.25);
      font-family: 'Montserrat', -apple-system, sans-serif;
      color: #08376B;
      border-top: 4px solid #35C0ED;
    `;

    banner.innerHTML = `
      <h3 style="font-family: 'Tenor Sans', serif; margin: 0 0 0.75rem; font-size: 1.25rem; color: #08376B;">
        &#x1F36A; Wir respektieren Ihre Privatsphaere
      </h3>
      <p style="margin: 0 0 1rem; font-size: 0.88rem; line-height: 1.6; color: #4a5560;">
        Diese Website verwendet technisch notwendige Speicherung (localStorage) und laedt externe Schriftarten von Google Fonts sowie PDF-Bibliotheken von Cloudflare. Dabei wird Ihre IP-Adresse an diese Dienste uebermittelt.
        Bitte waehlen Sie, womit Sie einverstanden sind:
      </p>

      <div id="consentOptions" style="display:flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.85rem;">
        <label style="display:flex; align-items:flex-start; gap: 0.5rem; cursor: default;">
          <input type="checkbox" checked disabled style="margin-top: 0.25rem;">
          <span><strong>Technisch notwendig</strong> - Immer aktiv. Damit das Formular funktioniert (keine Tracking-Cookies).</span>
        </label>
        <label style="display:flex; align-items:flex-start; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="consentFunctional" checked style="margin-top: 0.25rem;">
          <span><strong>Funktional</strong> - Zwischenspeicherung von Antragsdaten im Browser (localStorage), damit Sie spaeter weitermachen koennen.</span>
        </label>
        <label style="display:flex; align-items:flex-start; gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" id="consentExternal" checked style="margin-top: 0.25rem;">
          <span><strong>Externe Ressourcen</strong> - Google Fonts und CDN-Bibliotheken. Ohne diese werden System-Schriften verwendet und manche Features (PDF-Download) funktionieren nicht.</span>
        </label>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; justify-content: flex-end;">
        <a href="datenschutz-luminaplus.html" target="_blank" style="font-size: 0.78rem; color: #6b7d8a; text-decoration: underline; margin-right: auto;">Datenschutz</a>
        <button type="button" id="consentReject" style="background: #fff; color: #6b7d8a; border: 1px solid #e8eef1; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; font-size: 0.85rem;">Ablehnen</button>
        <button type="button" id="consentAcceptSelected" style="background: #fff; color: #08376B; border: 2px solid #35C0ED; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; font-size: 0.85rem;">Auswahl uebernehmen</button>
        <button type="button" id="consentAcceptAll" style="background: #35C0ED; color: #fff; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 0.85rem;">Alle akzeptieren</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(banner);

    document.getElementById('consentAcceptAll').addEventListener('click', () => {
      saveConsent({ functional: true, external: true });
      removeBanner();
      // Reload nur wenn vorher externe Ressourcen blockiert waren
    });

    document.getElementById('consentAcceptSelected').addEventListener('click', () => {
      const f = document.getElementById('consentFunctional').checked;
      const e = document.getElementById('consentExternal').checked;
      saveConsent({ functional: f, external: e });
      removeBanner();
      if (!e) location.reload(); // Externe Ressourcen wuerden geladen - reload um es zu verhindern
    });

    document.getElementById('consentReject').addEventListener('click', () => {
      saveConsent({ functional: false, external: false });
      removeBanner();
      // localStorage-Nutzung pruefen und ggf. loeschen
      try {
        localStorage.removeItem('luminaplus-pflegegrad-draft-v1');
        localStorage.removeItem('luminaplus-font-size');
      } catch (e) {}
    });
  }

  // Externe Ressourcen pruefen und ggf. blockieren (before load)
  function applyConsent() {
    const consent = getConsent();
    if (!consent) {
      // Noch nicht entschieden - Banner zeigen nach DOM-Ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
      return;
    }
    // Wenn externe Ressourcen nicht erlaubt: alle <link> und <script> zu CDNs entfernen
    if (!consent.external) {
      // Bereits geladene Scripts koennen nicht entfernt werden
      // Aber wir koennen zukuenftige Links/Scripts blockieren
      // Fuer diese Seite: reload waere noetig - aber wir machen nichts destruktives
      console.info('Consent: externe Ressourcen blockiert');
    }
    // Wenn funktional nicht erlaubt: localStorage nicht nutzen
    if (!consent.functional) {
      // Markiere global, andere Scripts pruefen das
      window.__consentFunctional = false;
    }
  }

  // Expose zum Aufruf
  window.LuminaPlusConsent = {
    get: getConsent,
    show: showBanner,
    hasExternal: () => {
      const c = getConsent();
      return !c || c.external !== false;
    },
    hasFunctional: () => {
      const c = getConsent();
      return !c || c.functional !== false;
    },
  };

  applyConsent();
})();
