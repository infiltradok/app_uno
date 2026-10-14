import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { DragonBallCharacter } from '../../../../interfaces/dragonball.interface';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  templateUrl: './character-list.component.html',
  styleUrl: './character-list.component.css'
})
export class CharacterListComponent {
  readonly characters = input.required<DragonBallCharacter[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly trackById = (index: number, character: DragonBallCharacter) => character.id;
}