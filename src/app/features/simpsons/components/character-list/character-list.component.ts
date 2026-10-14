import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { SimpsonsCharacter } from '../../../../interfaces/simpsons.interface';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  templateUrl: './character-list.component.html',
  styleUrl: './character-list.component.css'
})
export class CharacterListComponent {
  readonly characters = input.required<SimpsonsCharacter[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly hasMore = input(false);

  readonly loadMore = output<void>();

  readonly trackById = (index: number, character: SimpsonsCharacter) => character.id;

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 100) {
      if (this.hasMore() && !this.loading()) {
        this.loadMore.emit();
      }
    }
  }
}