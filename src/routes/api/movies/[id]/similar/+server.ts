// src/routes/api/movies/[id]/similar/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { getSimilarMovies } from '$lib/api/API'; // Ensure correct path
import type { Movie } from '$lib/types/types';

export const GET: RequestHandler = async ({ params, fetch }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: 'Movie ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const similarMovies: Movie[] = await getSimilarMovies(fetch, parseInt(id, 10));
        return new Response(JSON.stringify({ similarMovies }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching similar movies:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch similar movies.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
