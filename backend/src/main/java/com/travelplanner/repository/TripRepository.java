package com.travelplanner.repository;

import com.travelplanner.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    List<Trip> findByDestinationContainingIgnoreCase(String destination);
    
    @Query("SELECT t FROM Trip t WHERE t.startDate >= :startDate AND t.endDate <= :endDate")
    List<Trip> findTripsInDateRange(LocalDate startDate, LocalDate endDate);
    
    List<Trip> findByStartDateAfter(LocalDate date);
    
    List<Trip> findByEndDateBefore(LocalDate date);
}