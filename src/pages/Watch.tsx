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

  const sources = [
    { name: 'Braflix', url: 'https://api.braflix.win/embed' },
    { name: 'Vidlink', url: 'https://vidlink.pro/' },
    { name: 'Multi', url: 'https://vidsrc.dev/embed' },
    { name: 'Viaplay', url: 'https://www.rgshows.me/player/movies/api2/index.html' },
    { name: 'Vidplay', url: 'https://vidsrc.cc/v2/embed' },
    { name: 'Pro', url: 'https://vidsrc.pro/embed/' }, 
    { name: 'Vidsrc', url: 'https://vidsrc.io/embed' },
    { name: '2embed', url: 'https://www.2embed.stream/embed/' },
      { name: 'Kex', url: 'https://moviekex.online/embed/' },
      { name: 'VIP', url: 'https://vidsrc.vip/embed/' },
    { name: 'PrimeWire', url: 'https://www.primewire.tf/embed' },
    { name: 'LimeWire', url: 'https://bombthe.irish/embed/' },
    { name: 'Club', url: 'https://moviesapi.club/' },
      { name: '111Movies', url: 'https://111movies.com/' },
        { name: 'Hexa', url: 'https://api.hexa.watch' },
    { name: 'Hindi HD', url: 'https://api.vidsrc.win/hindi.html' },
    { name: 'Autoembed', url: 'https://player.autoembed.cc/embed' },
    { name: 'India I', url: 'https://api.vidsrc.win/saysu.html' },
    { name: 'India II', url: 'https://api.vidsrc.win/embed.html' },
    { name: 'India III', url: 'https://api.vidsrc.win/api.html' },
    { name: 'Brazil', url: 'https://embed.warezcdn.com' },
    { name: 'Super', url: 'https://api.vidsrc.win/super.html' },
    { name: 'Flixy', url: 'https://flicky.host/embed' }
  ];

  const specialSeriesSourcesMap: { [key: string]: string } = {
    'India I': 'https://api.vidsrc.win/greentv.html',
    'India II': 'https://api.vidsrc.win/embedtv.html',
    'Viaplay': 'https://rgshows.me/player/series/api2/index.html',
    'Hindi HD': 'https://api.vidsrc.win/hinditv.html',
    'Super': 'https://api.vidsrc.win/vidtv.html'
  };

  const [source, setSource] = useState<string>(
    localStorage.getItem('selectedSource') || sources[0].name
  );

  useEffect(() => {
    if (!localStorage.getItem('selectedSource')) {
      setSource(sources[0].name);
    }
  }, []);

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
    const baseSource = sources.find(s => s.name === source)?.url;
    if (!baseSource) return '';

    let url;
    if (type === 'movie') {
      if (source === 'Brazil') {
        url = `${baseSource}/filme/${id}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/movie?tmdb=${id}`;
      } else if (source === 'Multi') {
        url = `https://vidsrc.dev/embed/movie/${id}`;
      } else if (source === 'Flixy') {
        url = `${baseSource}/movie/?id=${id}`;
      } else if (specialSeriesSourcesMap[source]) {
        url = `${baseSource}?id=${id}`;
      } else if (source === 'India III') {
        url = `${baseSource}?id=${id}`;
      } else {
        url = `${baseSource}/movie/${id}`;
      }
    } else if (type === 'series') {
      if (source === 'Brazil') {
        url = `${baseSource}/serie/${id}/${season}/${episode}`;
      } else if (source === 'PrimeWire') {
        url = `${baseSource}/tv?tmdb=${id}&season=${season}&episode=${episode}`;
      } else if (source === 'Multi') {
        url = `https://vidsrc.dev/embed/tv/${id}/${season}/${episode}`;
      } else if (source === 'Flixy') {
        url = `${baseSource}/tv/?id=${id}/${season}/${episode}`;
      } else if (source === 'Club') {
        url = `${baseSource}/tv/${id}-${season}-${episode}`; // Fixed Club series format
      } else if (specialSeriesSourcesMap[source]) {
        url = `${specialSeriesSourcesMap[source]}?id=${id}&s=${season}&e=${episode}`;
      } else if (source === 'India III') {
        url = `${baseSource}?id=${id}&s=${season}&e=${episode}`;
      } else {
        url = `${baseSource}/tv/${id}/${season}/${episode}`;
      }
    }
    return url;
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
    if (!data) return;
    if (!('seasons' in data)) return;
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
    setType('series');
    getData('series');
    if (me) {
      setMaxEpisodes(parseInt(me));
    } else {
      getMaxEpisodes(parseInt(s));
    }
  }, [id, search]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedSource', source);
  }, [source]);

  return (
    <>
      <Helmet>
        <title>
          {data?.title} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i
            className="fa-regular fa-arrow-left"
            onClick={() => nav(`/${type}/${id}`)}
          ></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() =>
                nav(
                  `/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`
                )
              }
            ></i>
          )}
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            {sources.map((s, index) => (
              <option key={index} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <iframe
          ref={iframeRef}
          src={getSource()}
          width="100%"
          height="100%"
          allowFullScreen
          title="Video Player"
          referrerPolicy="origin"
        />
      </div>
    </>
  );
}
