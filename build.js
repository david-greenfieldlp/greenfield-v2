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

        return {
            title: data.title || 'Untitled',
            slug: data.slug || file.replace('.md', ''),
            date: postDate,
            dateFull: formatDate(postDate),
            dateShort: formatDateShort(postDate),
            dateISO: isoDate(postDate),
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
            .replace(/\{\{author_json\}\}/g, jsonEscape(post.author));

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
        { url: '/companies.html',      priority: '0.8',  changefreq: 'monthly' },
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
    preserveAdmin();

    console.log('\n✅ Blog build complete!\n');
}

main();
