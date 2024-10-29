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
    { name: 'Source 5', url: 'https://vidsrc.pro/embed/' },
    { name: 'Stream 6', url: 'https://www.2embed.stream/embed/' },
    { name: 'Source 7', url: 'https://player.autoembed.cc/embed' },
    { name: 'PrimeWire', url: 'https://www.primewire.tf/embed' },
    { name: 'Alpha No Ads', url: 'https://hindi.vidsrc.nl/embed' },
    { name: 'Vidplay', url: 'https://vidsrc.cc/v2/' },
    { name: 'NEW VIP 4K ', url: 'https://vidsrc.dev/embed' },
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

  function getSource() {
    let baseSource = sources.find(s => s.name === source)?.url;
    let url;

    if (type === 'movie') {
      if (source === 'Brazil') {
        url = `${baseSource}/filme/${id}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/movie?tmdb=${id}`;
      } else if (source === 'VIP 4K') { // Handle VIP 4K for movies
        url = `${baseSource}?video_id=${id}&tmdb=1&check=1`;
      } else if (specialSeriesSourcesMap[source]) {
        url = `${baseSource}?id=${id}`;
      } else {
        url = `${baseSource}/movie/${id}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
      }
    } else if (type === 'series') {
      if (source === 'Brazil') {
        url = `${baseSource}/serie/${id}/${season}/${episode}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      } else if (source === 'VIP 4K') { // Handle VIP 4K for series
        url = `${baseSource}?video_id=${id}&tmdb=1&s=${season}&e=${episode}&check=1`;
      } else if (specialSeriesSourcesMap[source]) {
        url = `${specialSeriesSourcesMap[source]}?id=${id}&s=${season}&e=${episode}`;
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
