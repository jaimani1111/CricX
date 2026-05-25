import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserLocation {
  latitude: number;
  longitude: number;
  locationName?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private _location = signal<UserLocation | null>(null);
  location = this._location.asReadonly();

  private _loading = signal(false);
  loading = this._loading.asReadonly();

  constructor(private http: HttpClient) {
    this.getCurrentLocation();
  }

  getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve) => {
      this._loading.set(true);

      if (!navigator.geolocation) {
        this._loading.set(false);
        const defaultLoc: UserLocation = { latitude: 19.076, longitude: 72.8777, locationName: 'Mumbai' };
        this._location.set(defaultLoc);
        resolve(defaultLoc);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          // Reverse geocode to get city name
          this.reverseGeocode(loc.latitude, loc.longitude).then(name => {
            loc.locationName = name;
            this._location.set(loc);
            this._loading.set(false);
            resolve(loc);
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          this._loading.set(false);
          const defaultLoc: UserLocation = { latitude: 19.076, longitude: 72.8777, locationName: 'Mumbai' };
          this._location.set(defaultLoc);
          resolve(defaultLoc);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  async setManualLocation(locationName: string): Promise<UserLocation> {
    this._loading.set(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
      const res: any = await this.http.get(url, { headers: { 'Accept-Language': 'en' } }).toPromise();
      if (res && res.length > 0) {
        const loc: UserLocation = {
          latitude: parseFloat(res[0].lat),
          longitude: parseFloat(res[0].lon),
          locationName: res[0].display_name.split(',')[0] // Use first part of display name
        };
        this._location.set(loc);
        this._loading.set(false);
        return loc;
      }
      throw new Error('Location not found');
    } catch (e) {
      this._loading.set(false);
      throw e;
    }
  }

  async getSuggestions(query: string): Promise<UserLocation[]> {
    if (!query || query.trim().length < 3) return [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const res: any = await this.http.get(url, { headers: { 'Accept-Language': 'en' } }).toPromise();
      if (res && res.length > 0) {
        return res.map((item: any) => {
          const parts = item.display_name.split(',');
          const name = parts.slice(0, 2).map((p: any) => p.trim()).join(', ');
          return {
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            locationName: name
          };
        });
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch location suggestions:', e);
      return [];
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const res: any = await this.http.get(url, {
        headers: { 'Accept-Language': 'en' }
      }).toPromise();
      const addr = res?.address;
      return addr?.city || addr?.town || addr?.village || addr?.county || addr?.state || 'Your Area';
    } catch {
      return 'Your Area';
    }
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
