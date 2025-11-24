package com.weatherspace.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "posts")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String content;

    private String mediaUrl; // URL to media file on S3

    private String mediaType; // photo or video

    private Double latitude;

    private Double longitude;

    private String weatherContext; // e.g., "rainy", "sunny"

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Comment> comments;

    private int likeCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
