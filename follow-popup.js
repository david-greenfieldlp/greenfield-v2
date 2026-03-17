/* ============================================
   FOLLOW US — Newsletter Signup Popup
   Clicking "Follow Us" in the nav (desktop or
   mobile) opens a glassmorphism popup with a
   stacked vertical Mailchimp subscription form.
   ============================================ */

(function () {
    'use strict';

    /* ── Mailchimp config (same audience as footer) ── */
    var MC_URL = 'https://greenfield-growth.us1.list-manage.com/subscribe/post-json';
    var MC_U = '2b2e97f1c48da9f9f10069f9d';
    var MC_ID = 'bc77a6133b';
    var MC_FID = '000ad5e4f0';
    var MC_HONEYPOT = 'b_2b2e97f1c48da9f9f10069f9d_bc77a6133b';

    var popup = null;
    var jsonpCounter = 0;

    /* ── Anti-spam: timing gate + rate limit ── */
    var popupRenderedAt = 0;
    var submitCount = 0;
    var MAX_SUBMITS = 3;
    var MIN_TIME_MS = 3000; /* reject if submitted in < 3 seconds */

    /* ── Helpers ── */

    function parseName(raw) {
        var trimmed = raw.trim();
        var spaceIdx = trimmed.indexOf(' ');
        if (spaceIdx === -1) return { fname: trimmed, lname: '' };
        return {
            fname: trimmed.substring(0, spaceIdx),
            lname: trimmed.substring(spaceIdx + 1).trim()
        };
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getFormLocation() {
        return 'follow-popup';
    }

    /* ── Create popup element (once, reused) ── */

    function getOrCreatePopup() {
        if (popup) return popup;

        popup = document.createElement('div');
        popup.id = 'followPopup';
        popup.className = 'fu-popup';
        popup.innerHTML =
            '<div class="fu-popup-inner">' +
                '<h3 class="fu-popup-title">Keep Pace with<br>Greenfield Partners</h3>' +
                '<form class="fu-popup-form" id="fu-form">' +
                    '<input type="text" class="fu-popup-input" id="fu-name" placeholder="First Name" aria-label="First Name" autocomplete="given-name">' +
                    '<input type="text" name="company" id="fu-hp" class="hp-field" tabindex="-1" aria-hidden="true" autocomplete="off">' +
                    '<input type="email" class="fu-popup-input" id="fu-email" placeholder="Email" aria-label="Email" autocomplete="email" required>' +
                    '<button type="submit" class="fu-popup-submit" id="fu-submit">' +
                        '<span>Subscribe</span>' +
                        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
                            '<path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                        '</svg>' +
                    '</button>' +
                '</form>' +
                '<div class="fu-popup-feedback" id="fu-feedback" role="alert" aria-live="polite"></div>' +
            '</div>';

        document.body.appendChild(popup);
        bindForm();
        popupRenderedAt = Date.now();
        return popup;
    }

    /* ── Positioning ── */

    function showPopupDesktop(triggerEl) {
        var el = getOrCreatePopup();
        el.classList.remove('fu-popup-visible');
        popupRenderedAt = Date.now();

        var rect = triggerEl.getBoundingClientRect();

        /* Place below the button, right-aligned */
        el.style.left = '';
        el.style.right = '';
        el.style.top = (rect.bottom + 10) + 'px';
        el.style.left = (rect.right - 300) + 'px'; /* 300 = popup width */

        el.classList.add('fu-popup-visible');

        /* Clamp to viewport edges */
        var popRect = el.getBoundingClientRect();
        var vw = window.innerWidth;
        var vh = window.innerHeight;

        if (popRect.left < 8) {
            el.style.left = '8px';
        }
        if (popRect.right > vw - 8) {
            el.style.left = (vw - 8 - popRect.width) + 'px';
        }
        if (popRect.bottom > vh - 8) {
            el.style.top = (rect.top - popRect.height - 10) + 'px';
        }
    }

    function showPopupMobile() {
        var el = getOrCreatePopup();
        el.classList.remove('fu-popup-visible');
        popupRenderedAt = Date.now();

        /* Center on screen */
        var popW = 300; /* will be overridden by CSS on mobile */
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transform = 'translate(-50%, -50%) scale(0.96)';

        el.classList.add('fu-popup-visible');
        el.style.transform = 'translate(-50%, -50%) scale(1)';
    }

    function hidePopup() {
        if (popup) {
            popup.classList.remove('fu-popup-visible');
            /* Reset transform for desktop positioning */
            popup.style.transform = '';
        }
    }

    /* ── Form logic ── */

    function bindForm() {
        var form = document.getElementById('fu-form');
        var nameInput = document.getElementById('fu-name');
        var emailInput = document.getElementById('fu-email');
        var submitBtn = document.getElementById('fu-submit');
        var feedback = document.getElementById('fu-feedback');

        if (!form) return;

        function setLoading(loading) {
            submitBtn.disabled = loading;
            nameInput.disabled = loading;
            emailInput.disabled = loading;
            if (loading) {
                form.classList.add('is-loading');
            } else {
                form.classList.remove('is-loading');
            }
        }

        function showFeedback(type, message) {
            feedback.className = 'fu-popup-feedback';
            if (type === 'clear') {
                feedback.textContent = '';
                feedback.style.display = 'none';
                return;
            }
            feedback.classList.add('fu-feedback-' + type);
            feedback.textContent = message;
            feedback.style.display = 'block';
        }

        function showSuccess() {
            showFeedback('success', "You\u2019re subscribed \u2014 welcome aboard!");
            form.style.display = 'none';
        }

        function submitToMailchimp(email, fname, lname) {
            var callbackName = '__fu_cb_' + (++jsonpCounter) + '_' + Date.now();
            var timeout;

            var pageUrl = window.location.href;
            var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            var params = [
                'u=' + encodeURIComponent(MC_U),
                'id=' + encodeURIComponent(MC_ID),
                'f_id=' + encodeURIComponent(MC_FID),
                'EMAIL=' + encodeURIComponent(email),
                'FNAME=' + encodeURIComponent(fname),
                'LNAME=' + encodeURIComponent(lname),
                'FORM_LOCAT=' + encodeURIComponent(getFormLocation()),
                MC_HONEYPOT + '=',
                'c=' + callbackName
            ];
            if (!isLocal) params.splice(7, 0, 'PAGE_URL=' + encodeURIComponent(pageUrl));
            var url = MC_URL + '?' + params.join('&');

            var script = document.createElement('script');
            script.src = url;

            function cleanup() {
                clearTimeout(timeout);
                try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
                if (script.parentNode) script.parentNode.removeChild(script);
            }

            window[callbackName] = function (data) {
                cleanup();
                setLoading(false);

                if (data && data.result === 'success') {
                    showSuccess();
                } else {
                    var msg = (data && data.msg) || 'Something went wrong. Please try again.';
                    msg = msg.replace(/<[^>]*>/g, '');
                    if (msg.toLowerCase().indexOf('already subscribed') !== -1) {
                        msg = 'This email is already subscribed!';
                    }
                    showFeedback('error', msg);
                }
            };

            timeout = setTimeout(function () {
                cleanup();
                setLoading(false);
                showFeedback('error', 'Request timed out. Please check your connection and try again.');
            }, 8000);

            script.onerror = function () {
                cleanup();
                setLoading(false);
                showFeedback('error', 'Could not reach the server. Please try again later.');
            };

            document.body.appendChild(script);
        }

        var hpInput = document.getElementById('fu-hp');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            showFeedback('clear', '');

            /* Anti-spam: honeypot — if filled, silently fake success */
            if (hpInput && hpInput.value) {
                showSuccess();
                return;
            }

            /* Anti-spam: timing gate — reject instant submissions */
            if (Date.now() - popupRenderedAt < MIN_TIME_MS) {
                showSuccess();
                return;
            }

            /* Anti-spam: rate limit — max submissions per session */
            if (submitCount >= MAX_SUBMITS) {
                showFeedback('error', 'Too many attempts. Please refresh the page.');
                return;
            }

            var email = emailInput.value.trim();
            var nameParts = parseName(nameInput.value);

            if (!email) {
                showFeedback('error', 'Please enter your email address.');
                emailInput.focus();
                return;
            }
            if (!isValidEmail(email)) {
                showFeedback('error', 'Please enter a valid email address.');
                emailInput.focus();
                return;
            }

            submitCount++;
            setLoading(true);
            submitToMailchimp(email, nameParts.fname, nameParts.lname);
        });
    }

    /* ── Click handler (document-level delegation) ── */

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('a[href="#follow"]');
        if (!trigger) return;

        e.preventDefault();

        /* If popup is already visible, toggle it off */
        if (popup && popup.classList.contains('fu-popup-visible')) {
            hidePopup();
            return;
        }

        var isMobile = trigger.classList.contains('mobile-cta') ||
                       trigger.classList.contains('mobile-menu-link');

        if (isMobile) {
            /* Mobile menu auto-closes on link click (nav-scroll.js).
               Delay popup so the menu animation finishes first. */
            setTimeout(function () {
                showPopupMobile();
            }, 380);
        } else {
            showPopupDesktop(trigger);
        }
    });

    /* ── Click-outside to dismiss ── */

    document.addEventListener('click', function (e) {
        if (!popup) return;
        if (!popup.classList.contains('fu-popup-visible')) return;

        /* Don't dismiss if clicking the trigger or inside the popup */
        if (e.target.closest('a[href="#follow"]')) return;
        if (popup.contains(e.target)) return;

        hidePopup();
    });

    /* ── Escape key to dismiss ── */

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popup && popup.classList.contains('fu-popup-visible')) {
            hidePopup();
        }
    });

    /* ── Dismiss on scroll ── */

    window.addEventListener('scroll', function () {
        if (popup && popup.classList.contains('fu-popup-visible')) {
            hidePopup();
        }
    }, { passive: true });

    /* Approach page snap container scroll */
    var snapEl = document.getElementById('mainSnap');
    if (snapEl) {
        snapEl.addEventListener('scroll', function () {
            if (popup && popup.classList.contains('fu-popup-visible')) {
                hidePopup();
            }
        }, { passive: true });
    }

})();
