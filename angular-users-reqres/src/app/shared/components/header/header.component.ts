import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { signal } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);

  searchInput = signal('');
  isSearching = signal(false);
  searchError = signal<string | null>(null);
  foundUser = signal<User | null>(null);
  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce search input by 300ms and auto-search when user enters valid ID
    this.searchSubject.pipe(debounceTime(300)).subscribe((userId) => {
      this.performSearch(userId);
    });
  }

  /**
   * Handle search input changes - debounced instant search
   * Automatically searches when user enters a valid numeric ID
   */
  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchError.set(null);
    this.foundUser.set(null);

    const trimmedValue = value.trim();

    // Clear search if input is empty
    if (!trimmedValue) {
      this.isSearching.set(false);
      return;
    }

    // Validate and search if numeric
    if (!/^\d+$/.test(trimmedValue)) {
      this.searchError.set('Please enter numeric user ID only');
      this.isSearching.set(false);
      return;
    }

    // Trigger debounced search
    this.isSearching.set(true);
    this.searchSubject.next(trimmedValue);
  }

  /**
   * Perform the actual search after debounce
   * Stores the found user but does NOT auto-navigate
   */
  private performSearch(userId: string): void {
    // Attempt to fetch user from API
    this.apiService.getUserById(Number(userId)).subscribe({
      next: (response) => {
        this.isSearching.set(false);
        // Store the found user for manual navigation
        this.foundUser.set(response.data);
      },
      error: () => {
        this.isSearching.set(false);
        this.foundUser.set(null);
        this.searchError.set('User not found. Please check the ID and try again.');
      },
    });
  }

  /**
   * Navigate to the found user's details page
   */
  navigateToUser(): void {
    if (this.foundUser()) {
      this.router.navigate(['/user', this.foundUser()?.id]);
      this.clearSearch();
    }
  }

  /**
   * Clear search input, error, and found user
   */
  clearSearch(): void {
    this.searchInput.set('');
    this.searchError.set(null);
    this.isSearching.set(false);
    this.foundUser.set(null);
  }
}
