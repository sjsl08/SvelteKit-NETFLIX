<!-- src/lib/components/Modal.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { modalStore, closeModal } from "$lib/store/GlobalState";
  import Player from "./Player.svelte";
  import {
      Play,
      Plus,
      Check,
      ThumbsUp,
      Volume2,
      VolumeOff,
  } from "lucide-svelte";
  import { addToList, convertMinutesToTime } from "$lib/utils/helpers";
  import LikeThisCard from "./LikeThisCard.svelte";
  import { goto } from "$app/navigation";
  import type { MovieDetails, Movie } from "$lib/types/types";
  import { derived } from "svelte/store";

  // Reactive store binding
  let modalState;
  $: modalState = $modalStore;

  // Local component state
  let isOpen: boolean = false;
  let videoId = "";
  let shouldRender = false;
  let animationClass = "";
  let movieData: MovieDetails = { genres: [], spoken_languages: [] };
  let player: Player | null = null;
  let muted = false;
  let similarMovies: Movie[] = [];
  let allList: any[] = [];
  let added = false;

  // Guard to prevent multiple fetches
  let hasFetchedSimilarMovies = false;

  // Watch for changes in modalState
  $: if (modalState.isOpen) {
      if (!shouldRender) {
          shouldRender = true;
          animationClass = "bounce-up";

          // Prevent background scrolling
          if (typeof document !== "undefined") {
              document.body.style.overflow = "hidden";
          }
      }

      // Update local state based on modalStore
      isOpen = modalState.isOpen;
      videoId = modalState.videoId;
      movieData = modalState.movieData || { genres: [], spoken_languages: [] };

      // Fetch similar movies only once per modal open
      if (!hasFetchedSimilarMovies && movieData.id) {
          hasFetchedSimilarMovies = true;
          fetchSimilarMovies(movieData.id);
      }
  } else if (shouldRender) {
      // When modal closes
      animationClass = "bounce-down";

      setTimeout(() => {
          shouldRender = false;
          hasFetchedSimilarMovies = false;

          // Restore background scrolling
          if (typeof document !== "undefined") {
              document.body.style.overflow = "";
          }
      }, 300); // Duration should match bounce-down animation
  }

  // Function to fetch similar movies
  async function fetchSimilarMovies(movieId: number) {
      console.log(`Fetching similar movies for movieId: ${movieId}`);
      try {
          const response = await fetch(`/api/movies/${movieId}/similar`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              },
          });

          if (!response.ok) {
              throw new Error(`Failed to fetch similar movies: ${response.statusText}`);
          }

          const data = await response.json();
          console.log("Similar Movies Data:", data);

          similarMovies = data.similarMovies || [];
          console.log("Similar Movies:", similarMovies);

          // Fetch list from localStorage
          allList = JSON.parse(localStorage.getItem("list") || "[]");

          added = allList.some((item) => item.id === movieData.id);

          console.log("Added to list:", added);
      } catch (error) {
          console.error("Error fetching similar movies:", error);
          similarMovies = []; // Fallback to empty array
      }
  }

  // Subscribe to the modalStore
  const unsubscribe = modalStore.subscribe((state) => {
      // No direct state updates here to prevent infinite loops
      // All updates are handled reactively above
  });

  // Cleanup on component destroy
  onDestroy(() => {
      unsubscribe();
      if (typeof document !== "undefined") {
          document.body.style.overflow = "";
      }
  });

  // Function to close the modal
  const handleCloseModal = () => {
      closeModal();
  };

  // Function to toggle mute
  const toggleMuteVideo = () => {
      if (player) {
          muted = !muted;
          player.toggleMute();
      }
  };

  // Function to add movie to the list
  const handleAddToList = () => {
      console.log("Adding to list:", movieData);
      const { id, poster_path, title, backdrop_path } = movieData;

      const data = {
          id,
          poster_path: backdrop_path,
          title,
          image: `https://image.tmdb.org/t/p/w500${backdrop_path}`,
      };

      addToList(data);
      added = !added;
  };
</script>

