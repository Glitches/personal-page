<script lang="ts">
  import { error } from '@sveltejs/kit';
  import Exmarkdown from 'svelte-exmarkdown';
  import hljs from 'highlight.js';

  /** @type {import('./$types').PageLoad} */
  export async function load({ params }: { params: { slug: string } }) {
    const { slug } = params;

    try {
      // Try to find the markdown file in blog assets directory
      const modules = import.meta.glob('/src/lib/assets/blog/*.md', { query: '?raw', import: 'default' });

      if (!modules) {
        throw error(404, 'No blog posts found');
      }

      // Find the file that matches the slug
      let matchedFile = null;
      let fileName = '';

      for (const [path, module] of Object.entries(modules!)) {
        const pathParts = path.split('/');
        const fileNameWithExt = pathParts.pop();
        if (!fileNameWithExt) continue;
        const fileSlug = fileNameWithExt.replace('.md', '');

        // Direct match or case-insensitive match
        if (fileSlug === slug || fileSlug.toLowerCase() === slug.toLowerCase()) {
          matchedFile = module;
          fileName = fileNameWithExt;
          break;
        }
      }

      if (!matchedFile) {
        throw error(404, 'Post not found');
      }

      const content = await matchedFile() as string;

      // Parse frontmatter and content
      let frontmatter: Record<string, string | string[] | number | boolean> = {};
      let markdownContent = content;

      // Simple and reliable frontmatter stripping
      let frontmatterText = '';
      let hasFrontmatter = false;

      // Check if content starts with frontmatter marker
      if (content.trimStart().startsWith('---')) {
        const endMarkerIndex = content.indexOf('---', 3);
        if (endMarkerIndex !== -1) {
          frontmatterText = content.substring(3, endMarkerIndex).trim();
          markdownContent = content.substring(endMarkerIndex + 3).trim();
          hasFrontmatter = true;
          console.log('Frontmatter found and stripped');
        } else {
          console.log('Frontmatter start found but no end marker');
          markdownContent = content;
        }
      } else {
        console.log('No frontmatter found');
        markdownContent = content;
      }

      console.log('Content preview:', content.substring(0, 200));
      console.log('Markdown content preview:', markdownContent.substring(0, 100));

      if (hasFrontmatter && frontmatterText) {

        // Simple YAML-like parsing
        const lines = frontmatterText.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.includes(':')) {
            const colonIndex = trimmedLine.indexOf(':');
            const key = trimmedLine.substring(0, colonIndex).trim();
            let value = trimmedLine.substring(colonIndex + 1).trim();

            console.log('Processing line:', trimmedLine, '-> Key:', key, 'Value:', value);

            // Handle arrays (e.g., tags: ["tag1", "tag2"])
            if (value.startsWith('[') && value.endsWith(']')) {
              try {
                // Remove brackets and split by comma
                const arrayContent = value.slice(1, -1);
                const items = arrayContent.split(',').map((item: string) => {
                  const trimmed = item.trim();
                  // Remove quotes if present
                  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                    return trimmed.slice(1, -1);
                  }
                  return trimmed;
                }).filter((item: string) => item.length > 0);
                frontmatter[key] = items;
              } catch (err) {
                console.error('Error parsing array:', err);
                frontmatter[key] = value;
              }
            }
            // Handle quoted strings
            else if ((value.startsWith('"') && value.endsWith('"')) ||
                     (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
              frontmatter[key] = value;
            }
            // Handle boolean values
            else if (value === 'true') {
              frontmatter[key] = true;
            }
            else if (value === 'false') {
              frontmatter[key] = false;
            }
            // Handle numbers
            else if (!isNaN(Number(value))) {
              frontmatter[key] = Number(value);
            }
            // Handle plain strings
            else {
              frontmatter[key] = value;
            }
          }
        }
      } else {
        // If frontmatter parsing failed, try to strip it manually
        console.log('Frontmatter parsing failed, attempting manual strip');
        const frontmatterEndIndex = content.indexOf('---', content.indexOf('---') + 3);
        if (frontmatterEndIndex !== -1) {
          markdownContent = content.substring(frontmatterEndIndex + 3).trim();
          console.log('Manual strip successful, content preview:', markdownContent.substring(0, 100));
        } else {
          console.log('Manual strip also failed, using full content');
          markdownContent = content;
        }
      }

      console.log('Final frontmatter:', frontmatter);

      return {
        content: markdownContent,
        frontmatter,
        slug: fileName.replace('.md', '')
      };
    } catch (err) {
      console.error('Error loading blog post:', err);
      throw error(404, 'Post not found');
    }
  }

  export let data: { content: string; frontmatter: any; slug: string };
  const { content, frontmatter = {}, slug } = data || {};

  // Configure exmarkdown with highlight.js and line numbers
  const exmarkdownOptions = {
    highlight: (code: string, language?: string) => {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language }).value;
          // Add line numbers to the highlighted code
          const lines = highlighted.split('\n');
          const numberedLines = lines.map((line, index) =>
            `<span class="line-number">${index + 1}</span><span class="line-content">${line}</span>`
          ).join('\n');

          return `<div class="code-block-wrapper">
            <div class="code-header">
              <span class="language-label">${language}</span>
            </div>
            <pre class="code-block"><code class="hljs language-${language}">${numberedLines}</code></pre>
          </div>`;
        } catch (err) {
          console.error('Highlight error:', err);
        }
      }

      // Fallback for auto-detected languages
      try {
        const highlighted = hljs.highlightAuto(code);
        const lines = highlighted.value.split('\n');
        const numberedLines = lines.map((line, index) =>
          `<span class="line-number">${index + 1}</span><span class="line-content">${line}</span>`
        ).join('\n');

        return `<div class="code-block-wrapper">
          <div class="code-header">
            <span class="language-label">${highlighted.language || 'text'}</span>
          </div>
          <pre class="code-block"><code class="hljs language-${highlighted.language || 'text'}">${numberedLines}</code></pre>
        </div>`;
      } catch (err) {
        console.error('Highlight error:', err);
      }

      return `<div class="code-block-wrapper">
        <div class="code-header">
          <span class="language-label">text</span>
        </div>
        <pre class="code-block"><code class="hljs">${code}</code></pre>
      </div>`;
    }
  };
