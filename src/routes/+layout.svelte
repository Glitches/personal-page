<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { browser } from '$app/environment';

	// Suppress Chrome DevTools specific errors
	if (browser && page.url.pathname.startsWith('/.well-known/')) {
		// Chrome DevTools specific files that don't need to exist
		if (page.url.pathname.includes('com.chrome.devtools')) {
			// Return empty response for these requests
			console.log('Chrome DevTools request suppressed:', page.url.pathname);
		}
	}

	let { children } = $props();
</script>

{@render children()}
<div class="flex justify-items-center justify-center">
    <footer>{(new Date()).getFullYear()} — Made with SvelteKit</footer>
</div>