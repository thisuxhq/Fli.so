export let requestIp: string;

import { type Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { createInstance } from '$lib/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = createInstance();
	const cookie = event.request.headers.get('cookie') || '';
	event.locals.pb.authStore.loadFromCookie(cookie);
	event.locals.pb.autoCancellation(false);

	try {
		if (event.locals.pb.authStore.isValid) {
			await event.locals.pb.collection('users').authRefresh();
			event.locals.user = event.locals.pb.authStore.model;
		} else {
			console.log('Auth not valid');
		}
	} catch (error) {
		console.error('Error refreshing auth:', error);
		event.locals.pb.authStore.clear();
	}

	const response = await resolve(event);
	const setCookie = event.locals.pb.authStore.exportToCookie({
		sameSite: 'strict',
		secure: !dev,
		httpOnly: true
	});
	response.headers.set('set-cookie', setCookie);

	return response;
};
