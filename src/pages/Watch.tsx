/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
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

  // State to handle server selection
  const [selectedServer, setSelectedServer] = useState('ME');

  const serverURLs = {
    ME: `https://vidsrc.xyz/embed/${type}/${id}`,
    PRO: `https://vidsrc.pro/embed/${type}/${id}`,
    TO: `https://vidsrc.xyz/embed/${type}/${id}`,
    SFLIX: `https://vidsrc.in/embed/${type}/${id}`,
    MULTI: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    CLUB: `https://moviesapi.club/${type}/${id}`,
    BINGE: `https://vidsrc.to/embed/${type}/${id}`,
    XYZ: `https://vidsrc.xyz/embed/${type}/${id}`,
    TWO: `https://www.2embed.cc/embed${type === 'tv' ? 'tv' : ''}/${id}`,
    SS: `https://player.smashy.stream/${type}/${id}`,
  };

  // Function to generate the server URL
  const getServerURL = () => {
    let url = serverURLs[selectedServer];
    if (type === 'tv' && season && episode) {
      if (selectedServer === 'MULTI' || selectedServer === 'TWO') {
        url += `&s=${season}&e=${episode}`;
      } else if (selectedServer === 'SS') {
        url += `?s=${season}&e=${episode}`;
      } else if (selectedServer === 'CLUB') {
        url += `-${season}-${episode}`;
      } else if (selectedServer === 'SFLIX') {
        url += `&season=${season}&episode=${episode}`;
      } else {
        url += `/${season}/${episode}`;
      }
    }
    if (selectedServer === 'PRO') {
      url += '?&autoplay=1&theme=ff2222';
    }
    return url;
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
          {data ? `${data.title} - ${import.meta.env.VITE_APP_NAME}` : 'Watch'}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i className="fa-regular fa-arrow-left" onClick={() => nav(`/${type}/${id}`)}></i>
          {type === 'series' && episode < maxEpisodes && (
            <i
              className="fa-regular fa-forward-step right"
              onClick={() => nav(`/watch/${id}?s=${season}&e=${episode + 1}&me={maxEpisodes}`)}
            ></i>
          )}
        </div>
        <iframe
          scrolling="no"
          allowFullScreen
          referrerPolicy="origin"
          title={data ? data.title : 'Watch'}
          src={getServerURL()}
          ref={iframeRef}
          style={{ width: '100%', height: '100%', border: '0' }}
        ></iframe>
      </div>

      <div id="button-grid">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select
            name="servers"
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            id="server-select"
          >
            <option value="ME">ME</option>
            <option value="PRO">PRO</option>
            <option value="TO">TO</option>
            <option value="SFLIX">SFLIX</option>
            <option value="MULTI">MULTI</option>
            <option value="CLUB">CLUB</option>
            <option value="XYZ">XYZ</option>
            <option value="BINGE">BINGE</option>
            <option value="TWO">2EMBED</option>
            <option value="SS">SMASHY</option>
          </select>
          {type === 'series' && (
            <Link to={`/watch/${id}?s=${season}&e=${episode + 1}`} id="player-button">
              <i className="fa-solid fa-arrow-right" style={{ fontSize: '26px' }} alt="Next"></i>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
