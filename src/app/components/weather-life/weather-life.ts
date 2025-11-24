import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather';
import { AuthService } from '../../services/auth.service';
import { PostService, Post } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { LocationService, LocationData } from '../../services/location.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-weather-life',
  standalone: true,
  templateUrl: './weather-life.html',
  styleUrls: ['./weather-life.css'],
  imports: [CommonModule, FormsModule]
})
export class WeatherLifeComponent implements OnInit, OnDestroy {
  title = 'Weather Life';
  posts: Post[] = [];
  currentWeather = 'Loading...';
  newComment = '';
  hasMorePosts = false;
  userLocation = '';
  private locationSubscription: Subscription = new Subscription();

  constructor(
    private weatherService: WeatherService,
    public authService: AuthService,
    private postService: PostService,
    private commentService: CommentService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Set default background video immediately
    this.setDefaultBackground();

    // Subscribe to location service for weather updates
    this.locationSubscription = this.locationService.getCurrentLocation().subscribe({
      next: (location) => {
        if (location) {
          this.fetchWeatherData(location.latitude, location.longitude);
        }
      },
      error: (error) => {
        console.error('Location service error:', error);
      }
    });

    if (this.authService.isAuthenticated()) {
      this.loadPosts();
    }
  }

  ngOnDestroy(): void {
    this.locationSubscription.unsubscribe();
  }

  loadPosts(): void {
    // Use shared location service for posts
    const location = this.locationService.getCurrentLocationValue();
    if (location) {
      // In future, can filter posts by location
      console.log('Loading posts with location:', location);
    }

    // For now, load all posts
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.hasMorePosts = posts.length >= 10; // Assuming page size of 10
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    });
  }

  navigateToCreatePost(): void {
    this.router.navigate(['/create-post']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
  }

  navigateToPosts(): void {
    this.router.navigate(['/posts']);
  }

  toggleLike(post: Post): void {
    // Implement like functionality
    console.log('Toggle like for post:', post.id);
  }

  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
    if (post.showComments && !post.comments) {
      // Load comments if not already loaded
      this.commentService.getCommentsByPostId(post.id).subscribe({
        next: (comments: any) => {
          post.comments = comments;
        },
        error: (error: any) => {
          console.error('Error loading comments:', error);
        }
      });
    }
  }

  addComment(post: Post): void {
    if (this.newComment.trim()) {
      this.commentService.createComment(post.id, this.newComment).subscribe({
        next: (comment: any) => {
          if (!post.comments) post.comments = [];
          post.comments.push(comment);
          this.newComment = '';
        },
        error: (error: any) => {
          console.error('Error adding comment:', error);
        }
      });
    }
  }

  sharePost(post: Post): void {
    if (navigator.share) {
      navigator.share({
        title: 'Weather Space Post',
        text: post.content,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.content} - ${window.location.href}`);
      alert('Post link copied to clipboard!');
    }
  }

  loadMorePosts(): void {
    // Implement pagination
    console.log('Load more posts');
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }



  fetchWeatherData(lat: number, lng: number): void {
    const apiKey = 'YOUR_OPENWEATHER_API_KEY_HERE'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.setWeatherBackground(data.weather[0].main.toLowerCase());
      })
      .catch(() => {
        this.setDefaultBackground();
      });
  }

  setWeatherBackground(weatherMain: string): void {
    const backgroundVideo = document.getElementById('weather-life-background-video') as HTMLVideoElement;
    if (!backgroundVideo) return;

    let videoSrc = '';
    switch (weatherMain) {
      case 'rain':
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264441/Weather/rain.mp4';
        break;
      case 'clear':
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264455/Weather/clear.mp4';
        break;
      case 'clouds':
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264460/Weather/cloud.mp4';
        break;
      case 'thunderstorm':
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264313/Weather/thunderstorm.mp4';
        break;
      case 'snow':
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264476/Weather/snow.mp4';
        break;
      default:
        videoSrc = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264437/Weather/default.mp4';
    }

    backgroundVideo.src = videoSrc;
    backgroundVideo.classList.remove('hidden');
    // Explicit play call to ensure video playback
    try {
      backgroundVideo.play();
    } catch (e) {
      console.warn('Weather life background video playback failed:', e);
    }
  }

  setDefaultBackground(): void {
    const backgroundVideo = document.getElementById('weather-life-background-video') as HTMLVideoElement;
    if (backgroundVideo) {
      backgroundVideo.src = 'https://res.cloudinary.com/daa3yhyvy/video/upload/v1725264437/Weather/default.mp4';
      backgroundVideo.classList.remove('hidden');
      // Explicit play call to ensure default video playback
      try {
        backgroundVideo.play();
      } catch (e) {
        console.warn('Weather life default background video playback failed:', e);
      }
    }
  }
}
