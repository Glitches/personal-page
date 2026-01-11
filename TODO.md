# TODO List - Personal Blog Improvements

## High Priority

- [x] **RSS Feed** - Generate feed.xml with post metadata (essential for personal blogs)
- [x] **SEO Meta Tags** - Add meta description, Open Graph tags, canonical URLs, proper title tags
- [x] **Post Excerpts on Index** - Show first paragraph or excerpt from frontmatter for better previews
- [x] **Proper Date Parsing & Sorting** - Parse dates from frontmatter/filename, sort by actual date, support ISO dates
- [x] **Home Link on Post Pages** - Add site title/logo linking to index for better navigation

## Medium Priority

- [ ] **Sitemap.xml** - Auto-generate sitemap with all posts for SEO
- [ ] **Reading Time Estimate** - Calculate from word count and display on post pages
- [ ] **Post Drafts Support** - Skip posts with `draft: true` in frontmatter
- [ ] **Better Error Handling** - Handle missing files, malformed frontmatter, graceful failures
- [x] **404 Page** - Custom 404.html for missing pages

## Nice to Have

- [ ] **Tags/Categories** - Optional tags in frontmatter, tag pages or filter on index
- [ ] **Archive Page** - Chronological list of all posts
- [ ] **Dark Mode Toggle** - CSS-only implementation
- [ ] **Better Code Block Styling** - Improve contrast and spacing, optional CSS-only syntax highlighting hints
- [ ] **Author/Bio Section** - Optional author info in templates

---

## Notes

- Items are organized by priority
- Check off items as they are completed
- Feel free to add new items or adjust priorities as needed

## User Data Required

### Placeholder Data That Needs Real Content

1. **Author Bio & Avatar**:
   - Update `SITE_AUTHOR_BIO` environment variable or edit `build.js` with your actual bio
   - Add your avatar image and set `SITE_AUTHOR_AVATAR` environment variable (e.g., `avatar.jpg`)
   - If no avatar is provided, a placeholder with initial letter is shown
   - Location: `build.js` - `SITE_CONFIG.authorBio` and `SITE_CONFIG.authorAvatar`

2. **Site Configuration**:
   - Update `SITE_TITLE` - Your blog title
   - Update `SITE_URL` - Your actual domain URL
   - Update `SITE_DESCRIPTION` - Your blog description
   - Update `SITE_AUTHOR` - Your name
   - Location: `build.js` or set via environment variables

3. **Logo/Image** (Optional):
   - If you want to add a logo image to the home link:
     1. Add your logo image to a `static/` or `assets/` folder
     2. Update `build.js` to copy images to `dist/`
     3. Update `templates/post.html` to include an `<img>` tag in the home link
     4. Update CSS to style the logo appropriately
