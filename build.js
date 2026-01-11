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
  
  const files = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(POSTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { metadata } = parseFrontmatter(content);
      
      // Skip draft posts
      if (metadata.draft === 'true' || metadata.draft === true) {
        return null;
      }
      
      // Try to parse date from frontmatter or filename
      const parsedDate = parseDate(metadata.date, file);
      
      return {
        filename: file,
        slug: path.basename(file, '.md'),
        path: filePath,
        parsedDate: parsedDate,
        dateString: metadata.date || ''
      };
    })
    .filter(file => file !== null); // Remove draft posts
  
  // Sort by parsed date (newest first), then by filename if no date
  return files.sort((a, b) => {
    if (a.parsedDate && b.parsedDate) {
      return b.parsedDate.getTime() - a.parsedDate.getTime();
    }
    if (a.parsedDate && !b.parsedDate) return -1;
    if (!a.parsedDate && b.parsedDate) return 1;
    // Fallback to filename sorting
    return b.filename.localeCompare(a.filename);
  });
}

// Calculate reading time from markdown content (average reading speed: 200 words/min)
function calculateReadingTime(markdownContent) {
  // Remove markdown syntax to get plain text
  const plainText = markdownContent
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
    .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
    .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();
  
  // Count words (split by whitespace)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time (200 words per minute)
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  
  return {
    minutes: readingTimeMinutes,
    wordCount: wordCount
  };
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

// Parse date from string (supports ISO, common formats, or filename)
function parseDate(dateString, filename = '') {
  if (!dateString && !filename) return null;
  
  // Try to extract date from filename first (format: YYYY-MM-DD-...)
  if (!dateString && filename) {
    const filenameMatch = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (filenameMatch) {
      dateString = filenameMatch[0];
    }
  }
  
  if (!dateString) return null;
  
  try {
    // Try parsing as ISO date first (YYYY-MM-DD)
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const date = new Date(isoMatch[0]);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try parsing with Date constructor
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

// Format date for display (keeps original format if parseable, otherwise uses formatted)
function formatDisplayDate(dateString, parsedDate) {
  if (!dateString) return '';
  
  // If we have a parsed date, format it nicely
  if (parsedDate) {
    return parsedDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // Otherwise return original string
  return dateString;
}

// Convert date string to RFC 822 format for RSS
function formatRSSDate(dateString, parsedDate) {
  if (parsedDate) {
    return parsedDate.toUTCString();
  }
  
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
  
  // Use parsed date if available, otherwise use original date string
  const dateString = fileInfo.dateString || metadata.date || '';
  const parsedDate = fileInfo.parsedDate || parseDate(dateString, fileInfo.filename);
  const displayDate = formatDisplayDate(dateString, parsedDate);
  const date = displayDate ? `<time class="post-date" datetime="${parsedDate ? parsedDate.toISOString() : ''}">${displayDate}</time>` : '';
  
  const excerpt = extractExcerpt(content, metadata);
  const readingTime = calculateReadingTime(markdownContent);
  const readingTimeStr = readingTime.minutes === 1 
    ? '1 min read' 
    : `${readingTime.minutes} min read`;
  
  const postData = {
    slug: fileInfo.slug,
    title: title,
    date: displayDate,
    dateRaw: dateString,
    parsedDate: parsedDate,
    excerpt: excerpt,
    filename: fileInfo.filename
  };
  
  const metaTags = generateMetaTags('post', postData);
  const readingTimeHtml = `<span class="reading-time">${readingTimeStr}</span>`;
  let postHtml = postTemplate
    .replace(/\{\{TITLE\}\}/g, escapeHtml(title))
    .replace('{{DATE}}', date)
    .replace('{{READING_TIME}}', readingTimeHtml)
    .replace('{{CONTENT}}', htmlContent)
    .replace('{{SITE_TITLE}}', escapeHtml(SITE_CONFIG.title));
  postHtml = postHtml.replace('{{META_TAGS}}', metaTags);
  
  const outputPath = path.join(DIST_DIR, `${fileInfo.slug}.html`);
  fs.writeFileSync(outputPath, postHtml);
  
  return postData;
}

// Generate SEO meta tags
function generateMetaTags(type, data = {}) {
  const tags = [];
  
  if (type === 'index') {
    tags.push(`  <meta name="description" content="${escapeHtml(SITE_CONFIG.description)}">`);
    tags.push(`  <link rel="canonical" href="${SITE_CONFIG.url}/">`);
    
    // Open Graph tags
    tags.push(`  <meta property="og:type" content="website">`);
    tags.push(`  <meta property="og:title" content="${escapeHtml(SITE_CONFIG.title)}">`);
    tags.push(`  <meta property="og:description" content="${escapeHtml(SITE_CONFIG.description)}">`);
    tags.push(`  <meta property="og:url" content="${SITE_CONFIG.url}/">`);
    tags.push(`  <meta property="og:site_name" content="${escapeHtml(SITE_CONFIG.title)}">`);
    
    // Twitter Card tags
    tags.push(`  <meta name="twitter:card" content="summary">`);
    tags.push(`  <meta name="twitter:title" content="${escapeHtml(SITE_CONFIG.title)}">`);
    tags.push(`  <meta name="twitter:description" content="${escapeHtml(SITE_CONFIG.description)}">`);
  } else if (type === 'post') {
    const postUrl = `${SITE_CONFIG.url}/${data.slug}.html`;
    const description = data.excerpt || SITE_CONFIG.description;
    
    tags.push(`  <meta name="description" content="${escapeHtml(description)}">`);
    tags.push(`  <link rel="canonical" href="${postUrl}">`);
    
    // Open Graph tags
    tags.push(`  <meta property="og:type" content="article">`);
    tags.push(`  <meta property="og:title" content="${escapeHtml(data.title)}">`);
    tags.push(`  <meta property="og:description" content="${escapeHtml(description)}">`);
    tags.push(`  <meta property="og:url" content="${postUrl}">`);
    tags.push(`  <meta property="og:site_name" content="${escapeHtml(SITE_CONFIG.title)}">`);
    if (data.dateRaw) {
      tags.push(`  <meta property="article:published_time" content="${new Date(data.dateRaw).toISOString()}">`);
    }
    
    // Twitter Card tags
    tags.push(`  <meta name="twitter:card" content="summary">`);
    tags.push(`  <meta name="twitter:title" content="${escapeHtml(data.title)}">`);
    tags.push(`  <meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  
  return tags.join('\n');
}

// Build index page
function buildIndex(posts) {
  const postsList = posts.map(post => {
    const dateStr = post.date ? `<time class="post-date" datetime="${post.parsedDate ? post.parsedDate.toISOString() : ''}">${post.date}</time>` : '';
    const excerptStr = post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : '';
    return `
      <article class="post-preview">
        <h2><a href="${post.slug}.html">${escapeHtml(post.title)}</a></h2>
        ${dateStr}
        ${excerptStr}
      </article>
    `;
  }).join('\n');
  
  const metaTags = generateMetaTags('index');
  let indexHtml = indexTemplate.replace('{{POSTS}}', postsList);
  indexHtml = indexHtml.replace('{{META_TAGS}}', metaTags);
  indexHtml = indexHtml.replace(/\{\{TITLE\}\}/g, escapeHtml(SITE_CONFIG.title));
  
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
    const pubDate = formatRSSDate(post.dateRaw, post.parsedDate);
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

// Build sitemap.xml
function buildSitemap(posts) {
  const now = new Date().toISOString();
  
  // Homepage entry
  const homepage = `    <url>
      <loc>${SITE_CONFIG.url}/</loc>
      <lastmod>${now}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>`;
  
  // Post entries
  const postUrls = posts.map(post => {
    const postUrl = `${SITE_CONFIG.url}/${post.slug}.html`;
    const lastmod = post.parsedDate ? post.parsedDate.toISOString() : now;
    
    return `    <url>
      <loc>${postUrl}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`;
  }).join('\n');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${homepage}
${postUrls}
</urlset>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
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
  buildSitemap(posts);
  copyAssets();
  
  console.log('Build complete!');
  console.log(`Generated ${posts.length} post(s), RSS feed, and sitemap`);
}

build();
