let map;
let isZoomedIn = false;
const defaultZoom = 5;

document.getElementById('space-video').addEventListener('click', function () {
    document.getElementById('space-video').classList.add('hidden');
    document.getElementById('central-text').classList.add('hidden');
    document.getElementById('central-text1').classList.add('hidden');
    document.getElementById('overlay-title').classList.add('hidden')

    document.getElementById('map').classList.remove('hidden');

    initMap();
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: defaultZoom,
        center: { lat: 20.5937, lng: 78.9629 }
    });

    map.addListener('click', function(event) {
        if (!isZoomedIn) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            smoothZoom(map, 10, () => {
                map.panTo({ lat: lat, lng: lng });
                fetchWeatherData(lat, lng, map);
                isZoomedIn = true;
            });
        }
    });
}

function smoothZoom(map, targetZoom, callback) {
    const currentZoom = map.getZoom();
    if (currentZoom !== targetZoom) {
        google.maps.event.addListenerOnce(map, 'zoom_changed', function(event) {
            smoothZoom(map, targetZoom, callback);
        });
        setTimeout(function() {
            map.setZoom(currentZoom < targetZoom ? currentZoom + 1 : currentZoom - 1);
        }, 150);
    } else {
        callback();
    }
}

function smoothPanAndZoomOut(map, targetZoom, targetCenter) {
    google.maps.event.addListenerOnce(map, 'zoom_changed', function(event) {
        if (map.getZoom() !== targetZoom) {
            smoothPanAndZoomOut(map, targetZoom, targetCenter);
        }
    });
    setTimeout(function() {
        map.panTo(targetCenter);
        map.setZoom(targetZoom);
    }, 150);
}


function fetchWeatherData(lat, lng, map) {
    const apiKey = 'YOUR_OPENWEATHER_API_KEY_HERE'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const locationName = data.name || 'Unknown location';
            const temperature = `${data.main.temp} °C`;
            const windSpeed = `${data.wind.speed} mph`;
            const humidity = `${data.main.humidity} %`;
            const cloudCover = `${data.clouds.all} %`;
            const rain = data.rain ? `${data.rain['1h']} in` : '0 in';

            document.getElementById('location').innerText = locationName;
            document.getElementById('temperature').innerText = `Temperature: ${temperature}`;
            document.getElementById('wind-speed').innerText = `Wind Speed: ${windSpeed}`;
            document.getElementById('humidity').innerText = `Humidity: ${humidity}`;
            document.getElementById('cloud-cover').innerText = `Cloud Cover: ${cloudCover}`;
            document.getElementById('rain').innerText = `Rain: ${rain}`;

            document.getElementById('weather-popup').classList.remove('hidden');

            setWeatherBackground(data.weather[0].main.toLowerCase());
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
        });
}

function setWeatherBackground(weatherMain) {
    const backgroundVideo = document.getElementById('background-video')

    let videoSrc = '';
    switch (weatherMain) {
        case 'rain':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264441/Weather/rain.mp4'; 
            break;
        case 'clear':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264455/Weather/clear.mp4';
            break;
        case 'clouds':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264460/Weather/cloud.mp4'; 
            break;
        case 'thunderstorm':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264313/Weather/thunderstorm.mp4';
            break;
        case 'snow':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264476/Weather/snow.mp4';
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264485/Weather/mist.mp4'; 
            break;
        default:
            videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264437/Weather/default.mp4'; 
    
    }

    backgroundVideo.src = videoSrc;
    backgroundVideo.classList.remove('hidden');

    document.getElementById('map').classList.add('hidden');
}

document.getElementById('close-popup').addEventListener('click', function() {
    document.getElementById('weather-popup').classList.add('hidden');
    document.getElementById('background-video').classList.add('hidden');
    document.getElementById('map').classList.remove('hidden');
    
    isZoomedIn = false;
});

function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?AIzaSyBEYc0pF8doUaqqaksgFw1W20f-3YyK8bw&callback=initMap`; // Replace with your actual API key
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', loadGoogleMapsScript);
