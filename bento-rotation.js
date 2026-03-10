/* ============================================
   BENTO GRID ROTATION
   Content-swap crossfade, 7-second cycle,
   clockwise through all portfolio companies.
   ============================================ */

(function () {
    'use strict';

    // ── Configuration ──────────────────────────────
    const ROTATION_INTERVAL = 7000;   // ms between rotations
    const FADE_DURATION     = 0.6;    // seconds per crossfade (0.3 out + 0.3 in)
    const STAGGER_DELAY     = 0.07;   // seconds between each slot's fade
    const INITIAL_DELAY     = 4000;   // ms before first rotation (let entry anims finish)

    // ── Slot order (clockwise path) ────────────────
    //  Desktop: 0 = featured (entry) → 1 → 2 → 3 → 4 → 5 → 6 (exit)
    //  Mobile:  0 → 1 → 2 → 6 (only 4 visible cards)
    const isMobile = window.innerWidth <= 768;
    const SLOT_ORDER = isMobile ? [0, 1, 2, 6] : [0, 1, 2, 3, 4, 5, 6];
    const SLOT_COUNT = SLOT_ORDER.length;

    // ── Initial slot → company mapping ─────────────
    //  Matches the HTML data-slot attributes
    const initialSlotIdsDesktop = [
        'vast',       // slot 0 — featured
        'coralogix',  // slot 1 — top-mid
        'exodigo',    // slot 2 — top-right
        'silverfort', // slot 3 — bot-right
        'aai',        // slot 4 — bot-mid-right
        'torq',       // slot 5 — bot-mid-left
        'robco',      // slot 6 — bot-left (exit)
    ];
    const initialSlotIdsMobile = [
        'vast',       // slot 0
        'coralogix',  // slot 1
        'exodigo',    // slot 2
        'robco',      // slot 6 (first card in row-four, only one visible)
    ];
    const initialSlotIds = isMobile ? initialSlotIdsMobile : initialSlotIdsDesktop;

    // ── Build full rotation queue ──────────────────
    //  Only rotate through these 9 companies on the homepage.
    const ROTATION_WHITELIST = [
        'vast', 'exodigo', 'coralogix', 'commcrete', 'regulus',
        'silverfort', 'aai', 'robco', 'torq'
    ];
    const stagedIds = ROTATION_WHITELIST
        .filter(id => !initialSlotIds.includes(id));

    // Reserve queue: companies not currently visible, FIFO order.
    // Entering companies pull from the front; exiting companies push to the back.
    // This guarantees no company appears in two slots at once.
    let reserveQueue = [...stagedIds];

    // Track current state: index = slot, value = company id
    let slotState = [...initialSlotIds];

    // ── Helpers ────────────────────────────────────

    function getCompany(id) {
        return PORTFOLIO.find(c => c.id === id);
    }

    function getSlotEl(slotIndex) {
        return document.querySelector('[data-slot="' + slotIndex + '"]');
    }

    /** Swap all visible content inside a card to match a company */
    function applyCompanyToCard(cardEl, company) {
        // Background image
        const bg = cardEl.querySelector('.bento-card-bg');
        if (bg) bg.style.backgroundImage = "url('" + company.bg + "')";

        // data-category (for AAI special hover styling, etc.)
        cardEl.setAttribute('data-category', company.category);

        // data-company-id (for click-to-navigate)
        cardEl.setAttribute('data-company-id', company.id);

        // Favicon / logo
        const logo = cardEl.querySelector('.bento-card-logo-img');
        if (logo) {
            logo.src = company.favicon;
            logo.alt = company.name;
        }

        // Sector tag
        const tag = cardEl.querySelector('.bento-card-tag');
        if (tag) tag.textContent = company.sector;

        // Name
        const name = cardEl.querySelector('.bento-card-name');
        if (name) name.textContent = company.name;

        // Description (innerHTML for <br> support)
        const desc = cardEl.querySelector('.bento-card-desc');
        if (desc) desc.innerHTML = company.description;

        // Meta: round + year
        const stage = cardEl.querySelector('.bento-card-stage');
        if (stage) stage.textContent = company.round || '';

        const year = cardEl.querySelector('.bento-card-location');
        if (year) year.textContent = company.year || '';
    }

    // ── Core rotation tick ─────────────────────────

    function rotateTick() {
        // Exiting company (last slot) goes to back of reserve
        const exitingId = slotState[SLOT_COUNT - 1];
        reserveQueue.push(exitingId);

        // Entering company pulls from front of reserve
        const enteringId = reserveQueue.shift();

        // Build new slot state: each position takes the previous position's company
        const oldState = [...slotState];
        const newState = [enteringId];
        for (let i = 1; i < SLOT_COUNT; i++) {
            newState[i] = oldState[i - 1];
        }

        // Animate crossfade, staggered clockwise
        const tl = gsap.timeline();

        SLOT_ORDER.forEach(function (slotIdx, positionIdx) {
            const cardEl = getSlotEl(slotIdx);
            if (!cardEl) return;

            const newCompany = getCompany(newState[positionIdx]);
            if (!newCompany) return;

            // Skip if content isn't changing
            if (newState[positionIdx] === oldState[positionIdx]) return;

            const content = cardEl.querySelector('.bento-card-content');
            const bgEl    = cardEl.querySelector('.bento-card-bg');
            const delay   = positionIdx * STAGGER_DELAY;
            const half    = FADE_DURATION * 0.5;

            // Phase 1: fade out
            tl.to([content, bgEl], {
                opacity: 0,
                duration: half,
                ease: 'power2.in',
            }, delay);

            // Phase 2: swap data at midpoint
            tl.call(function () {
                applyCompanyToCard(cardEl, newCompany);
            }, null, delay + half);

            // Phase 3: fade in
            tl.to([content, bgEl], {
                opacity: 1,
                duration: half,
                ease: 'power2.out',
            }, delay + half);
        });

        // Update state
        slotState = newState;
    }

    // ── Pause controls ─────────────────────────────

    let intervalId = null;
    let isPaused   = false;

    function startRotation() {
        intervalId = setInterval(function () {
            if (!isPaused) rotateTick();
        }, ROTATION_INTERVAL);
    }

    function setupHoverPause() {
        const grid = document.querySelector('.dashboard-bento-grid');
        if (!grid) return;
        grid.addEventListener('mouseenter', function () { isPaused = true; });
        grid.addEventListener('mouseleave', function () { isPaused = false; });
        // Touch support: pause while finger is on the grid
        grid.addEventListener('touchstart', function () { isPaused = true; }, { passive: true });
        grid.addEventListener('touchend', function () { isPaused = false; }, { passive: true });
    }

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', function () {
        isPaused = document.hidden;
    });

    // ── Preload images ─────────────────────────────

    function preloadImages() {
        // Only preload images for companies in the rotation (not all 23).
        // Skip initially-visible cards — the browser already loads those.
        stagedIds.forEach(function (id) {
            var company = getCompany(id);
            if (!company) return;
            var img = new Image();
            img.src = company.bg;
            var fav = new Image();
            fav.src = company.favicon;
        });
    }

    // ── Init ───────────────────────────────────────

    function init() {
        preloadImages();
        setupHoverPause();
        setTimeout(startRotation, INITIAL_DELAY);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
