// src/routes/api/movies/search/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { searchMovies } from '$lib/api/API'; // We'll create this function next

export const GET: RequestHandler = async ({ url }) => {
    const keyword = url.searchParams.get('keyword');
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    // Validate inputs
    if (!keyword || !keyword.trim()) {
        return new Response(JSON.stringify({ error: 'Keyword is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const movies = await searchMovies(keyword, page);
        return new Response(JSON.stringify({ movies }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error searching movies:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to search movies.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
