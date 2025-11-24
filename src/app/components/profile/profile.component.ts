import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule]
})
export class ProfileComponent implements OnInit {
  currentUser: any = {};
  selectedFile: File | null = null;
  isUploading: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = {
          username: user.username || '',
          email: user.email || '',
          profilePictureUrl: user.profilePictureUrl || null
        };
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post<{url: string}>('/api/media/upload-profile-picture', formData, { headers })
      .pipe(finalize(() => this.isUploading = false))
      .subscribe({
        next: (response) => {
          this.currentUser.profilePictureUrl = response.url;
        },
        error: (error) => {
          console.error('Error uploading profile picture:', error);
        }
      });
  }

  removeProfilePicture() {
    this.currentUser.profilePictureUrl = null;
    this.selectedFile = null;
  }

  triggerFileInputClick() {
    const input = document.getElementById('profilePictureInput') as HTMLElement;
    if (input) {
      input.click();
    }
  }
}
