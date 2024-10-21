// src/lib/api/tmdb.ts

import type { Genre, MediaItem, Movie, MovieDetails, TMDBConfig, TMDBResponse } from "$lib/types/tmdb";

const API_KEY = '920a7b538bfb15120fe9dc6ced7735b0';  // Replace with your actual API key
const BASE_URL = 'https://api.themoviedb.org/3';

// TMDB Configuration
export async function getTMDBConfig(fetch: (url: string) => Promise<Response>): Promise<TMDBConfig | null> {
    const url = `${BASE_URL}/configuration?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching TMDB configuration: ${response.statusText}`);
        }
        const data: TMDBConfig = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getTMDBConfig:', error);
        return null;
    }
}

// Movies

export async function fetchPopularShows(fetch: (url: string) => Promise<Response>): Promise<MediaItem[]> {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching popular shows: ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((show) => ({
            id: show.id,
            title: show.title,
            image: `https://image.tmdb.org/t/p/w500${show.backdrop_path}`,
            poster_path: show.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in fetchPopularShows:', error);
        return [];
    }
}

export async function fetchTrendingShows(fetch: (url: string) => Promise<Response>): Promise<MediaItem[]> {
    const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching trending shows: ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((show) => ({
            id: show.id,
            title: show.title,
            image: `https://image.tmdb.org/t/p/w500${show.backdrop_path}`,
            poster_path: show.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in fetchTrendingShows:', error);
        return [];
    }
}

export async function fetchTopRatedShows(fetch: (url: string) => Promise<Response>): Promise<MediaItem[]> {
    const url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching top-rated shows: ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((show) => ({
            id: show.id,
            title: show.title,
            image: `https://image.tmdb.org/t/p/w500${show.backdrop_path}`,
            poster_path: show.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in fetchTopRatedShows:', error);
        return [];
    }
}

export async function getGenres(fetch: (url: string) => Promise<Response>): Promise<Genre[] | null> {
    const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching genres: ${response.statusText}`);
        }
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('Error in getGenres:', error);
        return null;
    }
}

export async function getMoviesByGenre(fetch: (url: string) => Promise<Response>, id: string): Promise<MediaItem[]> {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching movies by genre: ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
            poster_path: movie.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in getMoviesByGenre:', error);
        return [];
    }
}

export async function getMovieTrailer( movieId: number | string): Promise<{ key: string } | null> {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching trailer for movie ID ${movieId}: ${response.statusText}`);
        }
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const trailer = data.results.find((video: { site: string; type: string }) => video.site === 'YouTube' && video.type === 'Trailer');
            return trailer ? { key: trailer.key } : null;
        }
        return null;
    } catch (error) {
        console.error('Error in getMovieTrailer:', error);
        return null;
    }
}

// Get Movie by ID
export async function getMovieById(movieId: string|number): Promise<MovieDetails | null> {
    const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching movie with ID ${movieId}: ${response.statusText}`);
        }
        const data: MovieDetails = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getMovieById:', error);
        return null;
    }
}

// Similar Movies
export async function getSimilarMovies( movieId: number): Promise<MediaItem[]> {
    const url = `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&page=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching similar movies for ID ${movieId}: ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
            poster_path: movie.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in getSimilarMovies:', error);
        return [];
    }
}

// Search Movies
export async function searchMovies( keyword: string, page: number = 1): Promise<MediaItem[]> {
    if (!keyword.trim()) {
        return [];
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodedKeyword}&page=${page}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error searching movies with keyword "${keyword}": ${response.statusText}`);
        }
        const data: TMDBResponse<{ id: number; title: string; backdrop_path: string }> = await response.json();
        return data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`,
            poster_path: movie.backdrop_path,
        }));
    } catch (error) {
        console.error('Error in searchMovies:', error);
        return [];
    }
}
