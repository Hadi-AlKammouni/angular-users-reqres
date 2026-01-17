import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users-list/users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'user/:id',
    loadComponent: () =>
      import('./features/users/user-details/user-details.component').then(
        (m) => m.UserDetailsComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'users',
  },
];
