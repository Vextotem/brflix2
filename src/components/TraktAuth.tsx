import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const TraktAuth: React.FC = () => {
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const clientId = process.env.REACT_APP_TRAKT_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_TRAKT_CLIENT_SECRET;
  const redirectUri = process.env.REACT_APP_TRAKT_REDIRECT_URI;
  const traktAuthUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

  const getAccessToken = async (code: string) => {
    const response = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const data = await response.json();
    setAccessToken(data.access_token);
    localStorage.setItem('trakt_access_token', data.access_token);
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('trakt_access_token');
    if (!token) return;

    const response = await fetch('https://api.trakt.tv/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'trakt-api-version': '2',
        'trakt-api-key': clientId || '',
      },
    });

    const data = await response.json();
    setUserData(data);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && !authCode) {
      setAuthCode(code);
      getAccessToken(code);
    }
  }, [authCode]);

  useEffect(() => {
    if (accessToken) {
      fetchUserData();
    }
  }, [accessToken]);

  return (
    <div>
      <h1>Trakt.tv Integration</h1>
      {!accessToken ? (
        <a href={traktAuthUrl} style={{ display: 'flex', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '8px' }} />
          Connect with Trakt.tv
        </a>
      ) : (
        <>
          {userData ? (
            <div>
              <h2>Welcome, {userData.username}</h2>
              <p>Full Name: {userData.name}</p>
              <p>Joined: {userData.joined_at}</p>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </>
      )}
    </div>
  );
};

export default TraktAuth;