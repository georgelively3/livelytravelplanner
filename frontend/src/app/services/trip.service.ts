import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Trip {
  id?: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  destination?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'http://localhost:8080/api/trips';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateTrip(id: number, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${id}`, trip, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  searchTrips(destination: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/search?destination=${destination}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUpcomingTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/upcoming`, {
      headers: this.authService.getAuthHeaders()
    });
  }
}