import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommentService, Comment } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  imports: [CommonModule, ReactiveFormsModule, DatePipe]
})
export class CommentComponent implements OnInit {
  @Input() postId!: number;
  comments: Comment[] = [];
  commentForm: FormGroup;
  loading = false;

  constructor(
    private commentService: CommentService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.loading = true;
    this.commentService.getCommentsByPostId(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.commentForm.valid && this.authService.isAuthenticated()) {
      const content = this.commentForm.value.content;
      this.commentService.createComment(this.postId, content).subscribe({
        next: (comment) => {
          this.comments.push(comment);
          this.commentForm.reset();
        },
        error: (error) => {
          console.error('Error creating comment:', error);
        }
      });
    }
  }

  deleteComment(commentId: number) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? currentUser.id === comment.user.id : false;
  }
}
