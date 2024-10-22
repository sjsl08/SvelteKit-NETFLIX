// src/lib/store.ts

import type { CardState, ModalState, Movie, MovieDetails, MovieWithGenere, TMDBConfig } from "$lib/types/types";
import { writable } from "svelte/store";
// Removed direct import of getMovieById to prevent client-side usage

// Create a writable store for card view (boolean value)
export const cardView = writable(false);

// Configuration store
export const config = writable<TMDBConfig | {}>({});

// Movies
export const moviesWithGenre = writable<MovieWithGenere[]>([]);

// Create writable stores for popular, trending, and top-rated shows
export const popularShows = writable<Movie[]>([]);
export const trendingShows = writable<Movie[]>([]);
export const topRatedShows = writable<Movie[]>([]);

// Selected movie and trailer
export const selectedMovie = writable<MovieDetails | null>(null);
export const selectedMovieTrailer = writable<string | null>(null);

// Create a writable store for the card state
export const cardState = writable<CardState>({
    isHovered: false,
    item: null,
    cardId: null,
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
    content: null,
});

// Initial Modal State
const initialState: ModalState = {
    isOpen: false,
    videoId: "",
    movieId: "",
    movieData: null,
    loading: false,
    error: null,
};

// Create the modal store
export const modalStore = writable<ModalState>(initialState);

// Cache for movie data to prevent redundant API calls
const movieCache: { [key: string]: MovieDetails } = {};

// Utility Functions

/**
 * Function to open the modal and fetch movie data from server-side endpoint
 * @param videoId - ID of the video to play
 * @param movieId - ID of the movie to fetch details for
 */
export const openModal = async (videoId: string, movieId: string | number) => {
    console.log(
        "Opening modal with Video ID:",
        videoId,
        "and Movie ID:",
        movieId
    );

    const movieIdStr = movieId.toString();

    // Check if movie data is already cached
    if (movieCache[movieIdStr]) {
        modalStore.set({
            isOpen: true,
            videoId,
            movieId: movieIdStr,
            movieData: movieCache[movieIdStr],
            loading: false,
            error: null,
        });
        return;
    }

    // Update the modal state to indicate loading
    modalStore.set({
        isOpen: true,
        videoId,
        movieId: movieIdStr,
        movieData: null,
        loading: true,
        error: null,
    });

    // Update card state if necessary
    cardState.update((state) => ({
        ...state,
        isHovered: false,
        item: null,
        position: { x: -500, y: 0 },
    }));

    try {
        // Fetch the movie data from the server-side endpoint
        const response = await fetch(`/api/movies/${movieIdStr}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch movie data.');
        }

        const data = await response.json();
        const movieData: MovieDetails = data.movieDetails;

        console.log(movieData);

        if (movieData) {
            // Cache the fetched movie data
            movieCache[movieIdStr] = movieData;
        }

        // Update the modal store with fetched data
        modalStore.update((state) => ({
            ...state,
            movieData,
            loading: false,
        }));
    } catch (error: any) {
        console.error("Error fetching movie data:", error);

        // Update the modal store with error information
        modalStore.update((state) => ({
            ...state,
            loading: false,
            error: "Failed to load movie data.",
        }));
    }
};

/**
 * Function to close the modal
 */
export const closeModal = () => {
    modalStore.set(initialState); // Reset to initial state
};

export const favoriteListRefresh = writable(false);
