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

  // New state for the selected video source
  const [source, setSource] = useState<string>('Source 1');

  // Array of sources including the new sources
  const sources = [
    { name: 'Source 1', url: 'https://vid.braflix.win/embed' },
    { name: 'Source 2', url: 'https://vidlink.pro/' },
    { name: 'Source 3', url: 'https://vidsrc.io/embed' },
    { name: 'Source 4', url: 'https://vidsrc.pro/embed' },
    { name: 'Source 5', url: 'https://vidsrc.icu/embed' },
    { name: 'Source 6', url: 'https://player.autoembed.cc/embed' },       
    { name: 'Source 7', url: 'https://vidsrc.cc/v3/embed' },
    { name: 'Source 8 India', url: 'https://rgshows.me/player/movies/api2/index.html' },
    { name: 'Source 9 India', url: 'https://rgshows.me/player/movies/api1/index.html' },  // New Source 9 India
    { name: 'Source 10 India', url: 'https://rgshows.me/player/movies/api3/index.html' }, // New Source 10 India India India India India India India India
    { name: 'Source 11 India', url: 'https://rgshows.me/player/movies/api4/index.html' }  // New Source 11 India India
  ];

  function addViewed(data: MediaShort) {
    let viewed: MediaShort[] = [];
    const storage = localStorage.getItem('viewed');
    if (storage) {
      viewed = JSON.parse(storage);
    }
    const index = viewed.findIndex(v => v.id === data.id && v.type === data.type);
    if (index !== -1) {
      viewed.splice(index, 1);
    }
    viewed.unshift(data);
    viewed = viewed.slice(0, 15);
    localStorage.setItem('viewed', JSON.stringify(viewed));
  }

  // Modify getSource to include the selected source
  function getSource() {
    let baseSource = sources.find(s => s.name === source)?.url;
    let url;
    if (type === 'movie') {
      if (['Source 8 India', 'Source 9 India', 'Source 10 India', 'Source 11 India'].includes(source)) {
        // Special format for the new sources for movies
        url = `${baseSource}?id=${id}`;
      } else {
        url = `${baseSource}/movie/${id}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
      }
    } else if (type === 'series') {
      if (['Source 8 India', 'Source 9 India', 'Source 10 India', 'Source 11 India'].includes(source)) {
        // Special format for the new sources for series
        url = `${baseSource}?id=${id}&s=${season}&e=${episode}`;
      } else {
        url = `${baseSource}/tv/${id}/${season}/${episode}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
      }
    }
    return url;
  }

  async function getData(_type: MediaType) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/${_type}/${id}`);
    const res = await req.json();
    if (!res.success) {
      return;
    }
    const data: Movie | Series = res.data;
    setData(data);
    addViewed({
      id: data.id,
      poster: data.images.poster,
      title: data.title,
      type: _type,
    });
  }

  async function getMaxEpisodes(season: number) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/episodes/${id}?s=${season}`);
    const res = await req.json();
    if (!res.success) {
      nav('/');
      return;
    }
    const data = res.data;
    setMaxEpisodes(data.length);
  }

  useEffect(() => {
    if (!data) return;
    if (!('seasons' in data)) return;
    if (season > data.seasons) {
      nav('/');
      return;
    }
    if (episode > maxEpisodes) {
      nav('/');
      return;
    }
  }, [data, maxEpisodes]);

  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    const me = search.get('me');
    if (!s || !e) {
      setType('movie');
      getData('movie');
      return;
    }
    setSeason(parseInt(s));
    setEpisode(parseInt(e));
    if (me) {
      setMaxEpisodes(parseInt(me));
    } else {
      getMaxEpisodes(parseInt(s));
    }
    setType('series');
    getData('series');
    localStorage.setItem(
      'continue_' + id,
      JSON.stringify({
        season: parseInt(s),
        episode: parseInt(e),
      })
    );
  }, [id, search]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Add iframe onload event for ad removal
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        const iframeDocument = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        if (iframeDocument) {
          // Remove ad elements by class or ID
          const ads = iframeDocument.querySelectorAll('.ad-class, #ad-id');
          ads.forEach(ad => {
            ad.parentNode?.removeChild(ad);
          });
        }
      };
    }
  }, [iframeRef.current]);

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

          {/* Dropdown for selecting video source */}
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {sources.map((src) => (
              <option key={src.name} value={src.name}>
                {src.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Video Player */}
        <iframe
          scrolling="no"
          allowFullScreen
          referrerPolicy="origin"
          title={data?.title}
          src={getSource()}
          ref={iframeRef}
        ></iframe>
      </div>
    </>
  );
}
