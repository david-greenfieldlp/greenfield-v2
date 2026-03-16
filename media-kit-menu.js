/* ============================================
   MEDIA KIT CONTEXT MENU
   Right-click on nav logo or footer logo
   shows a "Download our media kit" popup.
   Desktop only — no mobile long-press.
   ============================================ */

(function () {
    'use strict';

    var POPUP_ID = 'mediaKitPopup';
    var ZIP_PATH = 'assets/media-kit/greenfield-media-kit.zip';
    var popup = null;

    /* ── Resolve zip path relative to page depth ── */
    function resolveZipPath() {
        var navLogo = document.querySelector('.nav-logo');
        if (navLogo) {
            var href = navLogo.getAttribute('href') || '';
            var base = href.replace('index.html', '');
            return base + ZIP_PATH;
        }
        return ZIP_PATH;
    }

    /* ── Create the popup element (once, reused) ── */
    function getOrCreatePopup() {
        if (popup) return popup;

        popup = document.createElement('div');
        popup.id = POPUP_ID;
        popup.className = 'mk-popup';
        popup.innerHTML =
            '<a class="mk-popup-link" download="greenfield-media-kit.zip">' +
                '<svg class="mk-popup-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">' +
                    '<path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" stroke-width="1.5" ' +
                    'stroke-linecap="round" stroke-linejoin="round"/>' +
                    '<path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" ' +
                    'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
                '<span>Download our media kit</span>' +
            '</a>';

        popup.querySelector('.mk-popup-link').href = resolveZipPath();
        document.body.appendChild(popup);

        /* Close after clicking the download link */
        popup.querySelector('.mk-popup-link').addEventListener('click', function () {
            hidePopup();
        });

        return popup;
    }

    /* ── Show popup near cursor ── */
    function showPopup(x, y) {
        var el = getOrCreatePopup();
        el.classList.remove('mk-popup-visible');

        /* Position at cursor */
        el.style.left = x + 'px';
        el.style.top  = y + 'px';

        /* Make visible so we can measure */
        el.classList.add('mk-popup-visible');

        /* Clamp to viewport edges */
        var rect = el.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;

        if (rect.right > vw - 8) {
            el.style.left = (x - rect.width) + 'px';
        }
        if (rect.bottom > vh - 8) {
            el.style.top = (y - rect.height) + 'px';
        }
    }

    function hidePopup() {
        if (popup) {
            popup.classList.remove('mk-popup-visible');
        }
    }

    /* ── Is the target inside one of the two logos? ── */
    function isLogoTarget(target) {
        return target.closest('.nav-logo') || target.closest('.fc-logo');
    }

    /* ── Context menu handler (document-level delegation) ── */
    document.addEventListener('contextmenu', function (e) {
        if (!isLogoTarget(e.target)) return;

        /* Desktop only: skip if touch device */
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

        e.preventDefault();
        showPopup(e.clientX, e.clientY);
    });

    /* ── Click-outside to dismiss ── */
    document.addEventListener('click', function (e) {
        if (!popup) return;
        if (!popup.classList.contains('mk-popup-visible')) return;

        if (!popup.contains(e.target)) {
            hidePopup();
        }
    });

    /* ── Escape key to dismiss ── */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hidePopup();
    });

    /* ── Dismiss on scroll ── */
    window.addEventListener('scroll', function () {
        hidePopup();
    }, { passive: true });

})();
