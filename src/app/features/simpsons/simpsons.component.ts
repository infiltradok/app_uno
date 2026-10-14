import { Component, signal, computed, effect, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SimpsonsService } from '../../services/simpsons.service';
import { SimpsonsCharacter } from '../../interfaces/simpsons.interface';
import { SimpsonsFilters } from './interfaces/simpsons-filters.interface';
import { CharacterSearchComponent } from './components/character-search/character-search.component';
import { CharacterFiltersComponent } from './components/character-filters/character-filters.component';
import { CharacterListComponent } from './components/character-list/character-list.component';

@Component({
  selector: 'app-simpsons',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CharacterSearchComponent,
    CharacterFiltersComponent,
    CharacterListComponent
  ],
  templateUrl: './simpsons.component.html',
  styleUrl: './simpsons.component.css'
})
export class SimpsonsComponent implements OnInit, OnDestroy {
  private readonly simpsonsService = inject(SimpsonsService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();
  private readonly pageSize = 20;

  // State signals
  readonly allCharacters = signal<SimpsonsCharacter[]>([]);
  readonly displayedCharacters = signal<SimpsonsCharacter[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMore = signal(true);
  readonly currentPage = signal(1);

  // Filter signals
  readonly searchQuery = signal('');
  readonly selectedGenders = signal<string[]>([]);
  readonly selectedStatuses = signal<string[]>([]);

  // Computed
  readonly filteredCharacters = computed(() => {
    let result = this.allCharacters();

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter((c: SimpsonsCharacter) => 
        c.name.toLowerCase().includes(query) || 
        c.occupation.toLowerCase().includes(query)
      );
    }

    // Apply gender filter
    const genders = this.selectedGenders();
    if (genders.length > 0) {
      result = result.filter((c: SimpsonsCharacter) => genders.includes(c.gender));
    }

    // Apply status filter
    const statuses = this.selectedStatuses();
    if (statuses.length > 0) {
      result = result.filter((c: SimpsonsCharacter) => statuses.includes(c.status));
    }

    return result;
  });

  readonly availableGenders = computed(() => this.simpsonsService.getGenders());
  readonly availableStatuses = computed(() => this.simpsonsService.getStatuses());

  // Stats
  readonly totalCount = computed(() => this.filteredCharacters().length);
  readonly displayedCount = computed(() => this.displayedCharacters().length);

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
    this.loadCharactersPage(1);
  }

  private loadCharactersPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.simpsonsService.getCharacters(page).subscribe({
      next: (response: { results: SimpsonsCharacter[] }) => {
        if (response.results.length > 0) {
          this.updateDisplayedCharacters();
        }
        this.currentPage.set(page);
        this.hasMore.set(page < 60); // API has 60 pages total
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load characters. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private updateDisplayedCharacters(): void {
    const filtered = this.filteredCharacters();
    const currentDisplayed = this.displayedCharacters().length;
    const nextBatch = filtered.slice(currentDisplayed, currentDisplayed + this.pageSize);
    
    if (nextBatch.length > 0) {
      this.displayedCharacters.update(current => [...current, ...nextBatch]);
    }
  }

  private resetPagination(): void {
    this.displayedCharacters.set([]);
    this.updateDisplayedCharacters();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onClearSearch(): void {
    this.searchSubject.next('');
  }

  onGendersChange(genders: string[]): void {
    this.selectedGenders.set(genders);
    this.resetPagination();
  }

  onStatusesChange(statuses: string[]): void {
    this.selectedStatuses.set(statuses);
    this.resetPagination();
  }

  onLoadMore(): void {
    if (!this.loading() && this.hasMore()) {
      this.loadCharactersPage(this.currentPage() + 1);
    }
  }
}