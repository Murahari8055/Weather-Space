package com.weatherspace.service;

import com.weatherspace.model.Post;
import com.weatherspace.model.User;
import com.weatherspace.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.enabled:true}")
    private boolean s3Enabled;

    private final String bucketName = "weather-space-media";

    public Post createPost(Post post, MultipartFile mediaFile) throws IOException {
        if (mediaFile != null && !mediaFile.isEmpty()) {
            if (s3Enabled) {
                String mediaUrl = uploadToS3(mediaFile);
                post.setMediaUrl(mediaUrl);
                post.setMediaType(mediaFile.getContentType().startsWith("image/") ? "photo" : "video");
            } else {
                // For local development, save file to uploads directory
                String fileName = System.currentTimeMillis() + "_" + mediaFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads", fileName);
                Files.createDirectories(uploadPath.getParent());
                Files.write(uploadPath, mediaFile.getBytes());
                post.setMediaUrl("http://localhost:8080/api/media/" + fileName);
                post.setMediaType(mediaFile.getContentType().startsWith("image/") ? "photo" : "video");
            }
        }
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Post> getPostsByLocation(Double latitude, Double longitude) {
        return postRepository.findPostsByLocation(latitude, longitude);
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public void likePost(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);
    }

    public void deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only delete your own posts");
        }
        // Delete media if exists
        if (post.getMediaUrl() != null) {
            if (s3Enabled && post.getMediaUrl().contains("s3.amazonaws.com")) {
                deleteFromS3(post.getMediaUrl());
            } else if (!s3Enabled && post.getMediaUrl().startsWith("http://localhost:8080/api/media/")) {
                deleteLocalFile(post.getMediaUrl());
            }
        }
        postRepository.delete(post);
    }

    private void deleteFromS3(String mediaUrl) {
        try {
            String key = mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1);
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key("posts/" + key));
        } catch (Exception e) {
            // Log error but don't fail deletion
            System.err.println("Error deleting from S3: " + e.getMessage());
        }
    }

    private void deleteLocalFile(String mediaUrl) {
        try {
            String fileName = mediaUrl.substring(mediaUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get("uploads", fileName);
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            // Log error but don't fail deletion
            System.err.println("Error deleting local file: " + e.getMessage());
        }
    }

    private String uploadToS3(MultipartFile file) throws IOException {
        String key = "posts/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .acl("public-read")
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }
}
