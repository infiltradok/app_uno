import { Routes } from '@angular/router';
import { SimpsonsComponent } from './simpsons.component';

export const SIMPSONS_ROUTES: Routes = [
  {
    path: '',
    component: SimpsonsComponent,
    title: 'The Simpsons Characters'
  }
];