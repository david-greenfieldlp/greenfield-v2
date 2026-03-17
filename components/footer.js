(function () {
    var mount = document.getElementById('site-footer-mount');
    if (!mount) return;

    var extraClasses = mount.getAttribute('data-extra-classes') || '';
    var theme = mount.getAttribute('data-theme') || '';
    var basePath = mount.getAttribute('data-base-path') || '';

    var classes = 'footer-c2' + (extraClasses ? ' ' + extraClasses : '');
    var themeAttr = theme ? ' data-theme="' + theme + '"' : '';

    var html = '<footer class="' + classes + '" id="footer"' + themeAttr + '>' +

        /* Background layers (image set via CSS) */
        '<div class="fc2-bg"></div>' +
        '<div class="fc2-overlay"></div>' +
        '<div class="fc2-grain"></div>' +

        '<div class="fc2-content">' +

            /* CTA — horizontal band */
            '<div class="fc-cta">' +
                '<h2 class="fc-cta-title">Keep Pace with<br>Greenfield Partners</h2>' +
                '<div class="fc-cta-form-wrap">' +
                    '<form class="fc-cta-form" id="mc-footer-form">' +
                        '<div class="fc-input-group">' +
                            '<input type="text" class="fc-input" id="mc-name" placeholder="First Name" aria-label="First Name" autocomplete="given-name">' +
                            '<input type="email" class="fc-input" id="mc-email" placeholder="Email" aria-label="Email" autocomplete="email" required>' +
                            '<button type="submit" class="fc-submit" id="mc-submit" aria-label="Subscribe">' +
                                '<svg width="16" height="16" viewBox="0 0 14 14" fill="none">' +
                                    '<path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                                '</svg>' +
                            '</button>' +
                        '</div>' +
                    '</form>' +
                    '<div class="fc-form-feedback" id="mc-feedback" role="alert" aria-live="polite"></div>' +
                '</div>' +
            '</div>' +

            /* Body */
            '<div class="fc-body">' +

                /* Top row — logo + nav */
                '<div class="fc-top">' +
                    '<a href="' + basePath + 'index.html" class="fc-logo" aria-label="Greenfield Partners Home">' +
                        '<img src="' + basePath + 'assets/images/partners-for-scale-white.svg" alt="Greenfield Partners for Scale" width="220" height="45">' +
                    '</a>' +
                    '<nav class="fc-nav">' +
                        '<a href="' + basePath + 'index.html">Home</a>' +
                        '<a href="' + basePath + 'approach.html">Approach</a>' +
                        '<a href="' + basePath + 'approach.html#g2m-platform">G<sup>2</sup>M</a>' +
                        '<a href="' + basePath + 'companies.html">Portfolio</a>' +
                        '<a href="' + basePath + 'team.html">Team</a>' +
                        '<a href="' + basePath + 'knowledge/">Knowledge</a>' +
                        '<a href="#">Careers</a>' +
                    '</nav>' +
                '</div>' +

                '<div class="fc-divider"></div>' +

                /* Bottom row — addresses + legal */
                '<div class="fc-bottom">' +
                    '<div class="fc-bottom-left">' +
                        '<div class="fc-address-row">' +
                            '<span class="fc-addr"><strong>NY</strong> 200 Park Avenue South, Suite 403</span>' +
                            '<span class="fc-addr-sep"></span>' +
                            '<span class="fc-addr"><strong>TLV</strong> 144 Menachem Begin Road, Midtown Tower</span>' +
                        '</div>' +
                        '<a href="https://www.linkedin.com/company/greenfieldlp/" target="_blank" rel="noopener" class="fc-bottom-linkedin">' +
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">' +
                                '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' +
                            '</svg>' +
                            '<span>LinkedIn</span>' +
                        '</a>' +
                    '</div>' +
                    '<div class="fc-bottom-right">' +
                        '<a href="' + basePath + 'privacy-policy.html" class="fc-legal-link">Privacy Policy</a>' +
                        '<a href="' + basePath + 'terms-of-service.html" class="fc-legal-link">Terms of Service</a>' +
                        '<span class="fc-copyright">&copy; Greenfield Partners. All Rights Reserved.</span>' +
                    '</div>' +
                '</div>' +

            '</div>' +
        '</div>' +
    '</footer>';

    mount.outerHTML = html;

    /* ── Mailchimp Newsletter Subscription (JSONP) ── */

    var MC_URL = 'https://greenfield-growth.us1.list-manage.com/subscribe/post-json';
    var MC_U = '2b2e97f1c48da9f9f10069f9d';
    var MC_ID = 'bc77a6133b';
    var MC_FID = '000ad5e4f0';
    var MC_HONEYPOT = 'b_2b2e97f1c48da9f9f10069f9d_bc77a6133b';

    var form = document.getElementById('mc-footer-form');
    var nameInput = document.getElementById('mc-name');
    var emailInput = document.getElementById('mc-email');
    var submitBtn = document.getElementById('mc-submit');
    var feedback = document.getElementById('mc-feedback');

    if (!form) return;

    function getFormLocation() {
        var path = window.location.pathname;
        if (path.indexOf('/approach') !== -1) return 'approach';
        if (path.indexOf('/companies') !== -1) return 'portfolio';
        if (path.indexOf('/team') !== -1) return 'team';
        if (path.indexOf('/knowledge') !== -1) return 'knowledge';
        if (path.indexOf('/privacy') !== -1) return 'privacy-policy';
        if (path.indexOf('/terms') !== -1) return 'terms-of-service';
        return 'home';
    }

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
        feedback.className = 'fc-form-feedback';
        if (type === 'clear') {
            feedback.textContent = '';
            feedback.style.display = 'none';
            return;
        }
        feedback.classList.add('fc-feedback-' + type);
        feedback.textContent = message;
        feedback.style.display = 'block';
    }

    function showSuccess() {
        showFeedback('success', "You\u2019re subscribed \u2014 welcome aboard!");
        form.style.display = 'none';
    }

    var jsonpCounter = 0;

    function submitToMailchimp(email, fname, lname) {
        var callbackName = '__mc_cb_' + (++jsonpCounter) + '_' + Date.now();
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

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        showFeedback('clear', '');

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

        setLoading(true);
        submitToMailchimp(email, nameParts.fname, nameParts.lname);
    });

})();
