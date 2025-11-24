package com.weatherspace.controller;

import com.weatherspace.model.Post;
import com.weatherspace.model.User;
import com.weatherspace.service.PostService;
import com.weatherspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "https://weatherspace1.netlify.app")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "media", required = false) MultipartFile mediaFile,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "weatherContext", required = false) String weatherContext,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Post post = new Post();
            post.setContent(content);
            post.setLatitude(latitude);
            post.setLongitude(longitude);
            post.setWeatherContext(weatherContext);
            post.setUser(user);
            Post savedPost = postService.createPost(post, mediaFile);
            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Post>> getPosts(
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude) {
        List<Post> posts = (latitude != null && longitude != null) ?
            postService.getPostsByLocation(latitude, longitude) :
            postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        try {
            postService.likePost(postId);
            return ResponseEntity.ok(Map.of("message", "Post liked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, Authentication authentication) {
        try {
            postService.deletePost(postId, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
