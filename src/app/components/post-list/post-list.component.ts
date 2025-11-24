import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
  imports: [CommonModule, DatePipe, CommentComponent]
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  currentLocation = '';
  currentUser: any = null;

  constructor(private postService: PostService, private authService: AuthService) {}

  ngOnInit() {
    this.loadPosts();
    this.getCurrentLocation();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadPosts(location?: string) {
    this.loading = true;
    this.postService.getPosts(location).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Reverse geocode to get location name (simplified)
          this.currentLocation = `${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`;
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }

  filterByLocation() {
    this.loadPosts(this.currentLocation);
  }

  clearFilter() {
    this.loadPosts();
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  deletePost(postId: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.id !== postId);
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  canDeletePost(post: Post): boolean {
    return this.currentUser && this.currentUser.id === post.user.id;
  }
}
