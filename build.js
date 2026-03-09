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
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const OUTPUT_DIR = path.join(ROOT, 'knowledge');

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

        return {
            title: data.title || 'Untitled',
            slug: data.slug || file.replace('.md', ''),
            date: data.date || new Date(),
            author: data.author || 'Greenfield Partners',
            cover_image: data.cover_image || '',
            excerpt: data.excerpt || '',
            category: data.category || 'Insights',
            draft: data.draft === true,
            body: body,
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

// ── Generate individual post pages ────────────
function buildPosts(posts) {
    var template = readTemplate('post.html');

    posts.forEach(function (post) {
        var postDir = path.join(OUTPUT_DIR, post.slug);
        ensureDir(postDir);

        var coverHTML = post.cover_image
            ? '<div class="kn-post-cover"><img src="' + post.cover_image + '" alt="' + post.title + '" loading="lazy"></div>'
            : '';

        var html = template
            .replace(/\{\{title\}\}/g, post.title)
            .replace(/\{\{date\}\}/g, formatDate(post.date))
            .replace(/\{\{date_iso\}\}/g, isoDate(post.date))
            .replace(/\{\{author\}\}/g, post.author)
            .replace(/\{\{category\}\}/g, post.category)
            .replace(/\{\{excerpt\}\}/g, post.excerpt)
            .replace(/\{\{cover_image\}\}/g, post.cover_image)
            .replace(/\{\{cover_html\}\}/g, coverHTML)
            .replace(/\{\{body\}\}/g, post.body)
            .replace(/\{\{slug\}\}/g, post.slug);

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
