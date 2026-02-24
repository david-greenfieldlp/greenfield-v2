/* ============================================
   BENTO GRID ROTATION — Landing V3
   8 slots, clockwise rotation
   10-company pool (8 initial + 2 staged)

   Clockwise slot order:
     0 = VAST Data   (large left card — entry)
     1 = Exodigo     (medium top-right, upper)
     2 = Coralogix   (medium top-right, lower)
     3 = Silverfort  (bottom row, rightmost)
     4 = AAI         (bottom row, 4th from left)
     5 = Torq        (bottom row, 3rd / middle)
     6 = RobCo       (bottom row, 2nd from left)
     7 = Commcrete   (bottom row, leftmost — exit)
   ============================================ */

(function () {
    'use strict';

    const ROTATION_INTERVAL = 7000;   // ms between rotations
    const FADE_DURATION     = 0.6;    // seconds per crossfade
    const STAGGER_DELAY     = 0.07;   // seconds between each slot's fade
    const INITIAL_DELAY     = 4000;   // ms before first rotation
    const SLOT_COUNT        = 8;

    // ── 10-company pool ────────────────────────────
    const PORTFOLIO_V3 = [
        { id: 'vast',       name: 'VAST Data',  sector: 'AI Infrastructure', category: 'ai-infra',      description: 'The Data Platform Company for the AI Era',                 round: 'Led Series B', year: 2019, favicon: 'assets/Favicons/vast favicon.png',                          bg: 'assets/portfolio bgs/vast bg.png'         },
        { id: 'exodigo',    name: 'Exodigo',    sector: 'Deep Tech',         category: 'deep-tech',     description: 'Non-Intrusive Underground Mapping',                        round: 'Led Series A', year: 2023, favicon: 'assets/Favicons/exodigo favicon.png',                       bg: 'assets/portfolio bgs/exodigo bg.png'      },
        { id: 'coralogix',  name: 'Coralogix',  sector: 'IT Infrastructure', category: 'it-infra',      description: 'Observability and Security that Scale with You',            round: 'Led Series B', year: 2021, favicon: 'assets/Coralogix/cropped-cropped-favicon-192x192.png',      bg: 'assets/portfolio bgs/coralogix bg.png'    },
        { id: 'silverfort', name: 'Silverfort', sector: 'Cybersecurity',     category: 'cybersecurity', description: 'Where Identity Security has Never Gone Before',             round: 'Led Series C', year: 2022, favicon: 'assets/Favicons/silverfort favicon.png',                    bg: 'assets/portfolio bgs/silverfort bg.png'   },
        { id: 'aai',        name: 'AAI',        sector: 'AI Infrastructure', category: 'aai',           description: 'Cracking the Code of Superintelligence',                   round: 'Series A',     year: 2025, favicon: 'assets/Favicons/AAI favicon.png',                          bg: 'assets/portfolio bgs/aai bg.png'          },
        { id: 'torq',       name: 'Torq',       sector: 'Cybersecurity',     category: 'cybersecurity', description: 'The AI-Native Hyperautomation Platform for Security Teams', round: 'Led Series B', year: 2023, favicon: 'assets/Favicons/torq favicon.png',                          bg: 'assets/portfolio bgs/torq bg.png'         },
        { id: 'robco',      name: 'RobCo',      sector: 'Deep Tech',         category: 'deep-tech',     description: 'The Robot Company centered on Software and AI',             round: 'Series C',     year: 2026, favicon: 'assets/Favicons/robco favicon.png',                         bg: 'assets/portfolio bgs/robco bg.png'        },
        { id: 'commcrete',  name: 'Commcrete',  sector: 'Defense',           category: 'defense',       description: 'Connect Beyond Borders',                                   round: 'Series A',     year: 2024, favicon: 'assets/Favicons/Commcrete.png',                             bg: 'assets/portfolio bgs/Commcrete.png'       },
        // Staged — cycle in after initial rotation
        { id: 'regulus',    name: 'Regulus',    sector: 'Defense',           category: 'defense',       description: 'Next Generation Counter Unmanned Systems',                 round: 'Led Series B', year: 2025, favicon: 'assets/Favicons/regulus favicon.png',                       bg: 'assets/portfolio bgs/regulus bg.png'      },
        { id: 'goodship',   name: 'GoodShip',   sector: 'Vertical AI',       category: 'vertical-ai',   description: 'AI Freight Orchestration & Procurement',                   round: 'Led Series B', year: 2025, favicon: 'assets/Favicons/Goodship favicon.png',                      bg: 'assets/portfolio bgs/Goodship bg.png'     },
    ];

    // ── Initial slot → company mapping (clockwise) ─
    const initialSlotIds = [
        'vast',       // 0 — entry
        'exodigo',    // 1
        'coralogix',  // 2
        'silverfort', // 3
        'aai',        // 4
        'torq',       // 5
        'robco',      // 6
        'commcrete',  // 7 — exit
    ];

    // Staged companies join the back of the queue
    const stagedIds = PORTFOLIO_V3
        .map(function (c) { return c.id; })
        .filter(function (id) { return !initialSlotIds.includes(id); });

    const allCompanyIds = initialSlotIds.concat(stagedIds);

    var slotState      = initialSlotIds.slice();
    var nextEntryIndex = SLOT_COUNT;

    // ── Helpers ────────────────────────────────────

    function getCompany(id) {
        return PORTFOLIO_V3.find(function (c) { return c.id === id; });
    }

    function getSlotEl(i) {
        return document.querySelector('[data-slot="' + i + '"]');
    }

    function applyCompanyToCard(cardEl, company) {
        var bg = cardEl.querySelector('.bento-card-bg');
        if (bg) bg.style.backgroundImage = "url('" + company.bg + "')";
        cardEl.setAttribute('data-category', company.category);
        var logo = cardEl.querySelector('.bento-card-logo-img');
        if (logo) { logo.src = company.favicon; logo.alt = company.name; }
        var tag = cardEl.querySelector('.bento-card-tag');
        if (tag) tag.textContent = company.sector;
        var name = cardEl.querySelector('.bento-card-name');
        if (name) name.textContent = company.name;
        var desc = cardEl.querySelector('.bento-card-desc');
        if (desc) desc.innerHTML = company.description;
        var stage = cardEl.querySelector('.bento-card-stage');
        if (stage) stage.textContent = company.round || '';
        var year = cardEl.querySelector('.bento-card-location');
        if (year) year.textContent = company.year || '';
    }

    // ── Core rotation tick ─────────────────────────

    function rotateTick() {
        // Find next company not already on screen
        var enteringId;
        var tries = 0;
        do {
            enteringId = allCompanyIds[nextEntryIndex % allCompanyIds.length];
            nextEntryIndex++;
            tries++;
        } while (slotState.includes(enteringId) && tries < allCompanyIds.length);

        // Shift everyone one slot clockwise; new company enters slot 0
        var oldState = slotState.slice();
        var newState = [enteringId];
        for (var i = 1; i < SLOT_COUNT; i++) {
            newState[i] = oldState[i - 1];
        }

        // Staggered crossfade across all 8 slots
        var tl = gsap.timeline();

        for (var slotIdx = 0; slotIdx < SLOT_COUNT; slotIdx++) {
            (function (idx) {
                var cardEl = getSlotEl(idx);
                if (!cardEl) return;
                var newCompany = getCompany(newState[idx]);
                if (!newCompany) return;
                if (newState[idx] === oldState[idx]) return;

                var content = cardEl.querySelector('.bento-card-content');
                var bgEl    = cardEl.querySelector('.bento-card-bg');
                var delay   = idx * STAGGER_DELAY;
                var half    = FADE_DURATION * 0.5;

                tl.to([content, bgEl], { opacity: 0, duration: half, ease: 'power2.in'  }, delay);
                tl.call(function () { applyCompanyToCard(cardEl, newCompany); }, null, delay + half);
                tl.to([content, bgEl], { opacity: 1, duration: half, ease: 'power2.out' }, delay + half);
            })(slotIdx);
        }

        slotState = newState;
    }

    // ── Pause controls ─────────────────────────────

    var isPaused = false;

    function setupHoverPause() {
        var grid = document.querySelector('.bento-grid-v3');
        if (grid) {
            grid.addEventListener('mouseenter', function () { isPaused = true;  });
            grid.addEventListener('mouseleave', function () { isPaused = false; });
        }
    }

    document.addEventListener('visibilitychange', function () {
        isPaused = document.hidden;
    });

    // ── Preload images ─────────────────────────────

    function preloadImages() {
        PORTFOLIO_V3.forEach(function (c) {
            new Image().src = c.bg;
            new Image().src = c.favicon;
        });
    }

    // ── Init ───────────────────────────────────────

    function init() {
        preloadImages();
        setupHoverPause();
        setTimeout(function () {
            setInterval(function () {
                if (!isPaused) rotateTick();
            }, ROTATION_INTERVAL);
        }, INITIAL_DELAY);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
