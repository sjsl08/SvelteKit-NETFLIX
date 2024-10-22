<!-- src/lib/components/PlayerWrapper.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import Player from '$lib/components/Player.svelte';
    import { cardState } from '$lib/store/GlobalState';
    import { onDestroy, onMount } from 'svelte';

    // Automatically subscribe to the 'page' store and extract the 'id' parameter
    let videoId: string;
    $: videoId = $page.params.id;

    // Define trailer as an object with 'key' or null
    let trailer: { key: string } | null = null;
    let loading: boolean = false;
    let error: string | null = null;

    // Track the last fetched videoId to prevent multiple fetches
    let fetchedVideoId: string | null = null;

    // Reactive statement to fetch trailer when videoId changes
    $: if (videoId && videoId !== fetchedVideoId) {
        console.log(`Detected new videoId: ${videoId}`);

        // Update the fetchedVideoId to the current videoId
        fetchedVideoId = videoId;

        // Update card state
        cardState.update((state) => ({
            ...state,
            isHovered: false,
            item: null,
            position: { x: -500, y: 0 }
        }));

        // Fetch trailer from server-side endpoint
        (async () => {
            loading = true;
            error = null;
            trailer = null; // Reset trailer before fetching
            try {
                console.log(`Fetching trailer for videoId: ${videoId}`);
                const response = await fetch(`/api/movies/${videoId}/trailer`, {
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
                    trailer = data.trailer;
                    console.log('Fetched Trailer:', trailer);
                } else {
                    console.warn('No trailer found in the response.');
                    error = 'Trailer not available.';
                }
            } catch (err: any) {
                console.error('Failed to fetch trailer:', err);
                error = err.message;
            } finally {
                loading = false;
            }
        })();
    }

    // Optional: Handle Escape key to close modal or perform other actions
    onMount(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                // Implement your logic, e.g., closing a modal
                // closeModal(); // Uncomment if you have a closeModal function
                console.log('Escape key pressed');
            }
        };
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });

    // Cleanup if necessary
    onDestroy(() => {
        // Any necessary cleanup
    });
</script>

<div>
    {#if loading}
        <p class="absolute top-28 left-12 w-full text-white">Loading trailer...</p>
    {:else if trailer}
        <Player showControls={true} videoId={trailer.key} />
    {:else if error}
        <p class="absolute top-28 left-12 w-full text-white">{error}</p>
    {:else}
        <p class="absolute top-28 left-12 w-full text-white">No Playback video...</p>
    {/if}
</div>

<style>
    /* Optional: Add styles if needed */
</style>
