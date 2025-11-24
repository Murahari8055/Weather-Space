import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PostService, CreatePostRequest } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class PostFormComponent {
  postForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService
  ) {
    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]],
      location: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.postForm.valid && this.authService.isAuthenticated()) {
      this.isSubmitting = true;
      const formValue = this.postForm.value;

      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const postData: CreatePostRequest = {
              content: formValue.content,
              media: this.selectedFile || undefined,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              weatherContext: this.getWeatherContext()
            };

            this.postService.createPost(postData).subscribe({
              next: (post) => {
                console.log('Post created:', post);
                this.postForm.reset();
                this.selectedFile = null;
                this.isSubmitting = false;
                alert('Post created successfully!');
                // TODO: Emit event to refresh post list or navigate
              },
              error: (error) => {
                console.error('Error creating post:', error);
                this.isSubmitting = false;
                alert('Failed to create post. Please try again.');
              }
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fallback to posting without location
            const postData: CreatePostRequest = {
              content: formValue.content,
              media: this.selectedFile || undefined
            };

            this.postService.createPost(postData).subscribe({
              next: (post) => {
                console.log('Post created:', post);
                this.postForm.reset();
                this.selectedFile = null;
                this.isSubmitting = false;
                alert('Post created successfully!');
              },
              error: (error) => {
                console.error('Error creating post:', error);
                this.isSubmitting = false;
                alert('Failed to create post. Please try again.');
              }
            });
          }
        );
      } else {
        // Geolocation not supported, post without location
        const postData: CreatePostRequest = {
          content: formValue.content,
          media: this.selectedFile || undefined
        };

        this.postService.createPost(postData).subscribe({
          next: (post) => {
            console.log('Post created:', post);
            this.postForm.reset();
            this.selectedFile = null;
            this.isSubmitting = false;
            alert('Post created successfully!');
          },
          error: (error) => {
            console.error('Error creating post:', error);
            this.isSubmitting = false;
            alert('Failed to create post. Please try again.');
          }
        });
      }
    }
  }

  private getWeatherContext(): string {
    // This is a simplified weather context - in a real app you'd fetch from weather API
    // For now, return a default or based on some logic
    return 'current';
  }
}
