# Restore G²M Experts Section on Team Page

Removed from `team.html` on 2026-03-16. This document contains everything needed to bring it back.

---

## 1. HTML — Insert into `team.html`

Paste the following **after** the Advisors `</section>` tag and **before** `</div><!-- end .td-sections -->`:

```html
<!-- G²M EXPERTS -->
<section class="td-section">
    <div class="td-section-inner">
        <div class="td-section-header">
            <span class="td-section-label">G²M Experts</span>
            <span class="td-section-line"></span>
        </div>
        <div class="td-grid td-grid--experts">
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/omri-dahan.jpg" alt="Omri Dahan" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Omri Dahan</p>
                        <a href="https://www.linkedin.com/in/omridahan/" class="td-card-linkedin" aria-label="Omri Dahan on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/marqeta-logo.png" alt="Marqeta" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/dan-baruchi.png" alt="Dan Baruchi" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Dan Baruchi</p>
                        <a href="https://www.linkedin.com/in/dan-baruchi-8aba54b/" class="td-card-linkedin" aria-label="Dan Baruchi on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/outbrain-logo.png" alt="Outbrain" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/cody-guymon.png" alt="Cody Guymon" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Cody Guymon</p>
                        <a href="https://www.linkedin.com/in/codyguymon/" class="td-card-linkedin" aria-label="Cody Guymon on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/workato-logo.png" alt="Workato" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/leore-spira.jpg" alt="Leore Spira" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Leore Spira</p>
                        <a href="https://www.linkedin.com/in/leorespira/" class="td-card-linkedin" aria-label="Leore Spira on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/blinkops-logo.png" alt="Blinkops" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/hadas-mor-feldbau.jpg" alt="Hadas Mor-Feldbau" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Hadas Mor-Feldbau</p>
                        <a href="https://www.linkedin.com/in/hadasmorfeldbau/" class="td-card-linkedin" aria-label="Hadas Mor-Feldbau on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/monday-logo.png" alt="monday.com" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/shaked-mizrahi.jpg" alt="Shaked Mizrahi" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Shaked Mizrahi</p>
                        <a href="https://www.linkedin.com/in/shaked-mizrahi-68465bb5/" class="td-card-linkedin" aria-label="Shaked Mizrahi on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/monday-logo.png" alt="monday.com" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/jen-vanderwall.jpg" alt="Jen Vanderwall" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Jen Vanderwall</p>
                        <a href="https://www.linkedin.com/in/jenvanderwall/" class="td-card-linkedin" aria-label="Jen Vanderwall on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/capitolis-logo.png" alt="Capitolis" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/joseph-fuerst.png" alt="Joseph Fuerst" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Joseph Fuerst</p>
                        <a href="https://www.linkedin.com/in/josephfuerst/" class="td-card-linkedin" aria-label="Joseph Fuerst on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/sisense-logo.png" alt="Sisense" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/dave-greenberger.png" alt="Dave Greenberger" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Dave Greenberger</p>
                        <a href="https://www.linkedin.com/in/davidgreenberger/" class="td-card-linkedin" aria-label="Dave Greenberger on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/cheq-logo.png" alt="CHEQ" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/scott-harvey.jpg" alt="Scott Harvey" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Scott Harvey</p>
                        <a href="https://www.linkedin.com/in/scottharvey2/" class="td-card-linkedin" aria-label="Scott Harvey on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/stripe-logo.png" alt="Stripe" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/asaf-tsur.jpg" alt="Asaf Tsur" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Asaf Tsur</p>
                        <a href="https://www.linkedin.com/in/asaf-tsur-b5608a4/" class="td-card-linkedin" aria-label="Asaf Tsur on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/bob-logo.png" alt="Bob" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/gilad-komorov.jpg" alt="Gilad Komorov" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Gilad Komorov</p>
                        <a href="https://www.linkedin.com/in/giladkomorov/" class="td-card-linkedin" aria-label="Gilad Komorov on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/granulate-logo.png" alt="Granulate" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/kendra-krause.jpg" alt="Kendra Krause" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Kendra Krause</p>
                        <a href="https://www.linkedin.com/in/kendra-krause/" class="td-card-linkedin" aria-label="Kendra Krause on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/sophos-logo.png" alt="Sophos" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/boaz-maor.jpg" alt="Boaz Maor" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Boaz Maor</p>
                        <a href="https://www.linkedin.com/in/boaz-s-maor-84810b/" class="td-card-linkedin" aria-label="Boaz Maor on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/redirect-health-logo.png" alt="Redirect Health" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/julie-giannini.jpg" alt="Julie Giannini" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Julie Giannini</p>
                        <a href="https://www.linkedin.com/in/juliegiannini/" class="td-card-linkedin" aria-label="Julie Giannini on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/imperva-logo.png" alt="Imperva" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
            <div class="td-card td-card--static td-card--expert">
                <div class="td-card-photo-wrap">
                    <img src="assets/G2M Experts/Expert photos/shiri-levi-laor.jpg" alt="Shiri Levi-Laor" loading="lazy" class="td-card-photo">
                </div>
                <div class="td-card-info">
                    <div class="td-card-name-row">
                        <p class="td-card-name">Shiri Levi-Laor</p>
                        <a href="https://www.linkedin.com/in/shirilevi/" class="td-card-linkedin" aria-label="Shiri Levi-Laor on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>
                    </div>
                    <img src="assets/G2M Experts/Expert logos/amdocs-logo.png" alt="Amdocs" loading="lazy" class="td-card-expert-logo">
                </div>
            </div>
        </div>
    </div>
</section>
```

