package com.weatherspace.service;

import com.weatherspace.model.Comment;
import com.weatherspace.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
