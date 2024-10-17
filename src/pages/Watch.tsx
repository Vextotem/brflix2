<!DOCTYPE html>
<html lang="en">
<head>
    <script disable-devtool-auto src='https://cdn.jsdelivr.net/npm/disable-devtool@latest'></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RgShows Api 5</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/devtools-detector/2.0.17/devtools-detector.js"></script>
    <script src="../../../js/protected_devtoolsdetector.js" preload></script>
    <script src="../../../js/nocheats.js" preload></script>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #121212;
            color: #ffffff;
            font-family: Arial, sans-serif;
        }
        #loader {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.5em;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body>
    <div id="loader">Loading...</div>
    <iframe id="videoFrame" src="" style="display:none;" allowfullscreen></iframe>

    <script>
        const apiKey = 'f6e840332142f77746185ab4e67be858';

        // Function to get URL parameter
        function getParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }

        // Function to fetch IMDb ID using TMDB ID
        async function fetchImdbId(tmdbId) {
            const url = `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.imdb_id;
        }

        // Main function to initialize the process
        async function init() {
            const loader = document.getElementById('loader');
            const videoFrame = document.getElementById('videoFrame');
            const tmdbId = getParam('id');
            if (tmdbId) {
                loader.style.display = 'block';
                try {
                    const imdbId = await fetchImdbId(tmdbId);
                    if (imdbId) {
                        const iframeUrl = `https://www.bharatflix.live/watch/movie/${tmdbId}/${imdbId}`;
                        videoFrame.src = iframeUrl;
                        videoFrame.style.display = 'block';
                    } else {
                        loader.textContent = 'IMDb ID not found.';
                    }
                } catch (error) {
                    loader.textContent = 'Error fetching IMDb ID.';
                } finally {
                    loader.style.display = 'none';
                }
            } else {
                loader.textContent = 'TMDB ID not provided in the URL.';
                loader.style.display = 'block';
            }
        }

        // Initialize the script
        init();
    </script>
</body>
</html>