---

## 2. CSS — Add to `team-design-d.css`

Insert the following block **before** the `/* ---------- RESPONSIVE ---------- */` comment:

```css
/* ---------- G²M EXPERTS (5-col, smaller cards) ---------- */
.td-grid--experts {
    grid-template-columns: repeat(5, 1fr);
}

.td-card--expert .td-card-info {
    padding: 10px 12px 12px;
}

.td-card--expert .td-card-name {
    font-size: 0.8rem;
}

.td-card-expert-logo {
    display: block;
    width: 76px;
    height: 18px;
    margin-top: 7px;
    object-fit: contain;
    object-position: left center;
}
```

Then add expert-specific responsive overrides inside each existing `@media` block:

```css
/* Inside @media (max-width: 960px) */
.td-grid--experts {
    grid-template-columns: repeat(4, 1fr);
}

/* Inside @media (max-width: 768px) */
.td-grid--experts {
    grid-template-columns: repeat(3, 1fr);
}

/* Inside @media (max-width: 480px) */
.td-grid--experts {
    grid-template-columns: repeat(2, 1fr);
    max-width: none;
}
```

---

## 3. Required Assets (already in repo — do not delete)

Photos in `assets/G2M Experts/Expert photos/`:
- omri-dahan.jpg, dan-baruchi.png, cody-guymon.png, leore-spira.jpg
- hadas-mor-feldbau.jpg, shaked-mizrahi.jpg, jen-vanderwall.jpg
- joseph-fuerst.png, dave-greenberger.png, scott-harvey.jpg
- asaf-tsur.jpg, gilad-komorov.jpg, kendra-krause.jpg
- boaz-maor.jpg, julie-giannini.jpg, shiri-levi-laor.jpg

Logos in `assets/G2M Experts/Expert logos/`:
- marqeta-logo.png, outbrain-logo.png, workato-logo.png, blinkops-logo.png
- monday-logo.png (used by Hadas + Shaked), capitolis-logo.png
- sisense-logo.png, cheq-logo.png, stripe-logo.png, bob-logo.png
- granulate-logo.png, sophos-logo.png, redirect-health-logo.png
- imperva-logo.png, amdocs-logo.png

---

## 4. Expert Reference Table

| # | Name | Photo | Logo | LinkedIn |
|---|------|-------|------|----------|
| 1 | Omri Dahan | omri-dahan.jpg | marqeta-logo.png | linkedin.com/in/omridahan/ |
| 2 | Dan Baruchi | dan-baruchi.png | outbrain-logo.png | linkedin.com/in/dan-baruchi-8aba54b/ |
| 3 | Cody Guymon | cody-guymon.png | workato-logo.png | linkedin.com/in/codyguymon/ |
| 4 | Leore Spira | leore-spira.jpg | blinkops-logo.png | linkedin.com/in/leorespira/ |
| 5 | Hadas Mor-Feldbau | hadas-mor-feldbau.jpg | monday-logo.png | linkedin.com/in/hadasmorfeldbau/ |
| 6 | Shaked Mizrahi | shaked-mizrahi.jpg | monday-logo.png | linkedin.com/in/shaked-mizrahi-68465bb5/ |
| 7 | Jen Vanderwall | jen-vanderwall.jpg | capitolis-logo.png | linkedin.com/in/jenvanderwall/ |
| 8 | Joseph Fuerst | joseph-fuerst.png | sisense-logo.png | linkedin.com/in/josephfuerst/ |
| 9 | Dave Greenberger | dave-greenberger.png | cheq-logo.png | linkedin.com/in/davidgreenberger/ |
| 10 | Scott Harvey | scott-harvey.jpg | stripe-logo.png | linkedin.com/in/scottharvey2/ |
| 11 | Asaf Tsur | asaf-tsur.jpg | bob-logo.png | linkedin.com/in/asaf-tsur-b5608a4/ |
| 12 | Gilad Komorov | gilad-komorov.jpg | granulate-logo.png | linkedin.com/in/giladkomorov/ |
| 13 | Kendra Krause | kendra-krause.jpg | sophos-logo.png | linkedin.com/in/kendra-krause/ |
| 14 | Boaz Maor | boaz-maor.jpg | redirect-health-logo.png | linkedin.com/in/boaz-s-maor-84810b/ |
| 15 | Julie Giannini | julie-giannini.jpg | imperva-logo.png | linkedin.com/in/juliegiannini/ |
| 16 | Shiri Levi-Laor | shiri-levi-laor.jpg | amdocs-logo.png | linkedin.com/in/shirilevi/ |

---

## Note on Nir Goldstein

Nir Goldstein (nir-goldstein.png) was originally expert #1 but was removed before this section was taken down. His photo and the Approach page still reference him. If re-adding, his LinkedIn and logo data can be pulled from the Approach page's featured expert section.
