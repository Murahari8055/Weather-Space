import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  public location$ = this.locationSubject.asObservable();

  private locationRequested = false;

  constructor() {}

  getCurrentLocation(): Observable<LocationData | null> {
    if (!this.locationRequested) {
      this.requestLocation();
    }
    return this.location$;
  }

  private requestLocation(): void {
    this.locationRequested = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.locationSubject.next(locationData);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Keep location as null, default video will be used
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  getCurrentLocationValue(): LocationData | null {
    return this.locationSubject.value;
  }
}
