package com.travelplanner.repository;

import com.travelplanner.model.UserPersona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPersonaRepository extends JpaRepository<UserPersona, Long> {
    List<UserPersona> findByUserIdOrderByUpdatedAtDesc(Long userId);
    
    @Query("SELECT up FROM UserPersona up WHERE up.user.id = :userId AND up.id = :id")
    UserPersona findByUserIdAndId(@Param("userId") Long userId, @Param("id") Long id);
}