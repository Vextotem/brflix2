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
    { name: 'Source 8 India', url: 'https://rgshows.me/player/movies/api1/index.html' },
    { name: 'Source 9 India', url: 'https://rgshows.me/player/movies/api2/index.html' },
    { name: 'Source 10 India', url: 'https://rgshows.me/player/movies/api3/index.html' },
    { name: 'Source 11 India', url: 'https://rgshows.me/player/movies/api4/index.html' }
  ];

  // Separate array for Indian sources
  const indiaSources = [
    'Source 8 India',
    'Source 9 India',
    'Source 10 India',
    'Source 11 India'
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

  // Function to construct the source URL based on type and selected source
  function getSource() {
    const baseSource = sources.find(s => s.name === source)?.url;
    if (!baseSource) {
      console.error(`Base source not found for source name: ${source}`);
      return '';
    }

    let url = '';

    if (type === 'movie') {
      if (indiaSources.includes(source)) {
        // Special format for the Indian sources for movies
        url = `${baseSource}?id=${encodeURIComponent(id)}`;
      } else {
        url = `${baseSource}/movie/${encodeURIComponent(id)}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
      }
    } else if (type === 'series') {
      if (indiaSources.includes(source)) {
        // Special format for the Indian sources for series
        url = `${baseSource}?id=${encodeURIComponent(id)}&s=${encodeURIComponent(season)}&e=${encodeURIComponent(episode)}`;
      } else {
        url = `${baseSource}/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
      }
    }

    console.log(`Constructed URL for source ${source}: ${url}`); // Debugging log
    return url;
  }

  async function getData(_type: MediaType) {
    try {
      const req = await fetch(`${import.meta.env.VITE_APP_API}/${_type}/${id}`);
      const res = await req.json();
      if (!res.success) {
        console.error('Failed to fetch data:', res);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function getMaxEpisodes(season: number) {
    try {
      const req = await fetch(`${import.meta.env.VITE_APP_API}/episodes/${id}?s=${season}`);
      const res = await req.json();
      if (!res.success) {
        console.error('Failed to fetch episodes:', res);
        nav('/');
        return;
      }
      const data = res.data;
      setMaxEpisodes(data.length);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      nav('/');
    }
  }

  // Effect to validate season and episode
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
  }, [data, maxEpisodes, season, episode, nav]);

  // Effect to parse URL search parameters and fetch data accordingly
  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    const me = search.get('me');
    if (!s || !e) {
      setType('movie');
      getData('movie');
      return;
    }
    const parsedSeason = parseInt(s, 10);
    const parsedEpisode = parseInt(e, 10);
    setSeason(parsedSeason);
    setEpisode(parsedEpisode);
    if (me) {
      setMaxEpisodes(parseInt(me, 10));
    } else {
      getMaxEpisodes(parsedSeason);
    }
    setType('series');
    getData('series');
    localStorage.setItem(
      `continue_${id}`,
      JSON.stringify({
        season: parsedSeason,
        episode: parsedEpisode,
      })
    );
  }, [id, search]);

  // Effect to handle body overflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Effect to handle iframe onload for ad removal
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDocument) {
            // Remove ad elements by class or ID
            const ads = iframeDocument.querySelectorAll('.ad-class, #ad-id');
            ads.forEach(ad => {
              ad.parentNode?.removeChild(ad);
            });
          }
        } catch (error) {
          console.warn('Unable to access iframe content:', error);
        }
      };
    }
  }, [source, type, id, season, episode]);

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
            title="Go Back"
            style={{ cursor: 'pointer' }}
          ></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() => nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`)}
              title="Next Episode"
              style={{ cursor: 'pointer' }}
            ></i>
          )}

          {/* Dropdown for selecting video source */}
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            style={{ marginLeft: 'auto' }} // Align to the right
          >
            {sources.map((src) => (
              <option key={src.name} value={src.name}>
                {src.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Video Player */}
        {getSource() ? (
          <iframe
            key={getSource()} // Adding key to force reload when source changes
            scrolling="no"
            allowFullScreen
            referrerPolicy="origin"
            title={data?.title}
            src={getSource()}
            ref={iframeRef}
            style={{ width: '100%', height: '100%', border: 'none' }}
          ></iframe>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}
