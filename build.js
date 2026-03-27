#!/usr/bin/env node
/* ============================================
   GREENFIELD BLOG BUILD SCRIPT
   Reads Markdown posts from content/blog/,
   generates HTML pages into knowledge/.
   ============================================ */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// ── SEO ───────────────────────────────────────
var SITE_URL = 'https://greenfield-growth.com';
var OG_IMAGE_DEFAULT = SITE_URL + '/assets/images/greenfield-partners.jpg';

// ── Paths ─────────────────────────────────────
const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const TEAM_DIR = path.join(ROOT, 'content', 'team');
const AUTHORS_FILE = path.join(ROOT, 'content', 'authors.json');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const OUTPUT_DIR = path.join(ROOT, 'knowledge');

// ── Authors lookup ────────────────────────────
var AUTHORS = {};
if (fs.existsSync(AUTHORS_FILE)) {
    AUTHORS = JSON.parse(fs.readFileSync(AUTHORS_FILE, 'utf-8'));
}

// ── Category display labels & CSS classes ─────
var CATEGORY_LABELS = {
    'Insights':       'Insights',
    'Portfolio':      'Why We Invested',
    'Growth Stories': 'Growth Stories',
    'Market':         'Market Report'
};

var CATEGORY_CLASSES = {
    'Insights':       'kn-cat-insights',
    'Portfolio':      'kn-cat-portfolio',
    'Growth Stories': 'kn-cat-growth',
    'Market':         'kn-cat-market'
};

// ── Constants ────────────────────────────────
var MONTHS_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
var MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
var COVER_FALLBACK = 'background: linear-gradient(135deg, #011132 0%, #021b4a 100%)';

