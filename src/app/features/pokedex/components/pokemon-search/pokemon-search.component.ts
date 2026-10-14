import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-search.component.html',
  styleUrl: './pokemon-search.component.css'
})
export class PokemonSearchComponent {
  readonly placeholder = input('Search by name or ID...');
  readonly debounceTime = input(300);

  readonly searchQuery = signal('');
  readonly searchChange = output<string>();
  readonly clearSearch = output<void>();

  readonly debouncedQuery = computed(() => this.searchQuery());
  readonly hasQuery = computed(() => this.searchQuery().length > 0);

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchChange.emit(value);
  }

  onClear(): void {
    this.searchQuery.set('');
    this.clearSearch.emit();
  }
}