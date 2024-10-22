// src/lib/api/tmdbWrapper.ts

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Generic API Wrapper Function accepting a custom fetch
export async function tmdbFetch<T>(
    endpoint: string,
    params: Record<string, any> = {},
    fetchFn: typeof fetch
): Promise<T | null> {
    const url = new URL(`${BASE_URL}/${endpoint}`);

    
    
    // Append API key and additional parameters
    url.searchParams.append('api_key', API_KEY);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
    });

    try {
        const response = await fetchFn(url.toString());

        if (!response.ok) {
            console.error(`TMDB API Error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data: T = await response.json();
        return data;
    } catch (error) {
        console.error('TMDB Fetch Error:', error);
        return null;
    }
}
