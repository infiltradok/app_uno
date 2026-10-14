import { Routes } from '@angular/router';
import { PokedexComponent } from './pokedex.component';

export const POKEDEX_ROUTES: Routes = [
  {
    path: '',
    component: PokedexComponent,
    title: 'Pokédex'
  }
];