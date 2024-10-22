// src/lib/api/tmdb.ts

import { tmdbFetch } from './ApiWrapper';
import type { Genre, Movie, MovieDetails, TMDBConfig, TMDBResponse, Trailer } from "$lib/types/types";
const BASE_URL = 'https://api.themoviedb.org/3';

// TMDB Configuration
export const getTMDBConfig = async (fetchFn: typeof fetch): Promise<TMDBConfig | null> => {
    return tmdbFetch<TMDBConfig>('configuration', {}, fetchFn);
};

// Helper function to handle fetch responses
async function handleFetchResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status_message || 'API request failed');
    }
    return response.json();
}

// Movies

const mapToMovie = (movie: { id: number; title: string; backdrop_path: string }): Movie => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.backdrop_path,
});

export const fetchPopularShows = async (fetchFn: typeof fetch): Promise<Movie[]> => {
    const data = await tmdbFetch<TMDBResponse<{ id: number; title: string; backdrop_path: string }>>('movie/popular', {}, fetchFn);
    return data?.results.map(mapToMovie) || [];
};

export const fetchTrendingShows = async (fetchFn: typeof fetch): Promise<Movie[]> => {
    const data = await tmdbFetch<TMDBResponse<{ id: number; title: string; backdrop_path: string }>>('trending/movie/week', {}, fetchFn);
    return data?.results.map(mapToMovie) || [];
};

export const fetchTopRatedShows = async (fetchFn: typeof fetch): Promise<Movie[]> => {
    const data = await tmdbFetch<TMDBResponse<{ id: number; title: string; backdrop_path: string }>>('movie/top_rated', {}, fetchFn);
    return data?.results.map(mapToMovie) || [];
};

export const getGenres = async (fetchFn: typeof fetch): Promise<Genre[] | null> => {
    const data = await tmdbFetch<{ genres: Genre[] }>('genre/movie/list', {}, fetchFn);
    return data?.genres || null;
};

export const getMoviesByGenre = async (fetchFn: typeof fetch, id: string): Promise<Movie[]> => {
    const data = await tmdbFetch<TMDBResponse<{ id: number; title: string; backdrop_path: string }>>('discover/movie', { with_genres: id, page: 1 }, fetchFn);
    return data?.results.map(mapToMovie) || [];
};
export async function getMovieTrailer(fetch: typeof window.fetch, movieId: number): Promise<Trailer> {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${import.meta.env.VITE_API_KEY}&language=en-US`);
    const data = await handleFetchResponse(response);
    // Assuming the first trailer is desired
    const trailer = data.results.find((video: any) => video.type === 'Trailer' && video.site === 'YouTube');
    if (!trailer) {
        throw new Error('Trailer not found');
    }
    return trailer;
}

// Get Movie by ID
export const getMovieById = async (fetchFn: typeof fetch, movieId: string | number): Promise<MovieDetails | null> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${import.meta.env.VITE_API_KEY}&language=en-US`);
    return handleFetchResponse(response);
};

// Fetch Similar Movies
export async function getSimilarMovies(fetch: typeof window.fetch, movieId: number): Promise<Movie[]> {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${import.meta.env.VITE_API_KEY}&language=en-US&page=1`);
    const data = await handleFetchResponse(response);
    return data.results;
}

// Search Movies
export const searchMovies = async (fetchFn: typeof fetch, keyword: string, page: number = 1): Promise<Movie[]> => {
    if (!keyword.trim()) {
        return [];
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    const data = await tmdbFetch<TMDBResponse<{ id: number; title: string; backdrop_path: string }>>('search/movie', { query: encodedKeyword, page }, fetchFn);

    return data?.results.map(mapToMovie) || [];
};
