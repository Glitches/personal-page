<script lang="ts">
  import Menu from "$lib/Menu.svelte";
  import Markdown from "svelte-exmarkdown";
  import hljs from "highlight.js";
  import "highlight.js/styles/github.css";
  import { onMount } from "svelte";

  // Import all markdown files
  const modules = import.meta.glob("../lib/assets/blog/*.md", { query: "raw" });

  /**
   * @type { {slug: string; content: string; frontmatter: Record<string, any>; date: Date;}[] }
   */
  let posts: { slug: string; content: string; frontmatter: Record<string, any>; date: Date }[] = [];

  // Load and process markdown files
  Promise.all(
    Object.entries(modules).map(async ([path, module]) => {
      const rawContent: { default: string } = (await module()) as {
        default: string;
      };

      const fileName = (path.split("/").pop() ?? "post").replace(".md", "");

      // Parse frontmatter and content
      let content = rawContent.default;
      let frontmatter: Record<string, any> = {};

      // Strip frontmatter from content and parse it
      if (content.trimStart().startsWith('---')) {
        const endMarkerIndex = content.indexOf('---', 3);
        if (endMarkerIndex !== -1) {
          const frontmatterText = content.substring(3, endMarkerIndex).trim();
          content = content.substring(endMarkerIndex + 3).trim();

          // Simple frontmatter parsing
          const lines = frontmatterText.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes(':')) {
              const colonIndex = trimmedLine.indexOf(':');
              const key = trimmedLine.substring(0, colonIndex).trim();
              let value = trimmedLine.substring(colonIndex + 1).trim();

              // Handle arrays (e.g., tags: ["tag1", "tag2"])
              if (value.startsWith('[') && value.endsWith(']')) {
                const arrayContent = value.slice(1, -1);
                const items = arrayContent.split(',').map((item: string) => {
                  const trimmed = item.trim();
                  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                    return trimmed.slice(1, -1);
                  }
                  return trimmed;
                }).filter((item: string) => item.length > 0);
                frontmatter[key] = items;
              }
              // Handle quoted strings
              else if ((value.startsWith('"') && value.endsWith('"')) ||
                       (value.startsWith("'") && value.endsWith("'"))) {
                frontmatter[key] = value.slice(1, -1);
              }
              // Handle plain strings
              else {
                frontmatter[key] = value;
              }
            }
          }
        }
      }

      return {
        slug: fileName,
        content: content,
        frontmatter: frontmatter,
        date: new Date(fileName.split("-").slice(0, 3).join("-")),
      };
    }),
  ).then((results) => {
    posts = results.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  // Apply syntax highlighting after component mounts (client-side only)
  onMount(() => {
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 100);
  });
</script>

<Menu />

<div class="flex flex-col justify-items-center justify-center gap-y-10 p-4">
  <div class="flex justify-items-center justify-center">
    <h1 class="flex-grow-0 p-4 text-3xl heading-h1">Adventures in coding land</h1>
  </div>

  <div class="max-w-3xl mx-auto w-full">
    {#if posts.length === 0}
      <p class="text-gray-600">Loading posts...</p>
    {:else}
      {#each posts as post}
        <article class="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-2 heading-h1">
            {post.slug.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/-/g, " ")}
          </h3>
          <div class="prose">
            <Markdown md={post.content}>
              {#snippet h1(props)}
                {@const { children, style, class: className, ...rest } = props}
                <h1
                  style="{style}"
                  class="{className} heading-h1"
                  {...rest}
                >
                  {@render children?.()}
                </h1>
              {/snippet}
              {#snippet h2(props)}
              {@const { children, style, class: className, ...rest } = props}
              <h2
                style="{style}"
                class="{className} heading-h2"
                {...rest}
              >
                {@render children?.()}
              </h2>
            {/snippet}

            </Markdown>
          </div>

          <footer class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <time>{post.date.toLocaleDateString()}</time>

              {#if post.frontmatter.tags && post.frontmatter.tags.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each post.frontmatter.tags as tag}
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </footer>
        </article>
      {/each}
    {/if}
  </div>
</div>

<style>
  :global(html) {
    background-color: #f3f4f6;
  }

  :global(.prose) {
    max-width: none;
  }

  :global(.prose pre) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  :global(.prose code) {
    background-color: #f8f9fa;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
  }

  :global(.prose pre code) {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }

  :global(.prose pre[class*="language-"]) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
    position: relative;
  }

  :global(.prose code[class*="language-"]) {
    background-color: rgba(27, 31, 35, 0.05);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
    color: #24292e;
  }
  
  .heading-h1 {
    margin: 0;
    padding: 0;
    border-bottom: 1px solid #999;
    font-family: 'Planet N', sans-serif;
    font-size: xx-large;
  }
  .heading-h2 {
    margin: 0;
    padding: 0;
    font-family: 'Planet N', sans-serif;
    font-size: x-large;
	}
</style>
