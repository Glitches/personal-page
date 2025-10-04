import { json } from '@sveltejs/kit';

export const GET = async () => {
	// Return empty object for Chrome DevTools requests
	return json({});
};
