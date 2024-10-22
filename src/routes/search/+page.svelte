<!-- src/routes/search/+page.svelte -->
<script lang="ts">
    import {  onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { searchMovies } from '$lib/api/tmdb';
    import { derived } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';

    // State variables
    let searchQuery: string = '';
    let searchResults = [];
    let isLoading: boolean = false;
    let error: string | null = null;
    let currentPage: number = 1;
    let totalPages: number = 1;

    // Get the search query from the URL
    const queryStore = derived(page, ($page) => {
        return $page.url.searchParams.get('query') || '';
    });

    const unsubscribe = queryStore.subscribe(async(value) => {
        searchQuery = value;
        if (searchQuery.trim() !== '') {

          try {
           searchResults= await searchMovies(searchQuery, 1);

        } catch (err) {
            console.error('Error fetching search results:', err);
            error = 'Failed to fetch search results.';
        } finally {
            isLoading = false;
        }
        } else {
            // Reset state if query is empty
            searchResults = [];
            isLoading = false;
            error = null;
        }
    });

    onDestroy(() => {
        unsubscribe();
    });

 

</script>


<div class="absolute top-36 w-screen">
    {#if isLoading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if searchQuery === ''}
        <p>Please enter a search query.</p>
    {:else if searchResults.length === 0}
        <p class="text-red-500 absolute left-12">No results found for "{searchQuery}".</p>
    {:else}

        <div class="absolute  flex-wrap  left-12 flex gap-4">

            {#each searchResults as item}
    <Card {item}/>                
            {/each}
        </div>  
        
    {/if}
</div>
