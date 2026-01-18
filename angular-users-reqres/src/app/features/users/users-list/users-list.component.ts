import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { MatIcon } from '@angular/material/icon';

/**
 * Users list component with paginated user cards
 * Uses signals for reactive state management
 */
@Component({
  selector: 'app-users-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // Signal-based state
  users = signal<User[]>([]);
  currentPage = signal(1);
  totalPages = signal(0);
  totalUsers = signal(0);
  perPage = signal(6); // users per page
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed signal for pagination display
  pageIndex = computed(() => this.currentPage() - 1); // Material paginator uses 0-based index

  ngOnInit(): void {
    this.loadUsers(this.currentPage());
  }

  /**
   * Load users for a specific page
   * @param page - Page number (1-based)
   */
  loadUsers(page: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getUsers(page).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.currentPage.set(response.page);
        this.totalPages.set(response.total_pages);
        this.totalUsers.set(response.total);
        this.perPage.set(response.per_page);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading users:', err);
      },
    });
  }

  /**
   * Handle page change event from Material paginator
   * @param event - Page event from Material paginator
   */
  onPageChange(event: PageEvent): void {
    const newPage = event.pageIndex + 1; // Convert 0-based to 1-based
    this.loadUsers(newPage);
  }

  /**
   * Navigate to user details page
   * @param userId - User ID to view
   */
  viewUserDetails(userId: number): void {
    this.router.navigate(['/user', userId]);
  }

  /**
   * Get full name for a user
   * @param user - User object
   * @returns Full name string
   */
  getFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
  }

  /**
   * Retry loading users after an error
   */
  retryLoadUsers(): void {
    this.loadUsers(this.currentPage());
  }
}
