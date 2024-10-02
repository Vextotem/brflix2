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
        <h1 className="page-title">{query}</h1>
        <div className="page-cards">
          {data.length ? data.map(media => <Card key={media.id + media.type} {...media} />) : <p>No results found</p>}
        </div>
      </div>
    </>
  );
}
