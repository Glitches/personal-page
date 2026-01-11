const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

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

// Build a single post
function buildPost(fileInfo) {
  const content = fs.readFileSync(fileInfo.path, 'utf8');
  const { metadata, content: markdownContent } = parseFrontmatter(content);
  
  const htmlContent = marked.parse(markdownContent);
  const title = metadata.title || fileInfo.slug;
  const date = metadata.date ? `<time class="post-date">${metadata.date}</time>` : '';
  
  const postHtml = postTemplate
    .replace('{{TITLE}}', escapeHtml(title))
    .replace('{{DATE}}', date)
    .replace('{{CONTENT}}', htmlContent);
  
  const outputPath = path.join(DIST_DIR, `${fileInfo.slug}.html`);
  fs.writeFileSync(outputPath, postHtml);
  
  return {
    slug: fileInfo.slug,
    title: title,
    date: date,
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
  copyAssets();
  
  console.log('Build complete!');
}

build();