// ── Helpers ───────────────────────────────────
function jsonEscape(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readTemplate(name) {
    return fs.readFileSync(path.join(TEMPLATES_DIR, name), 'utf-8');
}

function formatDate(dateInput) {
    var d = new Date(dateInput);
    return MONTHS_FULL[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function formatDateShort(dateInput) {
    var d = new Date(dateInput);
    return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function isoDate(dateInput) {
    return new Date(dateInput).toISOString().split('T')[0];
}

function readingTime(text) {
    // Count words in raw markdown, assume 200 wpm
    var words = text.split(/\s+/).filter(Boolean).length;
    var minutes = Math.max(1, Math.round(words / 200));
    return minutes + ' min read';
}

function parseAuthors(authorString) {
    // Split comma-separated author string, trim, look up each
    return authorString.split(',').map(function (name) {
        name = name.trim();
        var info = AUTHORS[name] || { role: '', photo: null };
        return {
            name: name,
            role: info.role || '',
            photo: info.photo || ''
        };
    });
}

function buildAuthorHTML(authors) {
    if (authors.length === 0) return '';

    var cards = authors.map(function (a) {
        var photoHTML = a.photo
            ? '<img class="kn-author-photo" src="' + a.photo + '" alt="' + a.name + '" loading="lazy">'
            : '<div class="kn-author-photo kn-author-photo--placeholder"></div>';

        var roleHTML = a.role
            ? '<span class="kn-author-role">' + a.role + '</span>'
            : '';

        return '' +
            '<div class="kn-author-card">' +
                photoHTML +
                '<div class="kn-author-info">' +
                    '<span class="kn-author-name">' + a.name + '</span>' +
                    roleHTML +
                '</div>' +
            '</div>';
    }).join('\n                        ');

    return '<div class="kn-authors">' + cards + '</div>';
}

function coverStyle(imageUrl) {
    return imageUrl
        ? 'background-image: url(\'' + imageUrl + '\')'
        : COVER_FALLBACK;
}

function categoryLabel(category) {
    return CATEGORY_LABELS[category] || category;
}

function categoryClass(category) {
    return CATEGORY_CLASSES[category] || 'kn-cat-insights';
}

// ── Configure marked ──────────────────────────
marked.setOptions({
    breaks: false,
    gfm: true
});

// ── Read all posts ────────────────────────────
function getPosts() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.log('No content/blog/ directory found. Skipping build.');
        return [];
    }

    var files = fs.readdirSync(CONTENT_DIR).filter(function (f) {
        return f.endsWith('.md');
    });

    var posts = files.map(function (file) {
        var raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
        var parsed = matter(raw);
        var data = parsed.data;
        var body = marked.parse(parsed.content);

        var authorStr = data.author || 'Greenfield Partners';
        var authors = parseAuthors(authorStr);

        var postDate = data.date || new Date();
        var modifiedDate = data.modified || data.updated || null;

        return {
            title: data.title || 'Untitled',
            slug: data.slug || file.replace('.md', ''),
            date: postDate,
            dateFull: formatDate(postDate),
            dateShort: formatDateShort(postDate),
            dateISO: isoDate(postDate),
            modifiedISO: modifiedDate ? isoDate(modifiedDate) : '',
            author: authorStr,
            authors: authors,
            cover_image: data.cover_image || '',
            excerpt: data.excerpt || '',
            category: data.category || 'Insights',
            draft: data.draft === true,
            body: body,
            rawContent: parsed.content,
            file: file
        };
    });

    // Filter out drafts in production, keep in dev
    var isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
        posts = posts.filter(function (p) { return !p.draft; });
    }

    // Sort by date, newest first
    posts.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    return posts;
}

// ── Shared card HTML builder ─────────────────
function buildCardHTML(post, opts) {
    var href = (opts.hrefPrefix || '') + post.slug + '/';
    var classes = 'kn-card' + (opts.extraClass ? ' ' + opts.extraClass : '');
    var dataCat = opts.dataCategory ? ' data-category="' + post.category + '"' : '';

    return '' +
        '<a href="' + href + '" class="' + classes + '"' + dataCat + '>' +
            '<div class="kn-card-cover" style="' + coverStyle(post.cover_image) + '"></div>' +
            '<div class="kn-card-body">' +
                '<span class="kn-card-category">' + categoryLabel(post.category) + '</span>' +
                '<h3 class="kn-card-title">' + post.title + '</h3>' +
                '<p class="kn-card-excerpt">' + post.excerpt + '</p>' +
                '<div class="kn-card-meta">' +
                    '<time datetime="' + post.dateISO + '">' + post.dateShort + '</time>' +
                    '<span class="kn-card-read">Read &rarr;</span>' +
                '</div>' +
            '</div>' +
        '</a>';
}

// ── Build category index for O(N) related lookups ──
function buildCategoryIndex(posts) {
    var index = {};
    posts.forEach(function (p) {
        if (!index[p.category]) index[p.category] = [];
        index[p.category].push(p);
    });
    return index;
}

// ── Build related articles section HTML ───────
function buildRelatedHTML(currentPost, categoryIndex) {
    var sameCat = categoryIndex[currentPost.category] || [];
    var related = sameCat.filter(function (p) {
        return p.slug !== currentPost.slug;
    }).slice(0, 3);

    if (related.length === 0) return '';

    var cards = related.map(function (r) {
        return buildCardHTML(r, { hrefPrefix: '../', extraClass: 'kn-related-card' });
    }).join('\n                    ');

    return '' +
        '<section class="kn-related">\n' +
        '        <div class="kn-related-inner">\n' +
        '            <div class="kn-related-header">\n' +
        '                <h2 class="kn-related-title">Related Articles</h2>\n' +
        '                <a href="../" class="kn-related-btn">\n' +
        '                    <span>All Articles</span>\n' +
        '                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n' +
        '                </a>\n' +
        '            </div>\n' +
        '            <div class="kn-related-grid">\n' +
        '                    ' + cards + '\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </section>';
}

// ── Generate individual post pages ────────────
function buildPosts(posts, categoryIndex) {
    var template = readTemplate('post.html');

    posts.forEach(function (post) {
        var postDir = path.join(OUTPUT_DIR, post.slug);
        ensureDir(postDir);

        var coverHTML = post.cover_image
            ? '<div class="kn-post-cover"><img src="' + post.cover_image + '" alt="' + post.title + '" loading="lazy"></div>'
            : '';

        // Fix author photo paths: authors.json uses absolute /assets/... paths.
        // Post pages live at knowledge/{slug}/, so convert to ../../assets/...
        // so they work on both GitHub Pages subdirectory and custom domain deployments.
        var postAuthors = post.authors.map(function (a) {
            var photo = a.photo;
            if (photo && photo.startsWith('/')) {
                photo = '../..' + photo;
            }
            return { name: a.name, role: a.role, photo: photo };
        });

        var authorsHTML = buildAuthorHTML(postAuthors);
        var readTime = readingTime(post.rawContent);
        var catLabel = categoryLabel(post.category);
        var catClass = categoryClass(post.category);
        var relatedHTML = buildRelatedHTML(post, categoryIndex);

        // SEO template variables
        var canonicalUrl = SITE_URL + '/knowledge/' + post.slug + '/';
        var ogImage = (post.cover_image && post.cover_image.indexOf('http') === 0)
            ? post.cover_image
            : OG_IMAGE_DEFAULT;

        var html = template
            .replace(/\{\{title\}\}/g, post.title)
            .replace(/\{\{date\}\}/g, post.dateFull)
            .replace(/\{\{date_iso\}\}/g, post.dateISO)
            .replace(/\{\{author\}\}/g, post.author)
            .replace(/\{\{authors_html\}\}/g, authorsHTML)
            .replace(/\{\{category\}\}/g, post.category)
            .replace(/\{\{category_label\}\}/g, catLabel)
            .replace(/\{\{category_class\}\}/g, catClass)
            .replace(/\{\{reading_time\}\}/g, readTime)
            .replace(/\{\{excerpt\}\}/g, post.excerpt)
            .replace(/\{\{cover_image\}\}/g, post.cover_image)
            .replace(/\{\{cover_style\}\}/g, coverStyle(post.cover_image))
            .replace(/\{\{cover_html\}\}/g, coverHTML)
            .replace(/\{\{body\}\}/g, post.body)
            .replace(/\{\{slug\}\}/g, post.slug)
            .replace(/\{\{related_articles\}\}/g, relatedHTML)
            .replace(/\{\{canonical_url\}\}/g, canonicalUrl)
            .replace(/\{\{og_image\}\}/g, ogImage)
            .replace(/\{\{title_json\}\}/g, jsonEscape(post.title))
            .replace(/\{\{excerpt_json\}\}/g, jsonEscape(post.excerpt))
            .replace(/\{\{author_json\}\}/g, jsonEscape(post.author))
            .replace(/\{\{modified_iso\}\}/g, post.modifiedISO)
            .replace(/\{\{modified_time_tag\}\}/g, post.modifiedISO
                ? '<meta property="article:modified_time" content="' + post.modifiedISO + '">'
                : '');

        fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf-8');
        console.log('  Built: knowledge/' + post.slug + '/index.html');
    });
}

// ── Generate listing page ─────────────────────
function buildListing(posts) {
    var template = readTemplate('listing.html');

    var cards = posts.map(function (post) {
        return buildCardHTML(post, { dataCategory: true });
    }).join('\n            ');

    var emptyState = posts.length === 0
        ? '<p class="kn-empty">Articles coming soon. Stay tuned.</p>'
        : '';

    var html = template
        .replace('{{post_cards}}', cards)
        .replace('{{empty_state}}', emptyState)
        .replace('{{post_count}}', posts.length.toString());

    ensureDir(OUTPUT_DIR);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html, 'utf-8');
    console.log('  Built: knowledge/index.html (' + posts.length + ' posts)');
}

