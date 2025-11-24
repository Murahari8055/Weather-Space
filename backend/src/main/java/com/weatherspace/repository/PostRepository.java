package com.weatherspace.repository;

import com.weatherspace.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT p FROM Post p WHERE " +
           "(:latitude IS NULL OR :longitude IS NULL OR " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(p.latitude)))) < 50) " +
           "ORDER BY p.createdAt DESC")
    List<Post> findPostsByLocation(@Param("latitude") Double latitude, @Param("longitude") Double longitude);

    List<Post> findAllByOrderByCreatedAtDesc();
}
