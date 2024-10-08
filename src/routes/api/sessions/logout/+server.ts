import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	if (!cookies.get('access-token')) {
		return json({ error: 'Usuário não autenticado' }, { status: 401 });
	}

	cookies.delete('access-token', {
		path: '/',
		httpOnly: true,
		secure: false,
		maxAge: 60 * 60 * 24
	});

	locals.userId = null;

	return json({ success: true });
};