// ── Preserve admin files ──────────────────────
function preserveAdmin() {
    var adminDir = path.join(OUTPUT_DIR, 'admin');
    // Admin files are checked into the repo at knowledge/admin/
    // so they survive the build — nothing to copy. Just verify they exist.
    if (fs.existsSync(path.join(adminDir, 'index.html'))) {
        console.log('  Admin panel: knowledge/admin/ (exists)');
    } else {
        console.log('  Admin panel: knowledge/admin/ not found (set up Decap CMS)');
    }
}

// ── Generate sitemap.xml ─────────────────────
function buildSitemap(posts) {
    var today = new Date().toISOString().split('T')[0];

    var staticPages = [
        { url: '/',                    priority: '1.0',  changefreq: 'weekly' },
        { url: '/approach.html',       priority: '0.8',  changefreq: 'monthly' },
        { url: '/portfolio.html',      priority: '0.8',  changefreq: 'monthly' },
        { url: '/team.html',           priority: '0.7',  changefreq: 'monthly' },
        { url: '/knowledge/',          priority: '0.9',  changefreq: 'weekly' },
        { url: '/privacy-policy.html', priority: '0.3',  changefreq: 'yearly' },
        { url: '/terms-of-service.html', priority: '0.3', changefreq: 'yearly' }
    ];

    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    staticPages.forEach(function (page) {
        xml += '  <url>\n';
        xml += '    <loc>' + SITE_URL + page.url + '</loc>\n';
        xml += '    <lastmod>' + today + '</lastmod>\n';
        xml += '    <changefreq>' + page.changefreq + '</changefreq>\n';
        xml += '    <priority>' + page.priority + '</priority>\n';
        xml += '  </url>\n';
    });

    // Blog posts
    posts.forEach(function (post) {
        xml += '  <url>\n';
        xml += '    <loc>' + SITE_URL + '/knowledge/' + post.slug + '/</loc>\n';
        xml += '    <lastmod>' + post.dateISO + '</lastmod>\n';
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf-8');
    console.log('  Built: sitemap.xml (' + (staticPages.length + posts.length) + ' URLs)');
}

// ── Pre-render portfolio page for SEO ────────
function buildPortfolio() {
    var portfolioFile = path.join(ROOT, 'portfolio.html');
    var dataFile = path.join(ROOT, 'portfolio-data.js');

    if (!fs.existsSync(portfolioFile) || !fs.existsSync(dataFile)) {
        console.log('  Portfolio: skipped (files not found)');
        return;
    }

    // Parse PORTFOLIO array from portfolio-data.js
    var dataSrc = fs.readFileSync(dataFile, 'utf-8');
    var fn = new Function(dataSrc.replace(/^const /, 'var ') + '\nreturn PORTFOLIO;');
    var companies = fn();

    // Sort alphabetically (matches client-side sort)
    companies.sort(function (a, b) { return a.name.localeCompare(b.name); });

    // Category labels (matches client-side mapping)
    var catLabels = {
        'ai-infra': 'AI Infrastructure',
        'aai': 'AI Infrastructure',
        'cybersecurity': 'Cybersecurity',
        'deep-tech': 'Deep Tech',
        'defense': 'Defense',
        'fintech': 'Fintech',
        'internet': 'Internet / Digital Media',
        'it-infra': 'IT Infrastructure',
        'vertical-ai': 'Vertical AI'
    };

    var arrowSVG = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // ── Build grid cards (matches buildCard() in portfolio.html) ──
    var gridHtml = companies.map(function (c) {
        var sector = catLabels[c.category] || c.sector;
        var desc = c.description.replace(/<br\s*\/?>/gi, ' ');
        var exitedBadge = c.status === 'exited'
            ? '<span class="bento-card-exited-badge">Exited</span>' : '';

        return '<div class="bento-card" data-category="' + c.category + '" data-company-id="' + c.id + '" role="button" tabindex="0">' +
            '<div class="bento-card-bg bento-card-bg-img" style="background-image: url(\'' + c.bg + '\')"></div>' +
            '<div class="bento-card-bg-overlay"></div>' +
            '<div class="bento-card-glow"></div>' +
            exitedBadge +
            '<div class="bento-card-content">' +
                '<div class="bento-card-top">' +
                    '<div class="bento-card-icon">' +
                        '<img src="' + c.favicon + '" alt="' + c.name + '" loading="lazy" class="bento-card-logo-img">' +
                    '</div>' +
                    '<span class="bento-card-tag">' + sector + '</span>' +
                '</div>' +
                '<div class="bento-card-bottom">' +
                    '<h2 class="bento-card-name">' + c.name + '</h2>' +
                    '<p class="bento-card-desc">' + desc + '</p>' +
                    '<div class="bento-card-meta">' +
                        '<span class="bento-card-stage">' + c.round + '</span>' +
                        '<span class="bento-card-divider">&middot;</span>' +
                        '<span class="bento-card-location">' + c.year + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="bento-card-hover-line"></div>' +
        '</div>';
    }).join('\n                    ');

    // ── Build list rows (matches buildRow() in portfolio.html) ──
    var listHeader = '<div class="list-header">' +
        '<span class="list-header-label">Company</span>' +
        '<span class="list-header-label">Sector</span>' +
        '<span class="list-header-label">About</span>' +
        '<span class="list-header-label">CEO</span>' +
        '<span class="list-header-label">First Partnered</span>' +
        '<span class="list-header-label">Website</span>' +
    '</div>';

    var listRows = companies.map(function (c) {
        var sector = catLabels[c.category] || c.sector;
        var desc = c.description.replace(/<br\s*\/?>/gi, ' ');
        var exitedBadge = c.status === 'exited'
            ? '<span class="list-exited-badge">Exited</span>' : '';
        var ceo = c.ceo || '';
        var partnered = c.year;
        var websiteUrl = c.website || '#';
        var logoSrc = c.logo || c.favicon;

        return '<div class="list-row" data-company-id="' + c.id + '" role="button" tabindex="0">' +
            '<div class="list-logo">' +
                '<img src="' + logoSrc + '" alt="' + c.name + '" loading="lazy" class="list-logo-img">' +
                exitedBadge +
            '</div>' +
            '<span class="list-sector">' + sector + '</span>' +
            '<span class="list-description">' + desc + '</span>' +
            '<span class="list-ceo">' + ceo + '</span>' +
            '<span class="list-partnered">' + partnered + '</span>' +
            '<a href="' + websiteUrl + '" target="_blank" rel="noopener" class="list-website">Visit ' + arrowSVG + '</a>' +
        '</div>';
    }).join('\n                    ');

    var listHtml = listHeader + '\n                    ' + listRows;

    // ── Build CollectionPage schema ──
    var schemaItems = companies.map(function (c) {
        var item = {
            '@type': 'Organization',
            'name': c.name,
            'description': (c.longDescription || c.description || '').replace(/<br\s*\/?>/gi, ' ')
        };
        if (c.website) item.url = c.website;
        return item;
    });

    var collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Portfolio | Greenfield Partners',
        'description': "Explore Greenfield Partners' portfolio of high-growth companies across AI infrastructure, cybersecurity, deep tech, and more.",
        'url': SITE_URL + '/portfolio.html',
        'mainEntity': {
            '@type': 'ItemList',
            'numberOfItems': companies.length,
            'itemListElement': companies.map(function (c, i) {
                var item = {
                    '@type': 'ListItem',
                    'position': i + 1,
                    'item': {
                        '@type': 'Organization',
                        'name': c.name,
                        'description': (c.longDescription || c.description || '').replace(/<br\s*\/?>/gi, ' ')
                    }
                };
                if (c.website) item.item.url = c.website;
                return item;
            })
        }
    };

    var schemaTag = '<script type="application/ld+json">\n    ' +
        JSON.stringify(collectionSchema, null, 4).split('\n').join('\n    ') +
        '\n    </script>';

    // ── Inject into portfolio.html ──
    var html = fs.readFileSync(portfolioFile, 'utf-8');

    // Replace grid content between markers
    html = html.replace(
        /<!-- PORTFOLIO-GRID-START -->[\s\S]*?<!-- PORTFOLIO-GRID-END -->/,
        '<!-- PORTFOLIO-GRID-START -->\n                    ' + gridHtml + '\n                    <!-- PORTFOLIO-GRID-END -->'
    );

    // Replace list content between markers
    html = html.replace(
        /<!-- PORTFOLIO-LIST-START -->[\s\S]*?<!-- PORTFOLIO-LIST-END -->/,
        '<!-- PORTFOLIO-LIST-START -->\n                    ' + listHtml + '\n                    <!-- PORTFOLIO-LIST-END -->'
    );

    // Replace schema between markers
    html = html.replace(
        /<!-- PORTFOLIO-SCHEMA-START -->[\s\S]*?<!-- PORTFOLIO-SCHEMA-END -->/,
        '<!-- PORTFOLIO-SCHEMA-START -->\n    ' + schemaTag + '\n    <!-- PORTFOLIO-SCHEMA-END -->'
    );

    fs.writeFileSync(portfolioFile, html, 'utf-8');
    console.log('  Built: portfolio.html (pre-rendered ' + companies.length + ' companies)');
}

// ── Build team page from content/team/*.md ────
function buildTeam() {
    var teamFile = path.join(ROOT, 'team.html');

    if (!fs.existsSync(TEAM_DIR) || !fs.existsSync(teamFile)) {
        console.log('  Team: skipped (content/team/ or team.html not found)');
        return;
    }

    var files = fs.readdirSync(TEAM_DIR).filter(function (f) {
        return f.endsWith('.md');
    });

    // Parse all team member markdown files
    var members = files.map(function (file) {
        var raw = fs.readFileSync(path.join(TEAM_DIR, file), 'utf-8');
        var parsed = matter(raw);
        var data = parsed.data;
        var bio = parsed.content.trim();

        return {
            name: data.name || '',
            slug: data.slug || '',
            role: data.role || '',
            team: data.team || 'investment',
            location: data.location || '',
            photo: data.photo || '',
            linkedin: data.linkedin || '',
            sort_order: data.sort_order || 99,
            portfolio_logos: data.portfolio_logos || [],
            bio: bio,
            file: file
        };
    });

    // Group by team section
    var groups = { investment: [], platform: [], advisors: [] };
    members.forEach(function (m) {
        if (groups[m.team]) {
            groups[m.team].push(m);
        }
    });

    // Sort each group by sort_order
    Object.keys(groups).forEach(function (key) {
        groups[key].sort(function (a, b) { return a.sort_order - b.sort_order; });
    });

    // ── Generate card HTML for interactive members (investment + platform) ──
    function buildInteractiveCard(m) {
        return '' +
            '                        <div class="td-card" data-member="' + m.slug + '">\n' +
            '                            <div class="td-card-photo-wrap td-card-clickable" aria-label="View ' + m.name + '\'s profile" role="button" tabindex="0">\n' +
            '                                <img src="' + m.photo + '" alt="' + m.name + '" loading="lazy" class="td-card-photo">\n' +
            '                            </div>\n' +
            '                            <div class="td-card-info">\n' +
            '                                <div class="td-card-name-row">\n' +
            '                                    <p class="td-card-name">' + m.name + '</p>\n' +
            '                                    <a href="' + m.linkedin + '" class="td-card-linkedin" aria-label="' + m.name + ' on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>\n' +
            '                                </div>\n' +
            '                                <p class="td-card-title">' + m.role + '</p>\n' +
            '                            </div>\n' +
            '                        </div>';
    }

    // ── Generate card HTML for static members (advisors) ──
    function buildStaticCard(m) {
        var linkedinHtml = m.linkedin
            ? '\n                                    <a href="' + m.linkedin + '" class="td-card-linkedin" aria-label="' + m.name + ' on LinkedIn" target="_blank" rel="noopener"><svg width="14" height="14"><use href="#icon-linkedin"/></svg></a>'
            : '';

        return '' +
            '                        <div class="td-card td-card--static">\n' +
            '                            <div class="td-card-photo-wrap">\n' +
            '                                <img src="' + m.photo + '" alt="' + m.name + '" loading="lazy" class="td-card-photo">\n' +
            '                            </div>\n' +
            '                            <div class="td-card-info">\n' +
            '                                <div class="td-card-name-row">\n' +
            '                                    <p class="td-card-name">' + m.name + '</p>' +
            linkedinHtml + '\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>';
    }

    var investmentCards = groups.investment.map(buildInteractiveCard).join('\n');
    var platformCards = groups.platform.map(buildInteractiveCard).join('\n');
    var advisorCards = groups.advisors.map(buildStaticCard).join('\n');

    // ── Generate teamData JS object (for overlay system) ──
    var interactiveMembers = groups.investment.concat(groups.platform);
    var teamDataEntries = interactiveMembers.map(function (m) {
        // Escape single quotes and newlines for JS string literals
        var jsBio = m.bio.replace(/'/g, "\\'").replace(/\n/g, '\\n');
        var entry = '            ' + m.slug + ': {\n' +
            "                name: '" + m.name.replace(/'/g, "\\'") + "',\n" +
            "                title: '" + m.role.replace(/'/g, "\\'") + "',\n" +
            "                location: '" + m.location + "',\n" +
            "                photo: '" + m.photo + "',\n" +
            "                linkedin: '" + m.linkedin + "',\n" +
            "                bio: '" + jsBio + "'";

        if (m.portfolio_logos.length > 0) {
            var logoEntries = m.portfolio_logos.map(function (logo) {
                return "                    { src: '" + logo.src + "', alt: '" + logo.alt.replace(/'/g, "\\'") + "' }";
            }).join(',\n');
            entry += ',\n                portfolioLogos: [\n' + logoEntries + '\n                ]';
        }

        entry += '\n            }';
        return entry;
    }).join(',\n');

    var teamDataJs = '        var teamData = {\n' + teamDataEntries + '\n        };';

    // ── Generate JSON-LD Person schema ──
    var allMembers = groups.investment.concat(groups.platform);
    var schemaPersons = allMembers.map(function (m) {
        var photoUrl = SITE_URL + '/' + m.photo.replace(/ /g, '%20');
        return {
            '@context': 'https://schema.org',
            '@type': 'Person',
            'name': m.name,
            'jobTitle': m.role,
            'worksFor': { '@type': 'Organization', 'name': 'Greenfield Partners' },
            'image': photoUrl,
            'sameAs': m.linkedin
        };
    });

    var schemaTag = '    <script type="application/ld+json">\n    ' +
        JSON.stringify(schemaPersons, null, 4).split('\n').join('\n    ') +
        '\n    </script>';

    // ── Auto-generate content/authors.json from team data ──
    var authorsObj = {};
    allMembers.forEach(function (m) {
        authorsObj[m.name] = {
            role: m.role,
            photo: '/' + m.photo
        };
    });
    // Add fallback entries for generic authoring
    authorsObj['Greenfield Team'] = { role: 'Greenfield Partners', photo: null };
    authorsObj['Greenfield Partners'] = { role: '', photo: null };

    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authorsObj, null, 2) + '\n', 'utf-8');
    console.log('  Updated: content/authors.json (' + allMembers.length + ' team members + 2 fallbacks)');

    // ── Inject into team.html ──
    var html = fs.readFileSync(teamFile, 'utf-8');

    // Replace investment team cards
    html = html.replace(
        /<!-- TEAM-INVESTMENT-START -->[\s\S]*?<!-- TEAM-INVESTMENT-END -->/,
        '<!-- TEAM-INVESTMENT-START -->\n' + investmentCards + '\n                    <!-- TEAM-INVESTMENT-END -->'
    );

    // Replace platform team cards
    html = html.replace(
        /<!-- TEAM-PLATFORM-START -->[\s\S]*?<!-- TEAM-PLATFORM-END -->/,
        '<!-- TEAM-PLATFORM-START -->\n' + platformCards + '\n                    <!-- TEAM-PLATFORM-END -->'
    );

    // Replace advisors cards
    html = html.replace(
        /<!-- TEAM-ADVISORS-START -->[\s\S]*?<!-- TEAM-ADVISORS-END -->/,
        '<!-- TEAM-ADVISORS-START -->\n' + advisorCards + '\n                    <!-- TEAM-ADVISORS-END -->'
    );

    // Replace teamData JS object (markers are wrapped in JS comments: // <!-- ... -->)
    html = html.replace(
        /\/\/ <!-- TEAM-DATA-JS-START -->[\s\S]*?\/\/ <!-- TEAM-DATA-JS-END -->/,
        '// <!-- TEAM-DATA-JS-START -->\n' + teamDataJs + '\n        // <!-- TEAM-DATA-JS-END -->'
    );

    // Replace JSON-LD Person schema
    html = html.replace(
        /<!-- TEAM-SCHEMA-START -->[\s\S]*?<!-- TEAM-SCHEMA-END -->/,
        '<!-- TEAM-SCHEMA-START -->\n' + schemaTag + '\n    <!-- TEAM-SCHEMA-END -->'
    );

    fs.writeFileSync(teamFile, html, 'utf-8');
    console.log('  Built: team.html (pre-rendered ' + members.length + ' team members)');
}

// ── Main ──────────────────────────────────────
function main() {
    console.log('\n🔨 Building Greenfield Knowledge blog...\n');

    var posts = getPosts();
    if (posts.length === 0 && !fs.existsSync(CONTENT_DIR)) {
        console.log('  No posts found. Creating empty listing page.\n');
    }

    var categoryIndex = buildCategoryIndex(posts);
    buildPosts(posts, categoryIndex);
    buildListing(posts);
    buildSitemap(posts);
    buildPortfolio();
    buildTeam();
    preserveAdmin();

    console.log('\n✅ Blog build complete!\n');
}

main();
