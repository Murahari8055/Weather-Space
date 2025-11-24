package com.weatherspace.controller;

import com.weatherspace.model.Comment;
import com.weatherspace.model.User;
import com.weatherspace.model.Post;
import com.weatherspace.service.CommentService;
import com.weatherspace.service.UserService;
import com.weatherspace.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "https://weatherspace1.netlify.app")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> createComment(
            @RequestBody Map<String, Object> commentRequest,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Post post = postService.getPostById(Long.valueOf(commentRequest.get("postId").toString()))
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            Comment comment = new Comment();
            comment.setContent(commentRequest.get("content").toString());
            comment.setUser(user);
            comment.setPost(post);
            Comment savedComment = commentService.createComment(comment);
            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok(Map.of("message", "Comment deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
