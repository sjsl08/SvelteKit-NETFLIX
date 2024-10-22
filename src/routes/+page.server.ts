// src/routes/+page.server.ts
import {
    fetchPopularShows,
    fetchTrendingShows,
    fetchTopRatedShows,
    getTMDBConfig,
    getGenres,
    getMoviesByGenre,
    getMovieById,
    getMovieTrailer
} from '$lib/api/API';
import type { Genre, MovieWithGenere } from '$lib/types/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        // Fetch initial data concurrently
        const [configResponse, popularResponse, trendingResponse, topRatedResponse, genresResponse] = await Promise.all([
            getTMDBConfig(fetch),
            fetchPopularShows(fetch),
            fetchTrendingShows(fetch),
            fetchTopRatedShows(fetch),
            getGenres(fetch),
        ]);

        console.log('Popular Shows:', popularResponse);

        // Fetch movies by genre concurrently
        const moviesByGenres: MovieWithGenere[] = genresResponse
            ? await Promise.all(
                genresResponse.map(async (genre: Genre) => {
                    const movies = await getMoviesByGenre(fetch, genre.id.toString());
                    return { id: genre.id.toString(), name: genre.name, movies };
                })
            )
            : [];

        // Ensure there are popular shows to select from
        if (popularResponse.length === 0) {
            throw new Error('No popular shows available to select a movie from.');
        }

        // Select a random popular movie
        const randomIndex = Math.floor(Math.random() * popularResponse.length);
        const selectedPopularMovie = popularResponse[randomIndex];

        // Fetch movie details and trailer concurrently on the server side
        const [movie] = await Promise.all([
            getMovieById(fetch, selectedPopularMovie.id),
        ]);

        // Return all necessary data to the client
        return {
            config: configResponse,
            popularShows: popularResponse,
            trendingShows: trendingResponse,
            topRatedShows: topRatedResponse,
            moviesWithGenre: moviesByGenres,
            selectedMovie: movie,
        };
    } catch (error) {
        console.error('Error fetching server-side data:', error);
        return {
            config: null,
            popularShows: [],
            trendingShows: [],
            topRatedShows: [],
            moviesWithGenre: [],
            selectedMovie: null,
        };
    }
};
