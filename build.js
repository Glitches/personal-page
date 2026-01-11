const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Site configuration (can be overridden via environment variables)
const SITE_CONFIG = {
  title: process.env.SITE_TITLE || 'My Personal Blog',
  url: process.env.SITE_URL || 'https://example.com',
  description: process.env.SITE_DESCRIPTION || 'A personal blog',
  author: process.env.SITE_AUTHOR || 'Author Name'
};

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Read template files
const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf8');
const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.html'), 'utf8');

// Configure marked for code blocks
marked.setOptions({
  breaks: true,
  gfm: true
});

// Extract metadata from markdown frontmatter
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    const frontmatter = {};
    match[1].split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      }
    });
    return {
      metadata: frontmatter,
      content: match[2]
    };
  }
  
  return {
    metadata: {},
    content: content
  };
}

// Get all markdown files from posts directory
function getMarkdownFiles() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      filename: file,
      slug: path.basename(file, '.md'),
      path: path.join(POSTS_DIR, file)
    }))
    .sort((a, b) => {
      // Sort by filename (assuming date prefix or alphabetical)
      return b.filename.localeCompare(a.filename);
    });
}

// Extract excerpt from markdown content (first paragraph or first 200 chars)
function extractExcerpt(fullContent, metadata, maxLength = 200) {
  // Try to get excerpt from frontmatter first
  if (metadata.excerpt) {
    return metadata.excerpt;
  }
  
  // Otherwise extract from content
  const { content } = parseFrontmatter(fullContent);
  // Remove markdown syntax and get first paragraph
  const plainText = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
    .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
    .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
    .trim();
  
  // Get first paragraph or first maxLength characters
  const firstParagraph = plainText.split('\n\n')[0] || plainText;
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  return firstParagraph.substring(0, maxLength).trim() + '...';
}

// Convert date string to RFC 822 format for RSS
function formatRSSDate(dateString) {
  if (!dateString) return new Date().toUTCString();
  
  try {
    // Try parsing various date formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If parsing fails, try common formats
      const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        return new Date(isoMatch[0]).toUTCString();
      }
      return new Date().toUTCString();
    }
    return date.toUTCString();
  } catch (e) {
    return new Date().toUTCString();
  }
}

// Build a single post
function buildPost(fileInfo) {
  const content = fs.readFileSync(fileInfo.path, 'utf8');
  const { metadata, content: markdownContent } = parseFrontmatter(content);
  
  const htmlContent = marked.parse(markdownContent);
  const title = metadata.title || fileInfo.slug;
  const date = metadata.date ? `<time class="post-date">${metadata.date}</time>` : '';
  const excerpt = extractExcerpt(content, metadata);
  
  const postHtml = postTemplate
    .replace('{{TITLE}}', escapeHtml(title))
    .replace('{{DATE}}', date)
    .replace('{{CONTENT}}', htmlContent);
  
  const outputPath = path.join(DIST_DIR, `${fileInfo.slug}.html`);
  fs.writeFileSync(outputPath, postHtml);
  
  return {
    slug: fileInfo.slug,
    title: title,
    date: metadata.date || '',
    dateRaw: metadata.date || '',
    excerpt: excerpt,
    filename: fileInfo.filename
  };
}

// Build index page
function buildIndex(posts) {
  const postsList = posts.map(post => {
    const dateStr = post.date ? `<time class="post-date">${post.date}</time>` : '';
    return `
      <article class="post-preview">
        <h2><a href="${post.slug}.html">${escapeHtml(post.title)}</a></h2>
        ${dateStr}
      </article>
    `;
  }).join('\n');
  
  const indexHtml = indexTemplate.replace('{{POSTS}}', postsList);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);
}

// Copy CSS file
function copyAssets() {
  const cssPath = path.join(__dirname, 'styles.css');
  if (fs.existsSync(cssPath)) {
    fs.copyFileSync(cssPath, path.join(DIST_DIR, 'styles.css'));
  }
}

// Build RSS feed
function buildRSSFeed(posts) {
  const rssItems = posts.map(post => {
    const postUrl = `${SITE_CONFIG.url}/${post.slug}.html`;
    const pubDate = formatRSSDate(post.dateRaw);
    const description = escapeXml(post.excerpt);
    const title = escapeXml(post.title);
    
    return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
  }).join('\n');
  
  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en</language>
    <managingEditor>${escapeXml(SITE_CONFIG.author)}</managingEditor>
    <atom:link href="${SITE_CONFIG.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), rssFeed);
}

// Escape XML special characters
function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Main build function
function build() {
  console.log('Building blog...');
  
  const markdownFiles = getMarkdownFiles();
  console.log(`Found ${markdownFiles.length} markdown file(s)`);
  
  const posts = markdownFiles.map(buildPost);
  buildIndex(posts);
  buildRSSFeed(posts);
  copyAssets();
  
  console.log('Build complete!');
  console.log(`Generated ${posts.length} post(s) and RSS feed`);
}

build();
