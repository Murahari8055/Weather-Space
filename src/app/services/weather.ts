import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = '/api/weather';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?city=${city}`);
  }

  getWeatherByLatLng(lat: number, lng: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/latlng?lat=${lat}&lng=${lng}`);
  }
}
