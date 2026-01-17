import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

/**
 * User details component
 * Displays detailed information about a single user
 * Fetches data from route params and API
 */
@Component({
  selector: 'app-user-details',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signal-based state
  user = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  userId = signal<number | null>(null);

  ngOnInit(): void {
    // Get user ID from route params
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.userId.set(id);
        this.loadUser(id);
      }
    });
  }

  /**
   * Load user details by ID
   * @param userId - User ID to fetch
   */
  loadUser(userId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getUserById(userId).subscribe({
      next: (response) => {
        this.user.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load user details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading user:', err);
      },
    });
  }

  /**
   * Navigate back to users list
   */
  goBack(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Retry loading user after an error
   */
  retryLoadUser(): void {
    const id = this.userId();
    if (id) {
      this.loadUser(id);
    }
  }

  /**
   * Get full name for the user
   * @returns Full name string
   */
  getFullName(): string {
    const u = this.user();
    if (!u) {
      return '';
    }
    return `${u.first_name} ${u.last_name}`;
  }
}
