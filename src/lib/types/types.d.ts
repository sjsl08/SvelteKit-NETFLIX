// src/types/tmdb.d.ts

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  overview?: string;
}

interface Trailer {
  key :string
}


interface Video {
  key: string;
  type: string;
}

interface MovieWithGenere {
  movies : Movie[];
  id:string;
  name:string;
}



interface TMDBConfig {
  images: {
    base_url: string;
    secure_base_url: string;
  };
}

export interface TMDBResponse<T> {
  results: T[];
}


interface Genre {
  id: number;
  name: string;
}




export interface MovieDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: null;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number|string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: Productioncompany[];
  production_countries: Productioncountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: Spokenlanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface Spokenlanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

interface Productioncountry {
  iso_3166_1: string;
  name: string;
}

interface Productioncompany {
  id: number;
  logo_path: null | string;
  name: string;
  origin_country: string;
}

interface Genre {
  id: number;
  name: string;
}


// Interface for the card state
interface CardState {
  isHovered: boolean;
  cardId: number | string | null;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  content: { title: string; description: string; poster_path: string } | null;
  item: null | Movie;
}


// Modal State Interface
interface ModalState {
  isOpen: boolean;
  videoId: string;
  movieId: string;
  movieData: MovieDetails | null;
  loading: boolean;
  error: string | null;
}