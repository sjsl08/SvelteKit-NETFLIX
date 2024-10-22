<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Play, Info, Volume2, VolumeOff } from "lucide-svelte";
  import {
    popularShows,

    selectedMovie,

    selectedMovieTrailer


  } from "$lib/store/GlobalState";
  import { page } from "$app/stores";
  import Player from "./Player.svelte";
  import type PlayerComponent from "./Player.svelte";
  import { openModal } from '$lib/store/GlobalState';
  import { goto } from "$app/navigation";
    import type { Movie, MovieDetails } from "../types/types";
    import { getMovieById, getMovieTrailer } from "../api/API"
    import { fetchTrailer } from "$lib/utils/helpers";

 

 
  let id: string = "";
  let movie: MovieDetails | null = null;
  let trailerUrl: string = "";

  // Reference to the Player component
  let playerRef: PlayerComponent | null = null;
  let isMutedPlayer1: boolean = true;



  let unsubscribeShows: () => void;


  onMount(() => {

      unsubscribeShows = selectedMovie.subscribe(async(data) => {
        
         movie = data
         trailerUrl= await fetchTrailer(movie.id)
      });
  



    // Cleanup subscriptions and destroy player
    return () => {
      if (unsubscribeShows) unsubscribeShows();
      
    };
  });

 


  const handleMute = () => {
    console.log("Parent: Video has been muted.");
    isMutedPlayer1 = true;
    // Additional logic if needed
  };

  const handleUnmute = () => {
    console.log("Parent: Video has been unmuted.");
    isMutedPlayer1 = false;
    // Additional logic if needed
  };
</script>

<main class="relative overflow-hidden ">
  {#if trailerUrl}
    <Player
      videoId={trailerUrl}
      bind:this={playerRef}
      on:mute={handleMute}
      on:unmute={handleUnmute}
    />
  {/if}

  {#if !trailerUrl && movie}
    <img
      src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
      alt={movie.title}
      class="h-screen w-full object-cover absolute inset-0"
    />
  {/if}

  <!-- Gradient Overlays -->
  <div class="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"></div>
  {#if !trailerUrl}
    <div class="absolute inset-0 bg-gradient-to-r from-[#141414] to-transparent"></div>
  {/if}

  <!-- Movie Details and Controls -->
  {#if movie}
    <div class="absolute top-[45%] pl-12 w-full z-10">
      <h1 class="text-4xl md:text-6xl font-bold mb-4 text-white">
        {movie.title }
      </h1>
      <p class="text-sm md:text-lg hidden  md:block mb-6 max-w-lg text-gray-300">

        {movie.overview?.substring(0,150) + "..."}
      </p>
      <div class="flex flex-wrap items-center space-x-4 space-y-2 md:space-y-0">

        <div class="flex gap-4">

          <!-- Play Button -->
          <button on:click={()=>{goto(`/watch/${movie.id}`)}} class="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition">
            <Play size={20} />
            <span class="font-semibold">Play</span>
          </button>
          
          <!-- More Info Button -->
          <button on:click={()=>{openModal(trailerUrl,movie?.id  )}} class="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">
            <Info size={20} />
            <span class="font-semibold">More Info</span>
          </button>
        </div>

        <!-- Mute/Unmute Button -->
         <div class="absolute right-0 flex items-center gap-4">

           <button
           on:click={() => {
             if (playerRef) {
               playerRef.toggleMute();
              }
            }}
          class="flex items-center gap-2 p-4 border-2 text-white rounded-full transition"
          >
          {#if isMutedPlayer1}
          <VolumeOff size={20} />
          {:else}
          <Volume2 size={20} />
          {/if}
        </button>
        
        <!-- Age Rating Badge -->
        <div class="bg-gray-600 bg-opacity-60 text-white border-l-2 px-3 py-2 ">
          <span>18+</span>
        </div>
      </div>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    font-family: 'Arial', sans-serif;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }
    p {
      font-size: 1rem;
    }
    .controls button {
      padding: 0.5rem 1rem;
    }
  }
</style>
