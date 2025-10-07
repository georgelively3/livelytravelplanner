package com.travelplanner.repository;

import com.travelplanner.entity.TravelerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelerProfileRepository extends JpaRepository<TravelerProfile, Long> {
}