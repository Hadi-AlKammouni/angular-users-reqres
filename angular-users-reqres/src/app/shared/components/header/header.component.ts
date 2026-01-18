import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, Subject } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
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
  isFocused = signal(false);
  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce search input by 400ms and auto-search when user enters valid ID
    this.searchSubject.pipe(debounceTime(400)).subscribe((userId) => {
      this.performSearch(userId);
    });
  }

  /**
   * Handle search input changes with debounced instant search
   */
  onSearchInputChange(value: string): void {
    this.searchInput.set(value);
    this.searchError.set(null);
    this.foundUser.set(null);

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      this.isSearching.set(false);
      return;
    }

    // Validate numeric input
    if (!/^\d+$/.test(trimmedValue)) {
      this.searchError.set('Please enter a numeric user ID');
      this.isSearching.set(false);
      return;
    }

    // Trigger debounced search
    this.isSearching.set(true);
    this.searchSubject.next(trimmedValue);
  }

  /**
   * Perform the actual search after debounce
   */
  private performSearch(userId: string): void {
    this.apiService.getUserById(Number(userId)).subscribe({
      next: (response) => {
        this.isSearching.set(false);
        this.foundUser.set(response.data);
      },
      error: () => {
        this.isSearching.set(false);
        this.foundUser.set(null);
        this.searchError.set('User not found. Please verify the ID and try again.');
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
   * Clear search input and results
   */
  clearSearch(): void {
    this.searchInput.set('');
    this.searchError.set(null);
    this.isSearching.set(false);
    this.foundUser.set(null);
  }

  /**
   * Handle input focus event
   */
  onFocus(): void {
    this.isFocused.set(true);
  }

  /**
   * Handle input blur event
   */
  onBlur(): void {
    this.isFocused.set(false);
  }
}
