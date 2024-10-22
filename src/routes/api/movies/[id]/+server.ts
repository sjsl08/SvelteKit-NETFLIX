// src/routes/api/movies/[id]/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { getMovieById } from '$lib/api/API'; // Ensure correct path
import type { MovieDetails } from '$lib/types/types';

export const GET: RequestHandler = async ({ params, fetch }) => {
    const { id } = params;

    if (!id) {
        return new Response(JSON.stringify({ error: 'Movie ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const movieDetails: MovieDetails = await getMovieById(fetch, parseInt(id, 10));
        return new Response(JSON.stringify({ movieDetails }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching movie details:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch movie details.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
