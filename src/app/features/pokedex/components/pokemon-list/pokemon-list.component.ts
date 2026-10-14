import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { Pokemon } from '../../../../interfaces/pokemon.interface';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.css'
})
export class PokemonListComponent {
  readonly pokemons = input.required<Pokemon[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly hasMore = input(false);

  readonly loadMore = output<void>();
  readonly pokemonClick = output<Pokemon>();

  readonly trackById = (index: number, pokemon: Pokemon) => pokemon.id;

  onPokemonClick(pokemon: Pokemon): void {
    this.pokemonClick.emit(pokemon);
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 100) {
      if (this.hasMore() && !this.loading()) {
        this.loadMore.emit();
      }
    }
  }
}