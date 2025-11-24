import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [CommonModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  showUserMenu = false;
  profilePictureUrl: string = 'assets/default-avatar.png'; // default avatar path
  userSubscription: Subscription | undefined;

  constructor(public router: Router, public authService: AuthService) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.profilePictureUrl) {
        this.profilePictureUrl = user.profilePictureUrl;
      } else {
        this.profilePictureUrl = 'assets/default-avatar.png';
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  navigateToHome() {
    // Reset weather component to home page state
    const weatherComponent = document.querySelector('app-weather');
    if (weatherComponent) {
      // Hide any open popups or maps
      document.getElementById('weather-popup')?.classList.add('hidden');
      document.getElementById('background-video')?.classList.add('hidden');
      document.getElementById('map')?.classList.add('hidden');
      // Show home page elements
      document.getElementById('space-video')?.classList.remove('hidden');
      document.getElementById('central-text')?.classList.remove('hidden');
      document.getElementById('central-text1')?.classList.remove('hidden');
      document.getElementById('overlay-title')?.classList.remove('hidden');
      document.getElementById('search-bar')?.classList.remove('hidden');
    }
    this.router.navigate(['/']);
  }

  navigateToWeatherLife() {
    this.router.navigate(['/weather-life']);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  getCurrentUsername(): string {
    // Extract username from JWT token or from auth service
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || 'User';
      } catch (e) {
        return 'User';
      }
    }
    return 'User';
  }

  navigateToProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
