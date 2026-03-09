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

// ── Helpers ───────────────────────────────────
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
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function formatDateShort(dateInput) {
    var d = new Date(dateInput);
    var months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function isoDate(dateInput) {
    return new Date(dateInput).toISOString().split('T')[0];
}

function readingTime(text) {
    // Strip HTML tags, count words, assume 200 wpm
    var words = text.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
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

        return {
            title: data.title || 'Untitled',
            slug: data.slug || file.replace('.md', ''),
            date: data.date || new Date(),
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

// ── Build related articles section HTML ───────
function buildRelatedHTML(currentPost, allPosts) {
    // Find posts with the same category, excluding the current post, max 3
    var related = allPosts.filter(function (p) {
        return p.slug !== currentPost.slug && p.category === currentPost.category;
    }).slice(0, 3);

    if (related.length === 0) return '';

    var cards = related.map(function (r) {
        var rCoverStyle = r.cover_image
            ? 'background-image: url(\'' + r.cover_image + '\')'
            : 'background: linear-gradient(135deg, #011132 0%, #021b4a 100%)';

        var rCatLabel = categoryLabel(r.category);

        return '' +
            '<a href="../' + r.slug + '/" class="kn-card kn-related-card">' +
                '<div class="kn-card-cover" style="' + rCoverStyle + '"></div>' +
                '<div class="kn-card-body">' +
                    '<span class="kn-card-category">' + rCatLabel + '</span>' +
                    '<h3 class="kn-card-title">' + r.title + '</h3>' +
                    '<p class="kn-card-excerpt">' + r.excerpt + '</p>' +
                    '<div class="kn-card-meta">' +
                        '<time datetime="' + isoDate(r.date) + '">' + formatDateShort(r.date) + '</time>' +
                        '<span class="kn-card-read">Read &rarr;</span>' +
                    '</div>' +
                '</div>' +
            '</a>';
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
function buildPosts(posts) {
    var template = readTemplate('post.html');

    posts.forEach(function (post) {
        var postDir = path.join(OUTPUT_DIR, post.slug);
        ensureDir(postDir);

        var coverHTML = post.cover_image
            ? '<div class="kn-post-cover"><img src="' + post.cover_image + '" alt="' + post.title + '" loading="lazy"></div>'
            : '';

        var coverStyle = post.cover_image
            ? 'background-image: url(\'' + post.cover_image + '\')'
            : 'background: linear-gradient(135deg, #011132 0%, #021b4a 100%)';

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
        var readTime = readingTime(post.body);
        var catLabel = categoryLabel(post.category);
        var catClass = categoryClass(post.category);
        var relatedHTML = buildRelatedHTML(post, posts);

        var html = template
            .replace(/\{\{title\}\}/g, post.title)
            .replace(/\{\{date\}\}/g, formatDate(post.date))
            .replace(/\{\{date_iso\}\}/g, isoDate(post.date))
            .replace(/\{\{author\}\}/g, post.author)
            .replace(/\{\{authors_html\}\}/g, authorsHTML)
            .replace(/\{\{category\}\}/g, post.category)
            .replace(/\{\{category_label\}\}/g, catLabel)
            .replace(/\{\{category_class\}\}/g, catClass)
            .replace(/\{\{reading_time\}\}/g, readTime)
            .replace(/\{\{excerpt\}\}/g, post.excerpt)
            .replace(/\{\{cover_image\}\}/g, post.cover_image)
            .replace(/\{\{cover_style\}\}/g, coverStyle)
            .replace(/\{\{cover_html\}\}/g, coverHTML)
            .replace(/\{\{body\}\}/g, post.body)
            .replace(/\{\{slug\}\}/g, post.slug)
            .replace(/\{\{related_articles\}\}/g, relatedHTML);

        fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf-8');
        console.log('  Built: knowledge/' + post.slug + '/index.html');
    });
}

// ── Generate listing page ─────────────────────
function buildListing(posts) {
    var template = readTemplate('listing.html');

    var cards = posts.map(function (post) {
        var coverStyle = post.cover_image
            ? 'background-image: url(\'' + post.cover_image + '\')'
            : 'background: linear-gradient(135deg, #011132 0%, #021b4a 100%)';

        return '' +
            '<a href="' + post.slug + '/" class="kn-card" data-category="' + post.category + '">' +
                '<div class="kn-card-cover" style="' + coverStyle + '"></div>' +
                '<div class="kn-card-body">' +
                    '<span class="kn-card-category">' + post.category + '</span>' +
                    '<h3 class="kn-card-title">' + post.title + '</h3>' +
                    '<p class="kn-card-excerpt">' + post.excerpt + '</p>' +
                    '<div class="kn-card-meta">' +
                        '<time datetime="' + isoDate(post.date) + '">' + formatDateShort(post.date) + '</time>' +
                        '<span class="kn-card-read">Read &rarr;</span>' +
                    '</div>' +
                '</div>' +
            '</a>';
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

// ── Main ──────────────────────────────────────
function main() {
    console.log('\n🔨 Building Greenfield Knowledge blog...\n');

    var posts = getPosts();
    if (posts.length === 0 && !fs.existsSync(CONTENT_DIR)) {
        console.log('  No posts found. Creating empty listing page.\n');
    }

    buildPosts(posts);
    buildListing(posts);
    preserveAdmin();

    console.log('\n✅ Blog build complete!\n');
}

main();
