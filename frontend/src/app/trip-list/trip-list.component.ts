import { Component, OnInit } from '@angular/core';
import { TripService, Trip } from '../services/trip.service';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent implements OnInit {
  trips: Trip[] = [];
  loading = true;
  error: string | null = null;
  newTrip: Trip = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    destination: ''
  };

  constructor(private tripService: TripService) { }

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getAllTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load trips';
        this.loading = false;
        console.error('Error loading trips:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.newTrip.name && this.newTrip.startDate && this.newTrip.endDate) {
      this.tripService.createTrip(this.newTrip).subscribe({
        next: (trip) => {
          this.trips.push(trip);
          this.resetForm();
        },
        error: (error) => {
          this.error = 'Failed to create trip';
          console.error('Error creating trip:', error);
        }
      });
    }
  }

  deleteTrip(id: number): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          this.trips = this.trips.filter(trip => trip.id !== id);
        },
        error: (error) => {
          this.error = 'Failed to delete trip';
          console.error('Error deleting trip:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.newTrip = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      destination: ''
    };
  }
}