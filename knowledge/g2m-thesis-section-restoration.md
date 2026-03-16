# G²M Thesis Section — Restoration Guide

**Removed from:** `approach.html`
**Date removed:** 2026-03-16
**Section ID:** `#g2m-thesis`
**Snap dot label:** "Thesis" (was data-section="4")

---

## 1. HTML to Restore in `approach.html`

Insert this section **after the "Why" section** and **before the "Mission" section** (`#g2m-mission-alt`).

When this section existed, the section order was:
- 0: Hero
- 1: Inflection
- 2: Why
- 3: Mission
- **4: Thesis** ← this one
- 5: G2M Flywheel
- 6: ORION Platform
- 7: Seven Pillars
- 8: Expert Network
- 9: Testimonials

**Note:** After removal, sections 5–9 were renumbered to 4–8 in the snap dot nav. If restoring, you must re-add the dot and renumber sections back.

```html
        <section class="snap-section snap-section--scrollable g2m-thesis" id="g2m-thesis" data-theme="dark">
            <div class="g2m-thesis-inner">

                <!-- LEFT COLUMN: Text content -->
                <div class="g2m-thesis-text">
                    <h2 class="g2m-thesis-heading snap-reveal">
                        Most Companies Don't Fail from Lack of Demand.
                        <br>They Fail from Scaling Too Fast.
                    </h2>
                    <div class="g2m-thesis-divider"></div>
                    <div class="g2m-thesis-body">
                        <p class="snap-reveal snap-reveal--delay-1">
                            Many companies attempt to scale before their GTM foundations are stable and get pulled into the
                            <span class="g2m-highlight-orange">near-term trap</span>: chasing short-term targets without
                            creating the infrastructure for sustainable growth.
                        </p>
                        <p class="snap-reveal snap-reveal--delay-2">
                            The transition from <span class="g2m-highlight-teal">product–market fit</span> to
                            <span class="g2m-highlight-teal">scalable growth</span> is where most venture-backed companies
                            stall as <span class="g2m-highlight-teal g2m-highlight-italic">they fail to industrialize GTM</span>.
                        </p>
                        <p class="snap-reveal snap-reveal--delay-3">We help companies avoid that.</p>
                    </div>
                </div>

                <!-- RIGHT COLUMN: Survival Rate Chart -->
                <div class="g2m-chart-card g2m-chart-card--glass" id="g2mChart">
                    <h3 class="g2m-chart-title">Survival Rate of VC-Backed Startups</h3>

                    <!-- Chart area — all bars + gaps positioned absolutely by JS -->
                    <div class="g2m-chart-area" id="g2mChartArea">
                        <!-- SVG ARR curve overlay (desktop only) -->
                        <svg class="g2m-arr-curve" viewBox="0 0 400 200" preserveAspectRatio="none">
                            <path d="M 60 195 C 100 190, 140 180, 170 160 C 200 140, 230 100, 280 50 C 310 20, 340 5, 370 2"
                                  fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5"
                                  stroke-dasharray="8 4" stroke-linecap="round"/>
                            <text x="372" y="14" fill="rgba(255,255,255,0.6)" font-size="11" font-weight="600" text-anchor="middle">ARR</text>
                        </svg>
                        <!-- Bars & gaps injected by JS -->
                    </div>

                    <!-- X-axis labels -->
                    <div class="g2m-chart-labels" id="g2mChartLabels"></div>

                    <!-- Legend -->
                    <div class="g2m-chart-legend">
                        <div class="g2m-legend-item">
                            <div class="g2m-legend-swatch g2m-legend-cohort"></div>
                            <span>Cohort</span>
                        </div>
                        <div class="g2m-legend-item">
                            <div class="g2m-legend-swatch g2m-legend-stalled"></div>
                            <span>Stalled</span>
                        </div>
                        <div class="g2m-legend-item g2m-legend-arr-item">
                            <div class="g2m-legend-arr-line"></div>
                            <span>ARR Growth</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
        <!-- end thesis -->
```

## 2. Snap Dot to Restore in `approach.html`

Add this button inside `<nav class="snap-dots">`, in the position that matches the section order (insert before the Flywheel dot):

```html
        <button class="snap-dot" data-section="4" aria-label="Thesis">
            <span class="snap-dot-label">Thesis</span>
        </button>
```

Then renumber all subsequent dots: Flywheel → 5, ORION → 6, 7 Pillars → 7, Experts → 8, Founders → 9.

## 3. CSS — Already Present in `g2m.css`

All CSS for this section is **still in `g2m.css`** (was NOT removed). Key class blocks:

- `.g2m-thesis` (line ~11) — section background, padding
- `.g2m-thesis-inner` — grid layout, 2-column
- `.g2m-thesis-text`, `.g2m-thesis-heading`, `.g2m-thesis-divider`, `.g2m-thesis-body` — left column text
- `.g2m-highlight-orange`, `.g2m-highlight-teal`, `.g2m-highlight-italic` — inline highlights
- `.g2m-chart-card`, `.g2m-chart-card--glass` — chart container
- `.g2m-chart-area`, `.g2m-arr-curve` — chart render area
- `.g2m-bar`, `.g2m-bar-label`, `.g2m-bar-label-above` — bar elements
- `.g2m-gap-zone`, `.g2m-gap-line`, `.g2m-gap-stem`, `.g2m-gap-pill` — fail-rate indicators
- `.g2m-tooltip`, `.g2m-tooltip-bar`, `.g2m-tooltip-gap` — hover tooltips
- `.g2m-chart-labels`, `.g2m-chart-label`, `.g2m-chart-label-stage`, `.g2m-chart-label-arr` — x-axis
- `.g2m-chart-legend`, `.g2m-legend-*` — legend items
- Responsive overrides at `@media (max-width: 1024px)` and `@media (max-width: 768px)`

## 4. JavaScript — Already Present in `approach-scroll.js`

All JS is **still in `approach-scroll.js`** (was NOT removed). Key blocks:

- **Chart data** (line ~355): `STAGE_DATA` array with survival/fail rates
- **Chart render** (line ~367): `buildChartIn()` — dynamically creates bars, gaps, tooltips, labels
- **Resize handler** (line ~558–567): Rebuilds chart on window resize
- **Touch dismiss** (line ~547–556): Dismisses tooltips on outside tap
- **GSAP animations** (line ~604–678): ScrollTrigger-based entrance for chart card, bars, labels, ARR curve, gap zones, and thesis divider

Both the CSS and JS are harmless when the HTML section doesn't exist — they target elements by class/ID and gracefully no-op when those elements are absent.

## 5. Quick Restore Checklist

1. ☐ Insert HTML section before `#g2m-mission-alt` in `approach.html`
2. ☐ Add "Thesis" snap dot button and renumber subsequent dots (5→6→7→8→9)
3. ☐ CSS is already in `g2m.css` — no changes needed
4. ☐ JS is already in `approach-scroll.js` — no changes needed
5. ☐ Verify chart renders on desktop and mobile
