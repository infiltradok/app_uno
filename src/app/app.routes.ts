import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'pokedex',
    loadChildren: () => import('./features/pokedex/pokedex.routes').then(m => m.POKEDEX_ROUTES)
  },
  {
    path: 'dragonball',
    loadChildren: () => import('./features/dragonball/dragonball.routes').then(m => m.DRAGONBALL_ROUTES)
  },
  {
    path: 'simpsons',
    loadChildren: () => import('./features/simpsons/simpsons.routes').then(m => m.SIMPSONS_ROUTES)
  }
];