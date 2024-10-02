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
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [topSearches, setTopSearches] = useState<MediaShort[]>([]); // State for top searches

  // Function to get the search results based on the query
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

  // Function to fetch top searches
  async function getTopSearches() {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API}/top-searches`); // Fetching top searches from API
      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch top searches');
      }

      setTopSearches(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch search data when searchParams changes
  useEffect(() => {
    if (!searchParams.get('q')) {
      getTopSearches(); // Fetch top searches if no query is present
    } else {
      const timeout = setTimeout(getData, 500);
      return () => clearTimeout(timeout);
    }
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
        {query ? (
          <>
            <h1 className="page-title">{query}</h1>
            <div className="page-cards">
              {data.length ? data.map(media => <Card key={media.id + media.type} {...media} />) : <p>No results found</p>}
            </div>
          </>
        ) : (
          <>
            <h1 className="page-title">Top Searches</h1>
            <div className="page-cards">
              {topSearches.length ? topSearches.map(media => <Card key={media.id + media.type} {...media} />) : <p>No top searches found</p>}
            </div>
          </>
        )}
      </div>
    </>
  );
}
