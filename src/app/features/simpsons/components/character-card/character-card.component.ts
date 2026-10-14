import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpsonsCharacter } from '../../../../interfaces/simpsons.interface';
import { SimpsonsService } from '../../../../services/simpsons.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.css'
})
export class CharacterCardComponent {
  readonly character = input.required<SimpsonsCharacter>();
  private readonly simpsonsService = inject(SimpsonsService);

  readonly imageUrl = computed(() => 
    this.simpsonsService.getImageUrl(this.character().portrait_path)
  );

  readonly statusClass = computed(() => 
    `status-${this.character().status.toLowerCase()}`
  );

  readonly genderClass = computed(() => 
    `gender-${this.character().gender.toLowerCase()}`
  );
}