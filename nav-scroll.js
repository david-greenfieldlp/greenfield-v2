/* ============================================
   GLOBAL NAV SCROLL BEHAVIOR
   Hide on scroll down, show on scroll up,
   blue background when away from top,
   transparent at very top of page.

   On snap-container pages: nav stays always visible,
   uses container scrollTop instead of window.scrollY.
   ============================================ */

(function () {
    'use strict';

    var nav = document.getElementById('nav');
    if (!nav) return;

    // Detect snap-container page (approach page)
    var snapContainer = document.querySelector('.snap-container');
    var isSnapPage = !!snapContainer;

    // On mobile, snap is disabled and window is the scroller
    var isMobile = window.innerWidth <= 768;
    var useWindowScroll = !isSnapPage || isMobile;

    var lastScrollY = 0;
    var scrollUpAccumulator = 0;
    var isHidden = false;

    var SHOW_THRESHOLD = 30;   // px of cumulative upward scroll to re-show
    var HIDE_THRESHOLD = 80;   // don't hide until scrolled past nav height
    var SCROLL_CLASS = 'scrolled';
    var HIDDEN_CLASS = 'nav-hidden';

    function getScrollY() {
        if (!useWindowScroll && snapContainer) {
            return snapContainer.scrollTop;
        }
        return window.scrollY;
    }

    function onScroll() {
        var currentScrollY = getScrollY();

        // At top of page: transparent, always visible
        if (currentScrollY <= 10) {
            nav.classList.remove(SCROLL_CLASS);
            nav.classList.remove(HIDDEN_CLASS);
            isHidden = false;
            scrollUpAccumulator = 0;
            lastScrollY = currentScrollY;
            return;
        }

        // Below top: add scrolled background
        nav.classList.add(SCROLL_CLASS);

        // On desktop snap pages: never hide the nav (discrete jumps feel disorienting)
        if (isSnapPage && !isMobile) {
            nav.classList.remove(HIDDEN_CLASS);
            isHidden = false;
            lastScrollY = currentScrollY;
            return;
        }

        var delta = currentScrollY - lastScrollY;

        if (delta > 0) {
            // Scrolling DOWN
            scrollUpAccumulator = 0;
            if (currentScrollY > HIDE_THRESHOLD && !isHidden) {
                nav.classList.add(HIDDEN_CLASS);
                isHidden = true;
            }
        } else if (delta < 0) {
            // Scrolling UP — accumulate before showing
            scrollUpAccumulator += Math.abs(delta);
            if (scrollUpAccumulator > SHOW_THRESHOLD && isHidden) {
                nav.classList.remove(HIDDEN_CLASS);
                isHidden = false;
            }
        }

        lastScrollY = currentScrollY;
    }

    // Listen on the right scroll target
    if (!useWindowScroll && snapContainer) {
        snapContainer.addEventListener('scroll', onScroll, { passive: true });
    } else {
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Initial check (in case page loads mid-scroll)
    onScroll();

    // ── Mobile hamburger toggle ──────────────────────────────
    var hamburger = document.getElementById('navHamburger');
    var mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when any nav link is clicked
        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
})();
