import { Component, AfterViewInit } from '@angular/core';
import { WeatherService } from '../../services/weather';
declare const google: any;

@Component({
  selector: 'app-weather',
  templateUrl: './weather.html',
  styleUrls: ['./weather.css']
})
export class WeatherComponent implements AfterViewInit {
  private map: any;
  private isZoomedIn = false;
  private defaultZoom = 5;
  private searchMode: 'home' | 'map' = 'home';

  constructor(private weatherService: WeatherService) {}

  ngAfterViewInit(): void {
    document
      .getElementById('space-video')
      ?.addEventListener('click', () => this.startMap());
    document
      .getElementById('close-popup')
      ?.addEventListener('click', () => this.closePopup());
    document
      .getElementById('search-btn')
      ?.addEventListener('click', () => this.searchWeather());
    document
      .getElementById('popup-search-btn')
      ?.addEventListener('click', () => this.searchWeatherFromPopup());
    this.loadGoogleMapsScript();
  }

  startMap() {
    this.searchMode = 'map';
    document.getElementById('space-video')?.classList.add('hidden');
    document.getElementById('central-text')?.classList.add('hidden');
    document.getElementById('central-text1')?.classList.add('hidden');
    document.getElementById('overlay-title')?.classList.add('hidden');
    document.getElementById('search-bar')?.classList.add('hidden');
    document.getElementById('map')?.classList.remove('hidden');
    this.initMap();
  }

  initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: this.defaultZoom,
      center: { lat: 20.5937, lng: 78.9629 }
    });

    this.map.addListener('click', (event: any) => {
      if (!this.isZoomedIn) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        this.smoothZoom(this.map, 10, () => {
          this.map.panTo({ lat, lng });
          this.fetchWeatherData(lat, lng);
          this.isZoomedIn = true;
        });
      }
    });
  }

  smoothZoom(map: any, targetZoom: number, callback: any) {
    const currentZoom = map.getZoom();
    if (currentZoom !== targetZoom) {
      google.maps.event.addListenerOnce(map, 'zoom_changed', () =>
        this.smoothZoom(map, targetZoom, callback)
      );
      setTimeout(() => {
        map.setZoom(currentZoom < targetZoom ? currentZoom + 1 : currentZoom - 1);
      }, 150);
    } else {
      callback();
    }
  }

  fetchWeatherData(lat: number, lng: number) {
    this.weatherService.getWeatherByLatLng(lat, lng).subscribe({
      next: (data: any) => {
        // Parse JSON if it's returned as a string from backend
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        const locationName = data.name || 'Unknown location';
        document.getElementById('location')!.innerText = locationName;
        document.getElementById('temperature')!.innerText = `Temperature: ${data.main.temp} °C`;
        document.getElementById('wind-speed')!.innerText = `Wind Speed: ${data.wind.speed} mph`;
        document.getElementById('humidity')!.innerText = `Humidity: ${data.main.humidity}%`;
        document.getElementById('cloud-cover')!.innerText = `Cloud Cover: ${data.clouds.all}%`;
        document.getElementById('rain')!.innerText = `Rain: ${
          data.rain ? data.rain['1h'] + ' in' : '0 in'
        }`;

        document.getElementById('weather-popup')?.classList.remove('hidden');
        this.setWeatherBackground(data.weather[0].main.toLowerCase());
      },
      error: () => alert('Failed to fetch weather data.')
    });
  }

  setWeatherBackground(weatherMain: string) {
    const backgroundVideo = document.getElementById(
      'background-video'
    ) as HTMLVideoElement;
    let videoSrc = '';
    switch (weatherMain) {
      case 'rain':
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264441/Weather/rain.mp4';
        break;
      case 'clear':
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264455/Weather/clear.mp4';
        break;
      case 'clouds':
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264460/Weather/cloud.mp4';
        break;
      case 'thunderstorm':
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264313/Weather/thunderstorm.mp4';
        break;
      case 'snow':
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264476/Weather/snow.mp4';
        break;
      default:
        videoSrc =
          'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264437/Weather/default.mp4';
    }

    backgroundVideo.src = videoSrc;
    backgroundVideo.classList.remove('hidden');
    document.getElementById('map')?.classList.add('hidden');

    // explicit play call to ensure video playback
    try {
      backgroundVideo.play();
    } catch (e) {
      console.warn('Background video playback failed:', e);
    }
  }

  closePopup() {
    document.getElementById('weather-popup')?.classList.add('hidden');
    document.getElementById('background-video')?.classList.add('hidden');

    if (this.searchMode === 'map') {
      // If user came from map, show map again
      document.getElementById('map')?.classList.remove('hidden');
    } else {
      // If user came from home search, show home page
      document.getElementById('map')?.classList.add('hidden');
      this.showHomePage();
    }

    this.isZoomedIn = false;
    // Clear popup search input
    const popupInput = document.getElementById('popup-city-input') as HTMLInputElement;
    if (popupInput) {
      popupInput.value = '';
    }
  }

  showHomePage() {
    const spaceVideo = document.getElementById('space-video') as HTMLVideoElement | null;
    if (spaceVideo) {
      spaceVideo.classList.remove('hidden');
      try {
        spaceVideo.play();
      } catch (e) {
        console.warn('Space video playback failed:', e);
      }
    }

    document.getElementById('central-text')?.classList.remove('hidden');
    document.getElementById('central-text1')?.classList.remove('hidden');
    document.getElementById('overlay-title')?.classList.remove('hidden');
    document.getElementById('search-bar')?.classList.remove('hidden');
  }

  searchWeather() {
    this.searchMode = 'home';
    const cityInput = document.getElementById('city-input') as HTMLInputElement;
    const city = cityInput.value.trim();
    if (!city) {
      alert('Please enter a city name.');
      return;
    }
    this.fetchWeatherDataByCity(city);
  }

  fetchWeatherDataByCity(city: string) {
    this.weatherService.getWeather(city).subscribe({
      next: (data: any) => {
        // Parse JSON if it's returned as a string from backend
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        // Update weather information in popup
        const locationName = data.name || 'Unknown location';
        document.getElementById('location')!.innerText = locationName;
        document.getElementById('temperature')!.innerText = `Temperature: ${data.main.temp} °C`;
        document.getElementById('wind-speed')!.innerText = `Wind Speed: ${data.wind.speed} mph`;
        document.getElementById('humidity')!.innerText = `Humidity: ${data.main.humidity}%`;
        document.getElementById('cloud-cover')!.innerText = `Cloud Cover: ${data.clouds.all}%`;
        document.getElementById('rain')!.innerText = `Rain: ${
          data.rain ? data.rain['1h'] + ' in' : '0 in'
        }`;

        // Hide home page elements like map does
        document.getElementById('space-video')?.classList.add('hidden');
        document.getElementById('central-text')?.classList.add('hidden');
        document.getElementById('central-text1')?.classList.add('hidden');
        document.getElementById('overlay-title')?.classList.add('hidden');
        document.getElementById('search-bar')?.classList.add('hidden');

        document.getElementById('weather-popup')?.classList.remove('hidden');
        this.setWeatherBackground(data.weather[0].main.toLowerCase());
      },
      error: () => alert('City not found. Please try again.')
    });
  }

  searchWeatherFromPopup() {
    const cityInput = document.getElementById('popup-city-input') as HTMLInputElement;
    const city = cityInput.value.trim();
    if (!city) {
      alert('Please enter a city name.');
      return;
    }
    this.fetchWeatherDataByCity(city);
  }

  loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?AIzaSyBEYc0pF8doUaqqaksgFw1W20f-3YyK8bw&callback=initMap`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => {
      // Google Maps will call this when loaded
      this.initMap();
    };
    document.head.appendChild(script);
  }
}
