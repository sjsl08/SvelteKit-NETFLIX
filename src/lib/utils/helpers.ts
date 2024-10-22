import { cardState, favoriteListRefresh } from "$lib/store/GlobalState";
import { get } from "svelte/store";
import fallbackImage from "../../public/images/404.jpg"
import type { Movie } from "$lib/types/types";


export const addToList = (movie: Movie) => {
  console.log("Adding movie to list:", movie);

  // Retrieve the existing list from localStorage
  let list = localStorage.getItem("list");

  // Initialize an array to hold the movies
  let movieList: Movie[] = [];

  if (list) {
    try {
      // Parse the existing list
      movieList = JSON.parse(list);

      // Optional: Check if the movie already exists in the list to prevent duplicates
      const exists = movieList.some((m) => m.id === movie.id);
      if (exists) {
        console.log("Movie already exists in the list.");
        movieList = movieList.filter((item) => {
          return item.id != movie.id;
        });
        localStorage.setItem("list", JSON.stringify(movieList));

        cardState.update((state) => ({
          ...state,
          isHovered: false,
          item: null,
          position: { x: -500, y: 0 },
        }));

        favoriteListRefresh.set(!get(favoriteListRefresh));

        return; // Exit the function if the movie is already in the list
      }
    } catch (error) {
      console.error("Error parsing the movie list from localStorage:", error);
      // If parsing fails, you might want to clear the invalid data
      localStorage.removeItem("list");
      movieList = [];
    }
  }

  // Add the new movie to the list
  movieList.push(movie);

  // Save the updated list back to localStorage
  try {
    localStorage.setItem("list", JSON.stringify(movieList));
    console.log("Movie added successfully.");
  } catch (error) {
    console.error("Error saving the movie list to localStorage:", error);
  }
};



export const convertMinutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60); // Calculate whole hours
  const mins = minutes % 60; // Calculate remaining minutes
  return hours === 0 ? `${mins}m` : `${hours}h ${mins}m`;
}



export const handleNoImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img.src !== fallbackImage) {
    img.src = fallbackImage;
  }
}

export const fetchTrailer = async (id: number | string) => {
  try {

    const response = await fetch(`/api/movies/${id}/trailer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with error:', errorData.error);
      throw new Error(errorData.error || 'Failed to fetch trailer.');
    }

    const data = await response.json();
    console.log('Server response data:', data);

    if (data.trailer && data.trailer.key) {
      return data.trailer.key;
    } else {
      console.warn('No trailer found in the response.');
    }
  } catch (err: any) {
    console.error('Failed to fetch trailer:', err);
  }


}