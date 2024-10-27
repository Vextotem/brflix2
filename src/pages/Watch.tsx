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
    { name: 'Source 3', url: 'https://vidsrc.io/embed' },
    { name: 'Source 4', url: 'https://www.2embed.skin/embed' },
    { name: 'Source 5', url: 'https://vidsrc.pro/embed' },
    { name: 'Source 6', url: 'https://player.autoembed.cc/embed' },
    { name: 'PrimeWire', url: 'https://www.primewire.tf/embed' },
    { name: 'VIP 4K', url: 'https://multiembed.mov/directstream.php' },
    { name: 'Alpha No Ads', url: 'https://player.vidsrc.nl/embed/' },
    { name: 'Beta No Ads', url: 'https://vidsrc.rip/embed/' },
    { name: 'Source 7', url: 'https://vidsrc.dev/embed' },
    { name: 'Stream', url: 'https://www.2embed.stream/embed/' },
    { name: 'Source 8 India', url: 'https://rgshows.me/player/movies/api3/index.html' },
    { name: 'Source 9 India', url: 'https://rgshows.me/player/movies/api2/index.html' },
    { name: 'Source 10 India', url: 'https://rgshows.me/player/movies/api1/index.html' },
    { name: 'Brazil', url: 'https://embed.warezcdn.com' }
  ];

  const specialSeriesSourcesMap: { [key: string]: string } = {
    'Source 8 India': 'https://rgshows.me/player/series/api3/index.html',
    'Source 9 India': 'https://rgshows.me/player/series/api2/index.html',
    'Source 10 India': 'https://rgshows.me/player/series/api1/index.html'
  };

  function addViewed(data: MediaShort) {
    let viewed: MediaShort[] = JSON.parse(localStorage.getItem('viewed') || '[]');
    viewed = viewed.filter(v => v.id !== data.id || v.type !== data.type);
    viewed.unshift(data);
    localStorage.setItem('viewed', JSON.stringify(viewed.slice(0, 15)));
  }

  function getSource() {
    const baseSource = sources.find(s => s.name === source)?.url;

    const isMovie = type === 'movie';
    const isSpecialSource = specialSeriesSourcesMap[source];

    if (isMovie) {
      return source === 'Brazil'
        ? `${baseSource}/filme/${id}`
        : source === 'PrimeWire'
        ? `${baseSource}/movie?tmdb=${id}`
        : source === 'VIP 4K'
        ? `${baseSource}?video_id=${id}&tmdb=1&check=1`
        : isSpecialSource
        ? `${isSpecialSource}?id=${id}`
        : `${baseSource}/movie/${id}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
    } else {
      return source === 'Brazil'
        ? `${baseSource}/serie/${id}/${season}/${episode}`
        : source === 'PrimeWire'
        ? `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : source === 'VIP 4K'
        ? `${baseSource}?video_id=${id}&tmdb=1&s=${season}&e=${episode}&check=1`
        : isSpecialSource
        ? `${isSpecialSource}?id=${id}&s=${season}&e=${episode}`
        : `${baseSource}/tv/${id}/${season}/${episode}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
    }
  }

  async function fetchAndCacheSources() {
    const sourceUrls = sources.map(src => src.url);
    await Promise.all(sourceUrls.map(url => fetch(url))); // Prefetching all sources
  }

  async function getData(_type: MediaType) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/${_type}/${id}`);
    const res = await req.json();
    if (!res.success) return;
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
    setMaxEpisodes(res.data.length);
  }

  useEffect(() => {
    if (!data || !('seasons' in data)) return;
    if (season > data.seasons || episode > maxEpisodes) {
      nav('/');
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
    localStorage.setItem('continue_' + id, JSON.stringify({ season: parseInt(s), episode: parseInt(e) }));
  }, [id, search]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetchAndCacheSources(); // Prefetch sources on page load
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        const ads = iframeRef.current?.contentDocument?.querySelectorAll('.ad-class, #ad-id');
        ads?.forEach(ad => ad.parentNode?.removeChild(ad));
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
