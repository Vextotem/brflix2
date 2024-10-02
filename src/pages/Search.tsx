import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Loading from '@/components/Loading';
import MediaShort from '@/types/MediaShort';
import Card from '@/components/Card';

export default function Search() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState<MediaShort[]>([]);
  const [topSearches, setTopSearches] = useState<MediaShort[]>([]); // State for top searches
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const apiKey = import.meta.env.VITE_APP_TMDB_API_KEY; // Access TMDB API Key

  // Function to fetch data based on search query
  async function getData() {
    const query = searchParams.get('q');

    if (!query) {
      setQuery('');
      fetchTopSearches(); // Fetch top searches if no query is present
      return;
    }

    setLoading(true);
    setData([]);
    setQuery(query);

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch search data');
      }

      setData(result.results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function to fetch popular media (top searches) from TMDB API
  async function fetchTopSearches() {
    setLoading(true);
    try {
      const [popularMoviesResponse, popularTVResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`)
      ]);

      const popularMovies = await popularMoviesResponse.json();
      const popularTV = await popularTVResponse.json();

      if (!popularMoviesResponse.ok || !popularTVResponse.ok) {
        throw new Error('Failed to fetch top searches');
      }

      // Combine movies and TV shows into one array
      const combinedResults = [...popularMovies.results, ...popularTV.results];

      setTopSearches(combinedResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(getData, 500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Helmet>
        <title>
          {query ? `'${query}'` : 'Search'} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="page">
        <h1 className="page-title">{query || 'Top Searches'}</h1>
        <div className="page-cards">
          {data.length
            ? data.map((media) => <Card key={media.id + media.media_type} {...media} />)
            : query 
              ? <p>No results found</p> 
              : topSearches.map((media) => <Card key={media.id + media.media_type} {...media} />) // Show top searches if no query
          }
        </div>
      </div>
    </>
  );
}
