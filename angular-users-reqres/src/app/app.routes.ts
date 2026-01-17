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
    path: '**',
    redirectTo: 'users',
  },
];
