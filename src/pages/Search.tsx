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

  async function fetchPopularData() {
    try {
      console.log('Fetching popular data');
      const response = await fetch(`${import.meta.env.VITE_APP_API}/popular`);
      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to fetch popular data');
      }
      setData(result.data);
    } catch (error) {
      console.error('Error fetching popular data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSearchData(query: string) {
    try {
      console.log('Fetching search data for query:', query);
      const response = await fetch(`${import.meta.env.VITE_APP_API}/search?q=${query}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error('Failed to fetch search data');
      }
      setData(result.data);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function getData() {
    const query = searchParams.get('q');
    setLoading(true);
    setData([]);
    setQuery(query || '');

    if (!query) {
      // No query present, fetch popular data
      await fetchPopularData();
    } else {
      // Query present, fetch search data
      await fetchSearchData(query);
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
          {query ? `'${query}'` : 'Popular Searches'} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="page">
        <h1 className="page-title">{query ? query : 'Popular Searches'}</h1>
        <div className="page-cards">
          {data.length ? data.map(media => <Card key={media.id + media.type} {...media} />) : <p>No results found</p>}
        </div>
      </div>
    </>
  );
}