{#if shouldRender}
  <!-- Overlay -->
  <div class="overlay" on:click={handleCloseModal}>
      <!-- Modal Content -->
      <div
          class={`modal-content w-[90%] md:w-[80%] lg:w-[50%] ${animationClass}`}
          on:click|stopPropagation
      >
          <!-- Close Button -->
          <button
              class="close-button"
              on:click={handleCloseModal}
              aria-label="Close Modal"
          >
              &times;
          </button>
          <div class="content">
              {#if videoId}
                  <div class="pointer-events-none overflow-hidden relative">
                      <div
                          class="absolute z-30 inset-0 bottom-0 bg-gradient-to-t from-[#141414] to-transparent"
                      ></div>

                      <div
                          class="absolute pointer-events-auto z-50 left-6 md:left-12 bottom-[0px] w-[90%]"
                      >
                          <p class="text-white font-bold mb-4 text-4xl">
                              {movieData.original_title}
                          </p>
                          <div class="flex justify-between w-full">
                              <div class="flex gap-4">
                                  <button
                                      on:click={() => {
                                          goto(`/watch/${movieData.id}`);
                                          handleCloseModal();
                                      }}
                                      class="flex text-2xl items-center gap-2 bg-white text-black px-12 py-2 rounded-md hover:bg-gray-200 transition"
                                  >
                                      <Play size={20} />
                                      <span class="hidden md:block font-semibold">Play</span>
                                  </button>
                                  <button
                                      on:click={handleAddToList}
                                      class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                      aria-label="Add to List"
                                  >
                                      {#if added}
                                          <Check class="text-white h-6 w-6" />
                                      {:else}
                                          <Plus class="text-white h-6 w-6" />
                                      {/if}
                                  </button>
                                  <button
                                      class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                      aria-label="Like"
                                  >
                                      <ThumbsUp class="text-white h-6 w-6" />
                                  </button>
                              </div>
                              <button
                                  on:click={toggleMuteVideo}
                                  class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                                  aria-label={muted ? "Unmute" : "Mute"}
                              >
                                  {#if !muted}
                                      <Volume2 />
                                  {:else}
                                      <VolumeOff />
                                  {/if}
                              </button>
                          </div>
                      </div>

                      <Player isMuted={muted} bind:this={player} {videoId} />
                      {#if movieData}
                          <div
                              class="absolute bottom-0 px-12 w-full z-50 pointer-events-auto"
                          ></div>
                      {/if}
                  </div>
              {/if}

              <div class="relative pt-6 px-6 md:px-12">
                  <div
                      class="absolute inset-0 h-[20px] bottom-0 bg-gradient-to-b from-[#141414] to-transparent"
                  ></div>
                  <div class="flex-col flex lg:flex-row">
                      <div class="flex items-center flex-1 gap-3">
                          <span class="text-green-400">79% Match</span>
                          <span class="border-gray-600 border-2 rounded-sm text-sm">
                              {movieData.adult ? "18+" : "13+"}
                          </span>
                          <span class="font-bold">
                              {convertMinutesToTime(movieData.runtime)}
                          </span>
                          <span class="border-gray-600 border-2 rounded-sm text-sm">
                              HD
                          </span>
                      </div>
                      <div class="flex-col flex-1">
                          <div class="flex lg:ml-40">
                              {#if movieData.genres && Array.isArray(movieData.genres)}
                                  <span class="font-semibold">Genre: &nbsp;</span>
                                  <br />
                                  {#each movieData.genres.slice(0, 3) as genre}
                                      <span class="mr-2">{genre.name}</span>
                                  {/each}
                              {/if}
                          </div>
                          <div class="flex lg:ml-40 mt-2">
                              <span class="font-semibold">Available in:</span>
                              &nbsp;
                              {#if movieData.spoken_languages && Array.isArray(movieData.spoken_languages)}
                                  {#each movieData.spoken_languages as lang}
                                      <span class="mr-2">{lang.name}</span>
                                  {/each}
                              {/if}
                          </div>
                      </div>
                  </div>

                  <div class="relative w-full lg:w-1/2 mt-2">
                      <p>{movieData.overview}</p>
                  </div>

                  <div>
                      <h1 class="text-2xl my-4 font-bold">More Like This</h1>
                      <div
                          class="flex flex-wrap sm:justify-between justify-center gap-x-4 gap-y-8"
                      >
                          {#each similarMovies.slice(0, 12) as item}
                              <LikeThisCard
                                  id={item.id}
                                  title={item.title}
                                  imageUrl={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''}
                              />
                          {/each}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
{/if}

<style>
  /* Keyframe Animations */
  @keyframes bounce-up {
      0% {
          transform: translateY(100vh);
      }
      60% {
          transform: translateY(-10%);
      }
      80% {
          transform: translateY(5%);
      }
      100% {
          transform: translateY(-5%);
      }
  }

  @keyframes bounce-down {
      0% {
          transform: translateY(0);
      }
      100% {
          transform: translateY(100vh);
      }
  }

  /* Animation Classes */
  .bounce-up {
      animation: bounce-up 0.5s ease-out forwards;
  }

  .bounce-down {
      animation: bounce-down 0.3s ease-in forwards;
  }

  /* Close Button Styles */
  .close-button {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
      height: 1.5rem;
      width: 1rem;
      font-size: 1.2rem;
      top: 0.75rem;
      right: 0.75rem;
      background: black;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      z-index: 50;
  }

  /* Overlay Styles */
  .overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: flex-start; /* Align modal at the top */
      padding-top: 4rem; /* Space from the top */
      z-index: 50;
  }

  /* Modal Content Styles */
  .modal-content {
      background-color: white;
      position: relative;
      max-height: 90vh; /* Prevent modal from exceeding viewport height */
      overflow-y: auto; /* Enable vertical scrolling within the modal */
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      border-radius: 0.5rem;
  }

  /* Optional: Customize Scrollbar */
  .modal-content::-webkit-scrollbar {
      width: 0px;
  }

  .modal-content::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
      .close-button {
          top: 0.5rem;
          right: 0.5rem;
      }
  }

  /* Content Styles */
  .content {
      position: relative;
      background-color: rgb(20, 20, 20);
      color: rgb(255, 255, 255);
      box-shadow:
          rgba(0, 0, 0, 0.2) 0px 2px 1px 1px,
          rgba(0, 0, 0, 0.14) 0px 1px 1px 0px,
          rgba(0, 0, 0, 0.12) 0px 1px 3px 0px;
      background-image: linear-gradient(
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.05)
      );
  }
</style>
