import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function Watch() {
  const nav = useNavigate();
  const { id } = useParams();  // Grabs ID from the URL
  const [search] = useSearchParams();
  const [type, setType] = useState('movie');  // Set default type to movie
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [selectedServer, setSelectedServer] = useState('ME');  // For the server selection

  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Function to construct the server URL dynamically
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
    return url;
  };

  // Update the iframe URL when selectedServer or other dependencies change
  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    if (s && e) {
      setSeason(parseInt(s));
      setEpisode(parseInt(e));
      setType('tv');
    } else {
      setType('movie');
    }
  }, [search]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = getServerURL();  // Update iframe URL when server changes
    }
  }, [selectedServer, season, episode]);

  // Simple function to update max episodes when necessary
  const updateMaxEpisodes = async () => {
    if (type === 'tv') {
      const response = await fetch(`/api/episodes/${id}?s=${season}`);
      const data = await response.json();
      setMaxEpisodes(data.length);
    }
  };

  useEffect(() => {
    if (type === 'tv') {
      updateMaxEpisodes();
    }
  }, [season]);

  return (
    <>
      <Helmet>
        <title>{`Watch ${type === 'tv' ? `Episode ${episode}` : 'Movie'} - Your App Name`}</title>
      </Helmet>

      <div className="player">
        <iframe
          ref={iframeRef}
          allowFullScreen
          scrolling="no"
          src={getServerURL()}  // Set the iframe source dynamically
          style={{ width: '100%', height: '100%', border: '0' }}
        ></iframe>
      </div>

      <div id="controls">
        <div>
          {/* Back button */}
          <i className="fa-solid fa-arrow-left" onClick={() => nav(-1)}></i>

          {/* Server Selection Dropdown */}
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

          {/* Next Episode button (if it's a TV show) */}
          {type === 'tv' && episode < maxEpisodes && (
            <Link to={`/watch/${id}?s=${season}&e=${episode + 1}`} className="fa-solid fa-arrow-right"></Link>
          )}
        </div>
      </div>
    </>
  );
}