</script>

<svelte:head>
  <title>{frontmatter.title || 'Blog Post'} - Personal Page</title>
  <meta name="description" content={frontmatter.description || ''} />
</svelte:head>

<article class="container mx-auto px-4 py-8 max-w-4xl">
  <header class="mb-8">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
      {frontmatter.title || 'Untitled'}
    </h1>
  </header>

  <div class="prose prose-lg dark:prose-invert max-w-none
    prose-headings:text-gray-900 dark:prose-headings:text-white
    prose-p:text-gray-700 dark:prose-p:text-gray-300
    prose-a:text-blue-600 dark:prose-a:text-blue-400
    prose-strong:text-gray-900 dark:prose-strong:text-white
    prose-code:text-gray-900 dark:prose-code:text-gray-100
    prose-code:bg-gray-100 dark:prose-code:bg-gray-800
    prose-code:px-1 prose-code:py-0.5 prose-code:rounded
    prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800
    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600
    prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300">
    <Exmarkdown md={content} />
  </div>

  <footer class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
      {#if frontmatter.date}
        <time datetime={frontmatter.date}>
          Published on {new Date(frontmatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
      {/if}

      {#if frontmatter.tags && frontmatter.tags.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each frontmatter.tags as tag}
            <span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
              {tag}
            </span>
          {/each}
        </div>
      {/if}
    </div>
  </footer>
</article>

<style>
  :global(.prose) {
    color: inherit;
  }

  /* Custom code block styling */
  :global(.code-block-wrapper) {
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :global(.code-header) {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
  }

  :global(.dark .code-header) {
    background: #2d3748;
    border-bottom: 1px solid #4a5568;
    color: #a0aec0;
  }

  :global(.code-block) {
    background: #2d3748 !important;
    margin: 0 !important;
    padding: 1rem !important;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  :global(.dark .code-block) {
    background: #1a202c !important;
  }

  :global(.line-number) {
    display: inline-block;
    width: 3rem;
    text-align: right;
    color: #718096;
    margin-right: 1rem;
    user-select: none;
    opacity: 0.7;
  }

  :global(.dark .line-number) {
    color: #4a5568;
  }

  :global(.line-content) {
    display: inline-block;
    width: calc(100% - 4rem);
  }

  :global(.language-label) {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  /* Ensure proper line wrapping for line numbers */
  :global(.code-block code) {
    display: block;
    white-space: pre;
  }

  :global(.code-block .line-number) {
    display: inline-block;
    width: 3rem;
    text-align: right;
    margin-right: 1rem;
    user-select: none;
  }

  :global(.code-block .line-content) {
    display: inline-block;
    width: calc(100% - 4rem);
  }
</style>
