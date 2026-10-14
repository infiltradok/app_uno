import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-character-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-filters.component.html',
  styleUrl: './character-filters.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class CharacterFiltersComponent {
  readonly availableRaces = input.required<string[]>();
  readonly availableGenders = input.required<string[]>();
  readonly availableAffiliations = input.required<string[]>();

  readonly selectedRaces = signal<string[]>([]);
  readonly selectedGenders = signal<string[]>([]);
  readonly selectedAffiliations = signal<string[]>([]);
  readonly showFilters = signal(false);

  readonly racesChange = output<string[]>();
  readonly gendersChange = output<string[]>();
  readonly affiliationsChange = output<string[]>();
  readonly toggleFilters = output<boolean>();

  readonly hasActiveFilters = computed(() => 
    this.selectedRaces().length > 0 || 
    this.selectedGenders().length > 0 || 
    this.selectedAffiliations().length > 0
  );
  readonly activeCount = computed(() => 
    this.selectedRaces().length + 
    this.selectedGenders().length + 
    this.selectedAffiliations().length
  );

  onRaceChange(race: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedRaces();
    
    if (checked) {
      this.selectedRaces.set([...current, race]);
    } else {
      this.selectedRaces.set(current.filter(r => r !== race));
    }
    this.racesChange.emit(this.selectedRaces());
  }

  onGenderChange(gender: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedGenders();
    
    if (checked) {
      this.selectedGenders.set([...current, gender]);
    } else {
      this.selectedGenders.set(current.filter(g => g !== gender));
    }
    this.gendersChange.emit(this.selectedGenders());
  }

  onAffiliationChange(affiliation: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedAffiliations();
    
    if (checked) {
      this.selectedAffiliations.set([...current, affiliation]);
    } else {
      this.selectedAffiliations.set(current.filter(a => a !== affiliation));
    }
    this.affiliationsChange.emit(this.selectedAffiliations());
  }

  onClearAll(): void {
    this.selectedRaces.set([]);
    this.selectedGenders.set([]);
    this.selectedAffiliations.set([]);
    this.racesChange.emit([]);
    this.gendersChange.emit([]);
    this.affiliationsChange.emit([]);
  }

  onToggleFilters(): void {
    this.showFilters.update(v => !v);
    this.toggleFilters.emit(!this.showFilters());
  }

  isRaceSelected(race: string): boolean {
    return this.selectedRaces().includes(race);
  }

  isGenderSelected(gender: string): boolean {
    return this.selectedGenders().includes(gender);
  }

  isAffiliationSelected(affiliation: string): boolean {
    return this.selectedAffiliations().includes(affiliation);
  }
}