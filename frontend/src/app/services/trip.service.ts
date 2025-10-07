import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) { }

  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.apiUrl);
  }

  getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/${id}`);
  }

  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(this.apiUrl, trip);
  }

  updateTrip(id: number, trip: Trip): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/${id}`, trip);
  }

  deleteTrip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchTrips(destination: string): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/search?destination=${destination}`);
  }

  getUpcomingTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/upcoming`);
  }
}