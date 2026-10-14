import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-pokemon-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-filters.component.html',
  styleUrl: './pokemon-filters.component.css',
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
export class PokemonFiltersComponent {
  readonly availableTypes = input.required<string[]>();
  readonly selectedTypes = signal<string[]>([]);
  readonly showFilters = signal(false);

  readonly typesChange = output<string[]>();
  readonly toggleFilters = output<boolean>();

  readonly hasActiveFilters = computed(() => this.selectedTypes().length > 0);
  readonly activeCount = computed(() => this.selectedTypes().length);

  onTypeChange(type: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.selectedTypes();
    
    if (checked) {
      this.selectedTypes.set([...current, type]);
    } else {
      this.selectedTypes.set(current.filter(t => t !== type));
    }
    this.typesChange.emit(this.selectedTypes());
  }

  onClearAll(): void {
    this.selectedTypes.set([]);
    this.typesChange.emit([]);
  }

  onToggleFilters(): void {
    this.showFilters.update(v => !v);
    this.toggleFilters.emit(!this.showFilters());
  }

  isSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }
}