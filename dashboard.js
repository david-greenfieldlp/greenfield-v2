/* ============================================
   GREENFIELD PARTNERS — DASHBOARD JS
   Single-viewport dashboard: clocks, counters,
   entry animations, bento hover glow
   ============================================ */

// ==========================================
// 1. WORLD CLOCKS
// ==========================================
// Pre-build formatters and cache DOM refs (avoids creating 6 Intl objects + 18 DOM queries per second)
const clockCache = [
    { id: 'clock-ny',  tz: 'America/New_York'  },
    { id: 'clock-tlv', tz: 'Asia/Jerusalem'     },
    { id: 'clock-ldn', tz: 'Europe/London'      },
].map(({ id, tz }) => ({
    id, tz,
    partsFormatter: new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false,
    }),
    displayFormatter: new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    }),
    el: null, hourHand: null, minuteHand: null, secondHand: null, resolved: false,
}));

function updateClocks() {
    const now = new Date();

    clockCache.forEach(clock => {
        // Lazy-resolve DOM refs on first tick (elements may not exist at parse time)
        if (!clock.resolved) {
            clock.el = document.getElementById(clock.id);
            const item = document.querySelector(`[data-timezone="${clock.tz}"]`);
            const svg = item && item.querySelector('.clock-svg');
            if (svg) {
                clock.hourHand   = svg.querySelector('.clock-hand-hour');
                clock.minuteHand = svg.querySelector('.clock-hand-minute');
                clock.secondHand = svg.querySelector('.clock-hand-second');
            }
            clock.resolved = true;
        }

        const parts = clock.partsFormatter.formatToParts(now);
        const hours24 = parseInt(parts.find(p => p.type === 'hour').value);
        const minutes = parseInt(parts.find(p => p.type === 'minute').value);
        const seconds = parseInt(parts.find(p => p.type === 'second').value);

        // Digital time display
        if (clock.el) clock.el.textContent = clock.displayFormatter.format(now);

        // Analog clock hands
        const hours12 = hours24 % 12;
        const hourDeg = (hours12 * 30) + (minutes * 0.5);
        const minuteDeg = (minutes * 6) + (seconds * 0.1);
        const secondDeg = seconds * 6;

        if (clock.hourHand)   clock.hourHand.style.transform   = `rotate(${hourDeg}deg)`;
        if (clock.minuteHand) clock.minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
        if (clock.secondHand) clock.secondHand.style.transform = `rotate(${secondDeg}deg)`;
    });
}

// Update every second
setInterval(updateClocks, 1000);
updateClocks(); // initial call


// ==========================================
// 2. NAVIGATION
// ==========================================
// Hamburger toggle is handled by nav-scroll.js (shared across all pages)


// ==========================================
// 3. COUNTER ANIMATIONS
// ==========================================
function initCounters() {
    document.querySelectorAll('.hero-stat-number').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals) || 0;

        gsap.to(el, {
            innerText: target,
            duration: 2,
            delay: 0.8,
            ease: 'power2.out',
            snap: decimals === 0 ? { innerText: 1 } : {},
            onUpdate: function () {
                if (decimals > 0) {
                    el.innerText = parseFloat(el.innerText).toFixed(decimals);
                }
            }
        });
    });
}


// ==========================================
// 4. ENTRY ANIMATIONS (fade-in on load)
// ==========================================
function initEntryAnimations() {
    const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.3, // slight delay after page load
    });

    // Headline text
    tl.from('.v1-headline-text', {
        y: 30,
        opacity: 0,
        duration: 1,
    })
    // Headline button
    .from('.v1-cta-btn', {
        y: 15,
        opacity: 0,
        duration: 0.6,
    }, '-=0.5')
    // Bento cards stagger in
    .from('.dashboard-bento-grid .bento-card', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
    }, '-=0.5')
    // Clocks
    .from('.clock-item', {
        y: 15,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(1.4)',
    }, '-=0.5')
    // Stats
    .from('.v1-stat', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
    }, '-=0.4');

    // Start counters
    initCounters();
}


// ==========================================
// 5. BENTO CARD HOVER GLOW
// ==========================================
function initBentoGlow() {
    // Mousemove glow doesn't work on touch devices
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('.dashboard-bento-grid .bento-card').forEach(card => {
        const glow = card.querySelector('.bento-card-glow');
        if (!glow) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.background =
                `radial-gradient(600px circle at ${x}px ${y}px, rgba(74, 144, 217, 0.08), transparent 40%)`;
        });
    });
}


// ==========================================
// 6. MOBILE TAP-TO-REVEAL (bento cards)
// ==========================================
function initMobileTapReveal() {
    if (window.innerWidth > 768) return;

    document.querySelectorAll('.dashboard-bento-grid .bento-card').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', (card.querySelector('.bento-card-name')?.textContent || '') + ' — view company');

        function handleTap() {
            const isAlreadyTapped = card.classList.contains('mobile-tapped');

            // Second tap → navigate to portfolio page with popup
            if (isAlreadyTapped) {
                const companyId = card.getAttribute('data-company-id');
                if (companyId) window.location.href = 'companies.html?company=' + companyId;
                return;
            }

            // Close any other open card
            document.querySelectorAll('.dashboard-bento-grid .bento-card.mobile-tapped').forEach(c => {
                if (c !== card) c.classList.remove('mobile-tapped');
            });

            // First tap → reveal info
            card.classList.add('mobile-tapped');
        }

        card.addEventListener('click', handleTap);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTap();
            }
        });
    });
}


// ==========================================
// 7. DESKTOP BENTO CARD CLICK → PORTFOLIO
// ==========================================
function initBentoCardLinks() {
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('.dashboard-bento-grid .bento-card').forEach(card => {
        const companyId = card.getAttribute('data-company-id');
        if (!companyId) return;

        card.style.cursor = 'pointer';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', (card.querySelector('.bento-card-name')?.textContent || '') + ' — view company');

        function navigate(e) {
            // Don't intercept clicks on existing links
            if (e.target && e.target.closest && e.target.closest('a')) return;
            window.location.href = 'companies.html?company=' + companyId;
        }

        card.addEventListener('click', navigate);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(e);
            }
        });
    });
}


// ==========================================
// 8. VISIBILITY FAILSAFE
// ==========================================
// If GSAP animations get interrupted (e.g. rapid navigation),
// elements can be stuck at opacity:0. This forces everything
// visible after a generous timeout as a safety net.
const ANIMATED_SELECTORS = '.clock-item, .v1-stat, .v1-headline-text, .v1-cta-btn, .dashboard-bento-grid .bento-card';

function forceVisible() {
    document.querySelectorAll(ANIMATED_SELECTORS).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}


// ==========================================
// 9. INIT
// ==========================================
window.addEventListener('load', () => {
    initEntryAnimations();
    initBentoGlow();
    initMobileTapReveal();
    initBentoCardLinks();

    // Failsafe: guarantee everything is visible after 4 seconds
    // even if GSAP somehow stalls or gets killed mid-animation
    setTimeout(forceVisible, 4000);
});
