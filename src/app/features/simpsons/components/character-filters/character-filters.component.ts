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
  readonly availableGenders = input.required<string[]>();
  readonly availableStatuses = input.required<string[]>();

  readonly selectedGenders = signal<string[]>([]);
  readonly selectedStatuses = signal<string[]>([]);
  readonly showFilters = signal(false);

  readonly gendersChange = output<string[]>();
  readonly statusesChange = output<string[]>();
  readonly toggleFilters = output<boolean>();

  readonly hasActiveFilters = computed(() => 
    this.selectedGenders().length > 0 || 
    this.selectedStatuses().length > 0
  );
  readonly activeCount = computed(() => 
    this.selectedGenders().length + 
    this.selectedStatuses().length
  );

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

  onStatusChange(status: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedStatuses();
    
    if (checked) {
      this.selectedStatuses.set([...current, status]);
    } else {
      this.selectedStatuses.set(current.filter(s => s !== status));
    }
    this.statusesChange.emit(this.selectedStatuses());
  }

  onClearAll(): void {
    this.selectedGenders.set([]);
    this.selectedStatuses.set([]);
    this.gendersChange.emit([]);
    this.statusesChange.emit([]);
  }

  onToggleFilters(): void {
    this.showFilters.update(v => !v);
    this.toggleFilters.emit(!this.showFilters());
  }

  isGenderSelected(gender: string): boolean {
    return this.selectedGenders().includes(gender);
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses().includes(status);
  }
}