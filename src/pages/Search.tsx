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
  const [popularMovies, setPopularMovies] = useState<MediaShort[]>([]); // State for popular movies
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingPopular, setLoadingPopular] = useState<boolean>(true); // Loading state for popular movies

  async function getData() {
    const query = searchParams.get('q');

    if (!query) {
      nav('/');
      return;
    }

    setLoading(true);
    setData([]);
    setQuery(query);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/search/movie?query=${query}`); // TMDB-like search structure
      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch data');
      }

      setData(result.results); // Use 'results' for search
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function getPopularMovies() {
    setLoadingPopular(true); // Set loading state for popular movies
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/movie/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US&page=1`); // TMDB-like popular movies structure
      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch popular movies');
      }

      setPopularMovies(result.results); // Assuming the response structure
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPopular(false); // Reset loading state
    }
  }

  useEffect(() => {
    const timeout = setTimeout(getData, 500);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => {
    getPopularMovies(); // Fetch popular movies when the component mounts
  }, []);

  if (loading || loadingPopular) {
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
        <h1 className="page-title">{query}</h1>
        
        {/* Display popular movies */}
        <h2>Popular Movies</h2>
        <div className="page-cards">
          {popularMovies.length ? popularMovies.map(media => <Card key={media.id} {...media} />) : <p>No popular movies found</p>}
        </div>

        <div className="page-cards">
          {data.length ? data.map(media => <Card key={media.id} {...media} />) : <p>No results found</p>}
        </div>
      </div>
    </>
  );
}
