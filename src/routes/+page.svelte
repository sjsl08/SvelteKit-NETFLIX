<!-- src/routes/+page.svelte -->
<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import HeroSection from "$lib/components/HeroSection.svelte";
  import Carousel from "$lib/components/Carousel.svelte";
  import {
      popularShows,
      topRatedShows,
      trendingShows,
      moviesWithGenre,
      config,
      selectedMovie,
      selectedMovieTrailer
  } from "$lib/store/GlobalState";
  import type { Movie, MovieWithGenere } from "$lib/types/types";

  export let data: {
      config: any;
      popularShows: Movie[];
      trendingShows: Movie[];
      topRatedShows: Movie[];
      moviesWithGenre: MovieWithGenere[];
      selectedMovie: Movie | null;
      selectedMovieTrailer: string;
  };

  // Initialize global stores with server-side data
  $: config.set(data.config);
  $: popularShows.set(data.popularShows);
  $: trendingShows.set(data.trendingShows);
  $: topRatedShows.set(data.topRatedShows);
  $: moviesWithGenre.set(data.moviesWithGenre);
  $: selectedMovie.set(data.selectedMovie);
  $: selectedMovieTrailer.set(data.selectedMovieTrailer);

  // Local variables for rendering
  let popular: Movie[] = [];
  let trending: Movie[] = [];
  let topRated: Movie[] = [];
  let allMoviesGenre: MovieWithGenere[] = [];

  // Subscribe to stores
  $: {
      popularShows.subscribe((value) => {
          popular = value;
          console.log('Popular Shows:', popular);
      });
      trendingShows.subscribe((value) => {
          trending = value;
      });
      topRatedShows.subscribe((value) => {
          topRated = value;
      });
      moviesWithGenre.subscribe((value) => {
          allMoviesGenre = value;
          console.log('Movies by Genre:', allMoviesGenre);
      });
  }
</script>

<div class="text-white relative">
  <Header />
  <HeroSection />

  <!-- Conditionally render Carousel components when data is available -->
  {#if popular?.length > 0 && trending?.length > 0 && topRated?.length > 0}
      <div class="absolute w-full top-[35vh] md:top-[65vh] lg:top-[85vh] pl-10 flex flex-col space-y-4">
          <Carousel title="Popular Shows" items={popular} />
          <div>
              <Carousel title="Trending Shows" items={trending} />
              <Carousel title="Top-Rated Shows" items={topRated} />
              {#each allMoviesGenre as MovieList}
                  <Carousel title={MovieList.name} items={MovieList.movies} />
              {/each}
          </div>
      </div>
  {:else}
      <!-- Loading state -->
      <div class="ml-10 flex flex-col">
          <p>Loading...</p>
      </div>
  {/if}

  <!-- PopupCard positioned fixed and above all content -->
  <!-- Add your PopupCard component here if needed -->
</div>
