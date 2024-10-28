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
    { name: 'VidHide', url: 'https://node.hyplexnetworks.pw/embed' },
    // Additional sources
  ];

  const specialSeriesSourcesMap: { [key: string]: string } = {
    'Source 8 India': 'https://rgshows.me/player/series/api3/index.html',
    // Additional special series sources
  };

  // Function definitions: addViewed, getSource, getData, getMaxEpisodes, etc.

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Cleanup ads in iframe content
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        const iframeDocument = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        if (iframeDocument) {
          const ads = iframeDocument.querySelectorAll('.ad-class, #ad-id');
          ads.forEach(ad => {
            ad.parentNode?.removeChild(ad);
          });
        }
      };
    }
  }, [iframeRef, source]);

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
          ref={iframeRef}
          src={getSource()}
          allowFullScreen
          scrolling="no"
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox={source === 'VidHide' ? "allow-scripts allow-same-origin allow-presentation" : undefined}
        ></iframe>
      </div>
    </>
  );
}
