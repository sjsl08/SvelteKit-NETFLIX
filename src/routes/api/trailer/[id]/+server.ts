// src/routes/api/movies/[id]/trailer/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { getMovieTrailer } from '$lib/api/API'; // Ensure correct path
import type { Trailer } from '$lib/types/types';

export const GET: RequestHandler = async ({ params, fetch }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: 'Movie ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const trailer: Trailer = await getMovieTrailer(fetch, parseInt(id, 10));
        return new Response(JSON.stringify({ trailer }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching movie trailer:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch movie trailer.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
