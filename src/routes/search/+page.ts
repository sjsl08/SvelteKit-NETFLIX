import { searchMovies } from "$lib/api/API";
import type { PageLoad } from "./$types";

export const load : PageLoad =async ({fetch,url})=>{


    console.log(url.searchParams.get("query"))


    const response = await searchMovies(fetch,url.searchParams.get("query"),1)

    console.log(response);

    return {
        results:response,
        query:url.searchParams.get("query")
    }

    


}