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
                '<form class="fc-cta-form" onsubmit="return false;">' +
                    '<div class="fc-input-group">' +
                        '<input type="text" class="fc-input" placeholder="Full Name" aria-label="Full Name">' +
                        '<input type="email" class="fc-input" placeholder="Email" aria-label="Email">' +
                        '<button type="submit" class="fc-submit" aria-label="Subscribe">' +
                            '<svg width="16" height="16" viewBox="0 0 14 14" fill="none">' +
                                '<path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                            '</svg>' +
                        '</button>' +
                    '</div>' +
                '</form>' +
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
                        '<a href="#" class="fc-legal-link">Privacy Policy</a>' +
                        '<a href="#" class="fc-legal-link">Terms of Service</a>' +
                        '<span class="fc-copyright">&copy; Greenfield Partners. All Rights Reserved.</span>' +
                    '</div>' +
                '</div>' +

            '</div>' +
        '</div>' +
    '</footer>';

    mount.outerHTML = html;
})();
