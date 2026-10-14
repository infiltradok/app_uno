import { Component, signal, computed, effect, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon, PokemonListItem } from '../../interfaces/pokemon.interface';
import { PokedexFilters, PokedexState } from './interfaces/pokedex-filters.interface';
import { PokemonSearchComponent } from './components/pokemon-search/pokemon-search.component';
import { PokemonFiltersComponent } from './components/pokemon-filters/pokemon-filters.component';
import { PokemonListComponent } from './components/pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    PokemonSearchComponent,
    PokemonFiltersComponent,
    PokemonListComponent
  ],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.css'
})
export class PokedexComponent implements OnInit, OnDestroy {
  private readonly pokemonService = inject(PokemonService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly pageSize = 20;

  // State signals
  readonly allPokemons = signal<Pokemon[]>([]);
  readonly displayedPokemons = signal<Pokemon[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal(true);
  readonly offset = signal(0);

  // Filter signals
  readonly searchQuery = signal('');
  readonly selectedTypes = signal<string[]>([]);

  // Computed
  readonly filteredPokemons = computed(() => {
    let result = this.allPokemons();

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter((p: Pokemon) => 
        p.name.toLowerCase().includes(query) || 
        String(p.id).includes(query)
      );
    }

    // Apply type filter
    const types = this.selectedTypes();
    if (types.length > 0) {
      result = result.filter((p: Pokemon) => 
        types.some(t => p.types.some((pt: { type: { name: string } }) => pt.type.name === t))
      );
    }

    return result;
  });

  readonly availableTypes = computed(() => this.pokemonService.allTypes());

  // Stats
  readonly totalCount = computed(() => this.filteredPokemons().length);
  readonly displayedCount = computed(() => this.displayedPokemons().length);

  constructor() {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.resetPagination();
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.loadPokemonBatch(0, this.pageSize);
  }

  private async loadPokemonBatch(startOffset: number, limit: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const listResponse = await this.pokemonService.getPokemonList(limit, startOffset).toPromise();
      
      if (!listResponse || !listResponse.results.length) {
        this.hasMore.set(false);
        this.loading.set(false);
        return;
      }

      const pokemonDetails = await this.fetchPokemonDetails(listResponse.results);
      
      const current = this.allPokemons();
      this.allPokemons.set([...current, ...pokemonDetails]);
      this.updateDisplayedPokemons();
      this.offset.update(v => v + limit);
      this.hasMore.set(listResponse.results.length === limit);
      
    } catch (err) {
      this.error.set('Failed to load Pokémon. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchPokemonDetails(items: PokemonListItem[]): Promise<Pokemon[]> {
    const batchSize = 5;
    const results: Pokemon[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const promises = batch.map((item: PokemonListItem) => 
        this.pokemonService.getPokemon(this.pokemonService.getIdFromUrl(item.url)).toPromise()
      );
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter((p): p is Pokemon => p !== null));
    }

    return results.sort((a, b) => a.id - b.id);
  }

  private updateDisplayedPokemons(): void {
    const filtered = this.filteredPokemons();
    const currentDisplayed = this.displayedPokemons().length;
    const nextBatch = filtered.slice(currentDisplayed, currentDisplayed + this.pageSize);
    
    if (nextBatch.length > 0) {
      this.displayedPokemons.update(current => [...current, ...nextBatch]);
    }
  }

  private resetPagination(): void {
    this.displayedPokemons.set([]);
    this.updateDisplayedPokemons();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onClearSearch(): void {
    this.searchSubject.next('');
  }

  onTypesChange(types: string[]): void {
    this.selectedTypes.set(types);
    this.resetPagination();
  }

  onLoadMore(): void {
    if (!this.loading() && this.hasMore()) {
      this.loadPokemonBatch(this.offset(), this.pageSize);
    }
  }

  onPokemonClick(pokemon: Pokemon): void {
    console.log('Pokemon clicked:', pokemon.name);
  }
}