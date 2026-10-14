import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../../interfaces/pokemon.interface';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.css'
})
export class PokemonCardComponent {
  readonly pokemon = input.required<Pokemon>();
  readonly isFlipped = signal(false);

  readonly sprite = computed(() => 
    this.pokemon().sprites.other['official-artwork'].front_default ||
    this.pokemon().sprites.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.pokemon().id}.png`
  );

  readonly formattedId = computed(() => 
    `#${String(this.pokemon().id).padStart(3, '0')}`
  );

  readonly typeClasses = computed(() => 
    this.pokemon().types.map((t: { type: { name: string } }) => `type-${t.type.name}`)
  );

  toggleFlip(): void {
    this.isFlipped.update(v => !v);
  }

  formatStatName(name: string): string {
    return name
      .replace('-', ' ')
      .replace('special attack', 'Sp. Atk')
      .replace('special defense', 'Sp. Def')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  protected readonly Math = Math;
}