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
let template404 = null;
let templateTags = null;
try {
  template404 = fs.readFileSync(path.join(TEMPLATES_DIR, '404.html'), 'utf8');
} catch (error) {
  // 404 template is optional
}
try {
  templateTags = fs.readFileSync(path.join(TEMPLATES_DIR, 'tags.html'), 'utf8');
} catch (error) {
  // Tags template is optional
}

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
        let value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        
        // Handle tags (comma-separated or array-like)
        if (key.trim() === 'tags') {
          // Parse comma-separated tags or array format
          if (value.startsWith('[') && value.endsWith(']')) {
            // Array format: [tag1, tag2, tag3]
            value = value.slice(1, -1).split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
          } else {
            // Comma-separated format: tag1, tag2, tag3
            value = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
          }
        }
        
        frontmatter[key.trim()] = value;
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

// Generate HTML for tags
function generateTagsHTML(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return '';
  }
  
  const tagsList = tags.map(tag => {
    const slug = tag.toLowerCase().replace(/\s+/g, '-');
    return `<a href="tags.html#${slug}" class="tag">${escapeHtml(tag)}</a>`;
  }).join('');
  
  return `<div class="post-tags">${tagsList}</div>`;
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
      try {
        const filePath = path.join(POSTS_DIR, file);
        
        if (!fs.existsSync(filePath)) {
          console.warn(`Warning: File ${file} not found, skipping...`);
          return null;
        }
        
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
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
        return null;
      }
    })
    .filter(file => file !== null); // Remove draft posts and failed files
  
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
  try {
    if (!fs.existsSync(fileInfo.path)) {
      throw new Error(`Post file not found: ${fileInfo.path}`);
    }
    
    const content = fs.readFileSync(fileInfo.path, 'utf8');
    const { metadata, content: markdownContent } = parseFrontmatter(content);
    
    let htmlContent;
    try {
      htmlContent = marked.parse(markdownContent);
    } catch (error) {
      console.error(`Error parsing markdown for ${fileInfo.filename}:`, error.message);
      htmlContent = `<p>Error parsing markdown content.</p>`;
    }
    
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
    
    // Parse tags
    const tags = Array.isArray(metadata.tags) ? metadata.tags : 
                 (metadata.tags ? [metadata.tags] : []);
    
    const postData = {
      slug: fileInfo.slug,
      title: title,
      date: displayDate,
      dateRaw: dateString,
      parsedDate: parsedDate,
      excerpt: excerpt,
      tags: tags,
      filename: fileInfo.filename
    };
    
    const metaTags = generateMetaTags('post', postData);
    const readingTimeHtml = `<span class="reading-time">${readingTimeStr}</span>`;
    const tagsHtml = generateTagsHTML(tags);
    let postHtml = postTemplate
      .replace(/\{\{TITLE\}\}/g, escapeHtml(title))
      .replace('{{DATE}}', date)
      .replace('{{READING_TIME}}', readingTimeHtml)
      .replace('{{TAGS}}', tagsHtml)
      .replace('{{CONTENT}}', htmlContent)
      .replace('{{SITE_TITLE}}', escapeHtml(SITE_CONFIG.title));
    postHtml = postHtml.replace('{{META_TAGS}}', metaTags);
    
    const outputPath = path.join(DIST_DIR, `${fileInfo.slug}.html`);
    fs.writeFileSync(outputPath, postHtml);
    
    return postData;
  } catch (error) {
    console.error(`Error building post ${fileInfo.filename}:`, error.message);
    return null;
  }
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

// Build tags page
function buildTagsPage(posts) {
  if (!templateTags) {
    return; // Skip if template doesn't exist
  }
  
  try {
    // Collect all tags and their posts
    const tagMap = {};
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
        post.tags.forEach(tag => {
          if (!tagMap[tag]) {
            tagMap[tag] = [];
          }
          tagMap[tag].push(post);
        });
      }
    });
    
    // Sort tags alphabetically
    const sortedTags = Object.keys(tagMap).sort();
    
    if (sortedTags.length === 0) {
      // No tags, show message
      const tagsList = '<p>No tags available yet.</p>';
      let tagsHtml = templateTags
        .replace(/\{\{SITE_TITLE\}\}/g, escapeHtml(SITE_CONFIG.title))
        .replace('{{SITE_URL}}', SITE_CONFIG.url)
        .replace('{{TAGS_LIST}}', tagsList);
      fs.writeFileSync(path.join(DIST_DIR, 'tags.html'), tagsHtml);
      return;
    }
    
    // Build tags list HTML
    const tagsList = sortedTags.map(tag => {
      const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');
      const tagPosts = tagMap[tag];
      const postsList = tagPosts.map(post => {
        return `        <li><a href="${post.slug}.html">${escapeHtml(post.title)}</a> <time class="post-date">${post.date}</time></li>`;
      }).join('\n');
      
      return `      <section id="${tagSlug}" class="tag-section">
        <h2>${escapeHtml(tag)} <span class="tag-count">(${tagPosts.length})</span></h2>
        <ul class="tag-posts">
${postsList}
        </ul>
      </section>`;
    }).join('\n\n');
    
    let tagsHtml = templateTags
      .replace(/\{\{SITE_TITLE\}\}/g, escapeHtml(SITE_CONFIG.title))
      .replace('{{SITE_URL}}', SITE_CONFIG.url)
      .replace('{{TAGS_LIST}}', tagsList);
    
    fs.writeFileSync(path.join(DIST_DIR, 'tags.html'), tagsHtml);
  } catch (error) {
    console.warn('Warning: Could not generate tags page:', error.message);
  }
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

// Build 404 page
function build404Page() {
  if (!template404) {
    return; // Skip if template doesn't exist
  }
  
  try {
    let page404 = template404
      .replace(/\{\{SITE_TITLE\}\}/g, escapeHtml(SITE_CONFIG.title))
      .replace('{{SITE_URL}}', SITE_CONFIG.url);
    
    fs.writeFileSync(path.join(DIST_DIR, '404.html'), page404);
  } catch (error) {
    console.warn('Warning: Could not generate 404 page:', error.message);
  }
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
  try {
    console.log('Building blog...');
    
    // Check if templates exist
    if (!fs.existsSync(path.join(TEMPLATES_DIR, 'index.html'))) {
      throw new Error('Template index.html not found');
    }
    if (!fs.existsSync(path.join(TEMPLATES_DIR, 'post.html'))) {
      throw new Error('Template post.html not found');
    }
    
    const markdownFiles = getMarkdownFiles();
    console.log(`Found ${markdownFiles.length} markdown file(s)`);
    
    if (markdownFiles.length === 0) {
      console.warn('Warning: No markdown files found. Generating empty site...');
    }
    
    const posts = markdownFiles.map(buildPost).filter(post => post !== null);
    
    if (posts.length === 0 && markdownFiles.length > 0) {
      console.warn('Warning: No posts were successfully built.');
    }
    
    try {
      buildIndex(posts);
      buildRSSFeed(posts);
      buildSitemap(posts);
      buildTagsPage(posts);
      build404Page();
      copyAssets();
    } catch (error) {
      console.error('Error during build process:', error.message);
      throw error;
    }
    
    console.log('Build complete!');
    console.log(`Generated ${posts.length} post(s), RSS feed, and sitemap`);
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

build();
