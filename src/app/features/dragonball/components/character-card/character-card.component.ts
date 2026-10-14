import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragonBallCharacter } from '../../../../interfaces/dragonball.interface';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.css'
})
export class CharacterCardComponent {
  readonly character = input.required<DragonBallCharacter>();

  readonly raceClass = computed(() => 
    `race-${this.character().race.toLowerCase().replace(/\s+/g, '-')}`
  );

  readonly affiliationClass = computed(() => 
    `affiliation-${this.character().affiliation.toLowerCase().replace(/\s+/g, '-')}`
  );

  formatKi(ki: string): string {
    return ki;
  }
}