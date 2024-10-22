<!-- src/routes/search/+page.svelte -->
<script lang="ts">
    import {  onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { searchMovies } from '$lib/api/API'
    import { derived } from 'svelte/store';
  import Card from '$lib/components/Card.svelte';




  export let data;

</script>


<div class="absolute top-36 w-screen">
    
    {#if data.query === ''}
        <p>Please enter a search query.</p>
    {:else if data.results.length === 0}
        <p class="text-red-500 absolute left-12">No results found for "{data.query}".</p>
    {:else}

        <div class="absolute  flex-wrap  left-12 flex gap-4">

            {#each data.results as item}
    <Card {item}/>                
            {/each}
        </div>  
        
    {/if}
</div>
