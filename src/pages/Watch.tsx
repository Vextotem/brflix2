import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [data, setData] = useState<Movie | Series>();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [source, setSource] = useState<string>('Source 1');

  const sources = [
    { name: 'Source 1', url: 'https://vid.braflix.win/embed' },
    { name: 'Source 2', url: 'https://wrapurl.pages.dev/redirect.html?fw=https%3A%2F%2Fvidlink.pro%2F' },
    // ... other sources ...
  ];

  // Prefetch source when it changes
  useEffect(() => {
    const sourceUrl = getSource();
    if (sourceUrl) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = sourceUrl;
      document.head.appendChild(link);

      // Cleanup: Remove the link after prefetching
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [source]); // Run this effect whenever the source changes

  function getSource() {
    let baseSource = sources.find(s => s.name === source)?.url;
    let url;

    if (type === 'movie') {
      // ... existing logic to set URL for movies ...
    } else if (type === 'series') {
      // ... existing logic to set URL for series ...
    }
    return url;
  }

  // ... rest of the component logic ...

  return (
    <>
      <Helmet>
        <title>
          {data?.title} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i className="fa-regular fa-arrow-left" onClick={() => nav(`/${type}/${id}`)}></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() => nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`)}
            ></i>
          )}
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {sources.map((src) => (
              <option key={src.name} value={src.name}>
                {src.name}
              </option>
            ))}
          </select>
        </div>
        
        <iframe
          scrolling="no"
          allowFullScreen
          src={getSource()}
          ref={iframeRef}
          style={{ width: '100%', height: '100%', border: 'none' }}
        ></iframe>
      </div>
    </>
  );
}
