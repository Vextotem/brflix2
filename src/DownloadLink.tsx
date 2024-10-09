import React, { useState } from 'react';
import axios from 'axios';

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your TMDB API key
const STREAMTAPE_API_URL = 'https://api.streamtape.com';
const STREAMTAPE_API_KEY = '6cc52d53cf5bb037b77c'; // Your StreamTape API Key

const DownloadLink: React.FC = () => {
    const [tmdbId, setTmdbId] = useState('');
    const [fileId, setFileId] = useState('');
    const [ticket, setTicket] = useState('');
    const [captchaResponse, setCaptchaResponse] = useState('');
    const [movieInfo, setMovieInfo] = useState<any>(null);
    const [downloadLink, setDownloadLink] = useState('');

    const fetchMovieInfo = async () => {
        try {
            const response = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            setMovieInfo(response.data);
        } catch (error) {
            console.error('Error fetching movie information:', error);
        }
    };

    const fetchDownloadLink = async () => {
        try {
            const response = await axios.get(`${STREAMTAPE_API_URL}/file/dl`, {
                params: {
                    file: fileId,
                    ticket: ticket,
                    captcha_response: captchaResponse,
                },
                headers: {
                    'Authorization': `Bearer ${STREAMTAPE_API_KEY}`
                }
            });

            if (response.data.status === 200) {
                setDownloadLink(response.data.result.url);
            } else {
                console.error('Error retrieving download link:', response.data.msg);
            }
        } catch (error) {
            console.error('Failed to retrieve download link:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMovieInfo();
        fetchDownloadLink();
    };

    return (
        <div>
            <h1>Get Movie/TV Download Link</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="TMDB ID"
                    value={tmdbId}
                    onChange={(e) => setTmdbId(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="File ID"
                    value={fileId}
                    onChange={(e) => setFileId(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Ticket"
                    value={ticket}
                    onChange={(e) => setTicket(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Captcha Response"
                    value={captchaResponse}
                    onChange={(e) => setCaptchaResponse(e.target.value)}
                />
                <button type="submit">Get Download Link</button>
            </form>

            {movieInfo && (
                <div>
                    <h2>{movieInfo.title || movieInfo.name}</h2>
                    <p>{movieInfo.overview}</p>
                    <p>Release Date: {movieInfo.release_date || movieInfo.first_air_date}</p>
                </div>
            )}

            {downloadLink && (
                <div>
                    <h3>Download Link:</h3>
                    <a href={downloadLink} target="_blank" rel="noopener noreferrer">{downloadLink}</a>
                </div>
            )}
        </div>
    );
};

export default DownloadLink;
