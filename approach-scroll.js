/* ============================================
   APPROACH PAGE — Scroll-Snap Controller
   Dot nav, entrance animations, chart, tabs,
   diagram interactions. No Lenis.
   ============================================ */

(function () {
    'use strict';

    var container = document.getElementById('snapContainer');
    var sections  = container ? container.querySelectorAll('.snap-section') : [];
    var dots      = document.querySelectorAll('#snapDots .snap-dot');

    /* ---------- MOBILE NAV (hamburger toggle) ---------- */
    var hamburger  = document.getElementById('navHamburger');
    var mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }


    /* ============================================
       DOT NAVIGATION
       ============================================ */

    // Track which section is currently in view
    var currentSection = 0;

    function updateDots(index) {
        currentSection = index;
        dots.forEach(function (dot, i) {
            dot.classList.toggle('snap-dot--active', i === index);

            // Swap dot colour based on section theme
            var theme = sections[index] ? sections[index].dataset.theme : 'dark';
            dot.classList.toggle('snap-dot--light', theme === 'light');
        });
    }

    // Click a dot → scroll to that section
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var idx = parseInt(dot.dataset.section, 10);
            if (sections[idx] && container) {
                sections[idx].scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Observe sections to determine which is active
    if (container && sections.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var idx = Array.prototype.indexOf.call(sections, entry.target);
                    if (idx !== -1) updateDots(idx);
                }
            });
        }, {
            root: container,
            threshold: 0.55
        });

        sections.forEach(function (sec) { observer.observe(sec); });
    }

    // Handle #hash on page load (e.g. approach.html#g2m-platform)
    function scrollToHash() {
        var hash = window.location.hash;
        if (hash && container) {
            var target = document.querySelector(hash);
            if (target && container.contains(target)) {
                // Small delay to let layout settle
                setTimeout(function () {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }
    scrollToHash();


    /* ============================================
       ENTRANCE ANIMATIONS — IntersectionObserver
       ============================================ */

    var revealEls = document.querySelectorAll('.snap-reveal');

    if (revealEls.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('snap-reveal--visible');
                }
            });
        }, {
            root: container,
            threshold: 0.15
        });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }


    /* ============================================
       TABS — Pill tab switching (approach section)
       ============================================ */

    (function () {
        var buttons = document.querySelectorAll('.approach-tab-btn');
        var panels  = document.querySelectorAll('.approach-tab-panel');

        function restartSVG(id) {
            var old = document.getElementById(id);
            if (!old) return;
            var clone = old.cloneNode(true);
            old.parentNode.replaceChild(clone, old);
        }

        function activate(index) {
            buttons.forEach(function (btn, i) {
                var isActive = i === index;
                btn.classList.toggle('approach-tab-btn--active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');

                // Skip filter toggling for inline SVG icons
                var img = btn.querySelector('.approach-tab-icon-img');
                if (img && img.tagName.toLowerCase() !== 'svg') {
                    img.classList.toggle('approach-tab-icon-img--active', isActive);
                }

                var iconWrap = btn.querySelector('.approach-tab-icon');
                if (iconWrap) iconWrap.classList.toggle('approach-tab-icon--active', isActive);
            });

            panels.forEach(function (panel, i) {
                panel.classList.toggle('approach-tab-panel--active', i === index);
            });

            // Replay animated SVG icons on activation
            if (index === 0) restartSVG('tailored-crosshair-svg');
            if (index === 1) restartSVG('g2m-mountain-svg');
            if (index === 2) restartSVG('heritage-plant-svg');
        }

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                activate(parseInt(btn.dataset.tab, 10));
            });
        });
    })();


    /* ============================================
       ACCORDION — Science of Growth cards
       ============================================ */

    (function () {
        var cards = document.querySelectorAll('.accordion-card');
        if (!cards.length) return;

        function openCard(card) {
            card.classList.add('accordion-card--open');
            var btn = card.querySelector('.accordion-card-header');
            if (btn) btn.setAttribute('aria-expanded', 'true');
            var panel = card.querySelector('.accordion-card-panel');
            if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        }

        function closeCard(card) {
            card.classList.remove('accordion-card--open');
            var btn = card.querySelector('.accordion-card-header');
            if (btn) btn.setAttribute('aria-expanded', 'false');
            var panel = card.querySelector('.accordion-card-panel');
            if (panel) panel.style.maxHeight = '0px';
        }

        function toggleCard(target) {
            var isOpen = target.classList.contains('accordion-card--open');
            cards.forEach(function (card) {
                if (card === target) {
                    isOpen ? closeCard(card) : openCard(card);
                } else {
                    closeCard(card);
                }
            });
        }

        // Attach click handlers
        cards.forEach(function (card) {
            var header = card.querySelector('.accordion-card-header');
            if (header) {
                header.addEventListener('click', function () {
                    toggleCard(card);
                });
            }
        });

        // Initialise: set first-open card's max-height
        cards.forEach(function (card) {
            if (card.classList.contains('accordion-card--open')) {
                var panel = card.querySelector('.accordion-card-panel');
                if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    })();


    /* ============================================
       FLYWHEEL — Stepper + Card switching
       ============================================ */

    (function () {
        var pins    = document.querySelectorAll('.flywheel-pin');
        var panels  = document.querySelectorAll('.flywheel-panel');
        var fill    = document.getElementById('flywheelTrackFill');
        var prevBtn = document.getElementById('flywheelPrev');
        var nextBtn = document.getElementById('flywheelNext');
        var current = 0;

        if (!pins.length) return;

        function getFillPercent(index) {
            var total = pins.length - 1;
            if (total <= 0) return 0;
            return (index / total) * 100;
        }

        function activate(index) {
            current = index;
            var last = pins.length - 1;

            pins.forEach(function (pin, i) {
                var isActive = i === index;
                var isPast   = i < index;
                pin.classList.toggle('flywheel-pin--active', isActive);
                pin.classList.toggle('flywheel-pin--past', isPast);
                pin.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach(function (panel, i) {
                panel.classList.toggle('flywheel-panel--active', i === index);
            });

            if (fill) {
                fill.style.width = getFillPercent(index) + '%';
            }

            // Update Prev button
            if (prevBtn) {
                prevBtn.classList.toggle('flywheel-nav-btn--hidden', index === 0);
            }

            // Update Next button label
            if (nextBtn) {
                nextBtn.classList.toggle('flywheel-nav-btn--hidden', false);
                nextBtn.innerHTML = index === last
                    ? 'Next Quarter &#8250;'
                    : 'Next &#8250;';
            }
        }

        // Pin clicks
        pins.forEach(function (pin) {
            pin.addEventListener('click', function () {
                activate(parseInt(pin.dataset.flywheel, 10));
            });
        });

        // Prev / Next button clicks
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                if (current > 0) activate(current - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                if (current < pins.length - 1) {
                    activate(current + 1);
                } else {
                    // "Next Quarter" — loop back to Diagnose
                    activate(0);
                }
            });
        }

        // Initialise: first pin active, fill at 0%
        activate(0);
    })();


    /* ============================================
       ORION PLATFORM — Feature toggle
       ============================================ */

    (function () {
        var features = document.querySelectorAll('.orion-feature');
        var panels   = document.querySelectorAll('.orion-dash-panel');
        var label    = document.getElementById('orionDashLabel');

        if (!features.length) return;

        function activate(id) {
            features.forEach(function (btn) {
                btn.classList.toggle('orion-feature--active', btn.dataset.orion === id);
            });
            panels.forEach(function (panel) {
                panel.classList.toggle('orion-dash-panel--active', panel.dataset.orionPanel === id);
            });
            if (label) {
                var activeTitle = document.querySelector('.orion-feature--active .orion-feature-title');
                label.textContent = activeTitle ? activeTitle.textContent : '';
            }
        }

        features.forEach(function (btn) {
            btn.addEventListener('click', function () {
                activate(btn.dataset.orion);
            });
        });

        // Initialise: benchmark active
        activate('benchmark');
    })();


    /* ============================================
       INFLECTION DIAGRAM — Desktop + Mobile
       ============================================ */

    (function () {
        var columns        = document.querySelectorAll('#approachDiagramColumns .diagram-col');
        var modals         = document.querySelectorAll('#approachDiagramModals .diagram-modal');
        var diagramDesktop = document.getElementById('approachDiagramDesktop');

        function setDefault() {
            columns.forEach(function (col) {
                col.classList.toggle('hovered', col.dataset.col === '1');
            });
            modals.forEach(function (modal) {
                modal.classList.toggle('visible', modal.dataset.modal === '1');
            });
        }

        // Desktop: hover column → show matching modal
        columns.forEach(function (col) {
            var colIndex = col.dataset.col;

            col.addEventListener('mouseenter', function () {
                columns.forEach(function (c) { c.classList.remove('hovered'); });
                col.classList.add('hovered');
                modals.forEach(function (modal) {
                    modal.classList.toggle('visible', modal.dataset.modal === colIndex);
                });
            });
        });

        // Keep modal visible when cursor moves onto it
        modals.forEach(function (modal) {
            var modalIndex = modal.dataset.modal;

            modal.addEventListener('mouseenter', function () {
                modals.forEach(function (m) { m.classList.remove('visible'); });
                modal.classList.add('visible');
                columns.forEach(function (col) {
                    col.classList.toggle('hovered', col.dataset.col === modalIndex);
                });
            });
        });

        // Restore default when cursor leaves the entire diagram
        if (diagramDesktop) {
            diagramDesktop.addEventListener('mouseleave', setDefault);
        }

        // Initialise with default state on load
        setDefault();

        // Mobile: tab + dot switching
        var mobileTabs   = document.querySelectorAll('#approachDiagramMobile .diagram-mobile-tab');
        var mobileSlides = document.querySelectorAll('#approachDiagramMobile .diagram-mobile-slide');
        var mobileDots   = document.querySelectorAll('#approachDiagramMobile .diagram-mobile-dot');

        function switchSlide(index) {
            mobileTabs.forEach(function (t, i)   { t.classList.toggle('diagram-mobile-tab-active',   i == index); });
            mobileSlides.forEach(function (s, i)  { s.classList.toggle('diagram-mobile-slide-active', i == index); });
            mobileDots.forEach(function (d, i)    { d.classList.toggle('diagram-mobile-dot-active',   i == index); });
        }

        mobileTabs.forEach(function (tab) {
            tab.addEventListener('click', function () { switchSlide(tab.dataset.tab); });
        });
        mobileDots.forEach(function (dot) {
            dot.addEventListener('click', function () { switchSlide(dot.dataset.dot); });
        });
    })();


    /* ============================================
       SURVIVAL RATE CHART — Dynamic render
       ============================================ */

    var STAGE_DATA = [
        { stage: 'Product-Market Fit', arr: '$0-3M ARR',    survivors: 100, failRate: null },
        { stage: 'Go-To-Market Fit',   arr: '$3-30M ARR',   survivors: 60,  failRate: 40 },
        { stage: 'Scale-Market Fit',    arr: '$30-100M ARR', survivors: 20,  failRate: 66 },
        { stage: '$100M+ ARR',          arr: '',             survivors: 3,   failRate: 85 },
    ];

    var chartArea = document.getElementById('g2mChartArea');
    var labelsRow = document.getElementById('g2mChartLabels');

    function isMobileChart() { return window.innerWidth < 768; }

    function buildChart() {
        if (!chartArea) return;

        // Clear previous dynamic elements (keep the SVG)
        chartArea.querySelectorAll('.g2m-bar, .g2m-gap-zone, .g2m-tooltip').forEach(function (el) { el.remove(); });
        if (labelsRow) labelsRow.innerHTML = '';

        var h = chartArea.offsetHeight;
        var w = chartArea.offsetWidth;
        var mobile = isMobileChart();
        var barW = mobile ? 40 : 55;
        var count = STAGE_DATA.length;
        var spacing = w / count;

        /* --- Render bars --- */
        STAGE_DATA.forEach(function (d, i) {
            var barH = (d.survivors / 100) * h;
            var cx = spacing * i + spacing / 2;
            var left = cx - barW / 2;

            // Bar element
            var bar = document.createElement('div');
            bar.className = 'g2m-bar';
            bar.dataset.index = i;
            bar.style.left = left + 'px';
            bar.style.width = barW + 'px';
            bar.style.height = barH + 'px';

            // Label inside bar (or above for tiny)
            if (i === count - 1) {
                var labelAbove = document.createElement('span');
                labelAbove.className = 'g2m-bar-label-above';
                labelAbove.textContent = d.survivors + '%';
                bar.appendChild(labelAbove);
            } else {
                var label = document.createElement('span');
                label.className = 'g2m-bar-label';
                label.textContent = d.survivors + '%';
                bar.appendChild(label);
            }

            // Tooltip
            var tip = document.createElement('div');
            tip.className = 'g2m-tooltip g2m-tooltip-bar';
            tip.innerHTML =
                '<div class="g2m-tooltip-title">' + d.survivors + '% survive</div>' +
                '<div class="g2m-tooltip-sub">' + d.stage + '</div>' +
                (d.arr ? '<div class="g2m-tooltip-sub">' + d.arr + '</div>' : '');
            chartArea.appendChild(tip);

            // Position tooltip above bar center
            function positionBarTooltip() {
                var tipW = tip.offsetWidth;
                var tipLeft = left + barW / 2 - tipW / 2;
                tipLeft = Math.max(0, Math.min(tipLeft, w - tipW));
                tip.style.left = tipLeft + 'px';
                tip.style.bottom = (barH + 12) + 'px';
            }

            bar.addEventListener('mouseenter', function () {
                bar.classList.add('g2m-bar-hovered');
                positionBarTooltip();
                tip.classList.add('g2m-tooltip-visible');
            });
            bar.addEventListener('mouseleave', function () {
                bar.classList.remove('g2m-bar-hovered');
                tip.classList.remove('g2m-tooltip-visible');
            });

            // Touch support
            bar.addEventListener('touchstart', function (e) {
                e.preventDefault();
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(function (t) { t.classList.remove('g2m-tooltip-visible'); });
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(function (b) { b.classList.remove('g2m-bar-hovered'); });
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(function (g) { g.classList.remove('g2m-gap-hovered'); });
                bar.classList.add('g2m-bar-hovered');
                positionBarTooltip();
                tip.classList.add('g2m-tooltip-visible');
            }, { passive: false });

            chartArea.appendChild(bar);
        });

        /* --- Render gap indicators --- */
        STAGE_DATA.forEach(function (d, i) {
            if (d.failRate === null) return;

            var prevS = STAGE_DATA[i - 1].survivors;
            var currS = d.survivors;
            var topOfPrev = h - (prevS / 100) * h;
            var topOfCurr = h - (currS / 100) * h;
            var gapH = topOfCurr - topOfPrev;

            var prevCx = spacing * (i - 1) + spacing / 2;
            var currCx = spacing * i + spacing / 2;
            var gapCx = (prevCx + currCx) / 2;

            var zone = document.createElement('div');
            zone.className = 'g2m-gap-zone';
            zone.style.left = (gapCx - 24) + 'px';
            zone.style.width = '48px';
            zone.style.top = topOfPrev + 'px';
            zone.style.height = Math.max(gapH, 20) + 'px';

            var lineTop = document.createElement('div');
            lineTop.className = 'g2m-gap-line g2m-gap-line-top';
            zone.appendChild(lineTop);

            var stem = document.createElement('div');
            stem.className = 'g2m-gap-stem';
            zone.appendChild(stem);

            var lineBot = document.createElement('div');
            lineBot.className = 'g2m-gap-line g2m-gap-line-bottom';
            zone.appendChild(lineBot);

            var pill = document.createElement('div');
            pill.className = 'g2m-gap-pill';
            pill.textContent = d.failRate + '%';
            zone.appendChild(pill);

            // Gap tooltip
            var gapTip = document.createElement('div');
            gapTip.className = 'g2m-tooltip g2m-tooltip-gap';
            gapTip.innerHTML =
                '<div class="g2m-tooltip-title">' + d.failRate + '% fail to reach</div>' +
                '<div class="g2m-tooltip-sub">' + d.stage + '</div>';
            chartArea.appendChild(gapTip);

            function positionGapTooltip() {
                var tipH = gapTip.offsetHeight;
                var tipW = gapTip.offsetWidth;
                var tipLeft = gapCx + 30;
                var tipTop = topOfPrev + gapH / 2 - tipH / 2;
                if (tipLeft + tipW > w) {
                    tipLeft = gapCx - tipW - 30;
                    gapTip.classList.add('g2m-tooltip-gap-flipped');
                } else {
                    gapTip.classList.remove('g2m-tooltip-gap-flipped');
                }
                gapTip.style.left = tipLeft + 'px';
                gapTip.style.top = tipTop + 'px';
            }

            pill.addEventListener('mouseenter', function () {
                pill.classList.add('g2m-gap-hovered');
                positionGapTooltip();
                gapTip.classList.add('g2m-tooltip-visible');
            });
            pill.addEventListener('mouseleave', function () {
                pill.classList.remove('g2m-gap-hovered');
                gapTip.classList.remove('g2m-tooltip-visible');
            });

            pill.addEventListener('touchstart', function (e) {
                e.preventDefault();
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(function (t) { t.classList.remove('g2m-tooltip-visible'); });
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(function (b) { b.classList.remove('g2m-bar-hovered'); });
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(function (g) { g.classList.remove('g2m-gap-hovered'); });
                pill.classList.add('g2m-gap-hovered');
                positionGapTooltip();
                gapTip.classList.add('g2m-tooltip-visible');
            }, { passive: false });

            chartArea.appendChild(zone);
        });

        /* --- Render X-axis labels --- */
        if (labelsRow) {
            STAGE_DATA.forEach(function (d) {
                var div = document.createElement('div');
                div.className = 'g2m-chart-label';
                div.innerHTML =
                    '<span class="g2m-chart-label-stage">' + d.stage + '</span>' +
                    (d.arr ? '<span class="g2m-chart-label-arr">' + d.arr + '</span>' : '');
                labelsRow.appendChild(div);
            });
        }
    }

    // Dismiss tooltips on outside tap (mobile)
    document.addEventListener('touchstart', function (e) {
        if (!e.target.closest('.g2m-bar') && !e.target.closest('.g2m-gap-pill')) {
            if (chartArea) {
                chartArea.querySelectorAll('.g2m-tooltip-visible').forEach(function (t) { t.classList.remove('g2m-tooltip-visible'); });
                chartArea.querySelectorAll('.g2m-bar-hovered').forEach(function (b) { b.classList.remove('g2m-bar-hovered'); });
                chartArea.querySelectorAll('.g2m-gap-hovered').forEach(function (g) { g.classList.remove('g2m-gap-hovered'); });
            }
        }
    });

    // Build chart & rebuild on resize
    buildChart();
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildChart, 150);
    });


    /* ============================================
       GSAP SCROLL-TRIGGERED ANIMATIONS
       (adapted for snap container as scroller)
       ============================================ */

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && container) {
        // Tell ScrollTrigger to use the snap container as the scrolling element
        ScrollTrigger.defaults({ scroller: container });
        ScrollTrigger.scrollerProxy(container, {
            scrollTop: function (value) {
                if (arguments.length) {
                    container.scrollTop = value;
                }
                return container.scrollTop;
            },
            getBoundingClientRect: function () {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },
            pinType: 'transform'
        });

        // Refresh ScrollTrigger on snap container scroll
        container.addEventListener('scroll', function () { ScrollTrigger.update(); });
        ScrollTrigger.addEventListener('refresh', function () { return ScrollTrigger.update(); });

        // Thesis section animations
        var thesisSection = document.querySelector('.g2m-thesis');

        if (thesisSection) {
            // Chart card entrance
            gsap.from('.g2m-chart-card', {
                opacity: 0,
                y: 50,
                scale: 0.97,
                duration: 0.9,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.g2m-chart-card',
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });

            // Bars animate from 0 height
            gsap.from('.g2m-bar', {
                scaleY: 0,
                transformOrigin: 'bottom center',
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: '.g2m-chart-area',
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });

            // Gap zones fade in after bars
            gsap.from('.g2m-gap-zone', {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                stagger: 0.15,
                delay: 0.3,
                scrollTrigger: {
                    trigger: '.g2m-chart-area',
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            });

            // Chart labels
            gsap.from('.g2m-chart-label', {
                opacity: 0,
                y: 12,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.08,
                delay: 0.3,
                scrollTrigger: {
                    trigger: '.g2m-chart-labels',
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                },
            });

            // Thesis divider
            gsap.to('.g2m-thesis-divider', {
                opacity: 1,
                scaleX: 1,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.g2m-thesis',
                    start: 'top 70%',
                    toggleActions: 'play none none none',
                },
            });
        }

        // Mission alt animations
        var missionAlt = document.querySelector('.g2m-mission-alt');

        if (missionAlt) {
            // Rule sweeps out from left
            gsap.to('.g2m-mission-alt-rule', {
                opacity: 1,
                scaleX: 1,
                duration: 0.7,
                ease: 'power2.out',
                delay: 0.1,
                scrollTrigger: {
                    trigger: '.g2m-mission-alt',
                    start: 'top 72%',
                },
            });
        }

        // Refresh after initial layout
        setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }

})();

/* ══════════════════════════════════════════════════════
   SEVEN PILLARS — accordion toggle
   ══════════════════════════════════════════════════════ */
(function () {
    var items       = document.querySelectorAll('.pillar-item');
    var activeIndex = -1;

    if (!items.length) return;

    function open(index) {
        items[index].classList.add('pillar-item--active');
        items[index].setAttribute('aria-expanded', 'true');
        activeIndex = index;
    }

    function close(index) {
        items[index].classList.remove('pillar-item--active');
        items[index].setAttribute('aria-expanded', 'false');
    }

    items.forEach(function (item, i) {
        item.setAttribute('aria-expanded', 'false');
        item.addEventListener('click', function () {
            if (activeIndex === i) {
                close(i);
                activeIndex = -1;
            } else {
                if (activeIndex >= 0) close(activeIndex);
                open(i);
            }
        });
    });
})();
