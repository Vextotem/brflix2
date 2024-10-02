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
      const response = await fetch(`${import.meta.env.VITE_APP_API}/search?q=${query}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch data');
      }

      setData(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Function to fetch top searches (popular media) from TMDB API
  async function fetchTopSearches() {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/top-searches`);
      const popularMovies = await fetch(`${import.meta.env.VITE_APP_API}/movie/popular`);
      const popularTV = await fetch(`${import.meta.env.VITE_APP_API}/tv/popular`);

      const resultMovies = await popularMovies.json();
      const resultTV = await popularTV.json();

      if (!resultMovies.success || !resultTV.success) {
        throw new Error('Failed to fetch top searches');
      }

      // Merge movie and TV show results into one array
      setTopSearches([...resultMovies.results, ...resultTV.results]);
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
            ? data.map((media) => <Card key={media.id + media.type} {...media} />)
            : query 
              ? <p>No results found</p> 
              : topSearches.map((media) => <Card key={media.id + media.type} {...media} />) // Show top searches if no query
          }
        </div>
      </div>
    </>
  );
}
