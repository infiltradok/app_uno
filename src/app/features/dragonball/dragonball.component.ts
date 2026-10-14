import { Component, signal, computed, effect, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DragonballService } from '../../services/dragonball.service';
import { DragonBallCharacter } from '../../interfaces/dragonball.interface';
import { DragonBallFilters } from './interfaces/dragonball-filters.interface';
import { CharacterSearchComponent } from './components/character-search/character-search.component';
import { CharacterFiltersComponent } from './components/character-filters/character-filters.component';
import { CharacterListComponent } from './components/character-list/character-list.component';

@Component({
  selector: 'app-dragonball',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CharacterSearchComponent,
    CharacterFiltersComponent,
    CharacterListComponent
  ],
  templateUrl: './dragonball.component.html',
  styleUrl: './dragonball.component.css'
})
export class DragonballComponent implements OnInit, OnDestroy {
  private readonly dragonballService = inject(DragonballService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // State signals
  readonly allCharacters = signal<DragonBallCharacter[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter signals
  readonly searchQuery = signal('');
  readonly selectedRaces = signal<string[]>([]);
  readonly selectedGenders = signal<string[]>([]);
  readonly selectedAffiliations = signal<string[]>([]);

  // Computed
  readonly filteredCharacters = computed(() => {
    let result = this.allCharacters();

    // Apply search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter((c: DragonBallCharacter) => 
        c.name.toLowerCase().includes(query) || 
        c.race.toLowerCase().includes(query) ||
        c.affiliation.toLowerCase().includes(query)
      );
    }

    // Apply race filter
    const races = this.selectedRaces();
    if (races.length > 0) {
      result = result.filter((c: DragonBallCharacter) => races.includes(c.race));
    }

    // Apply gender filter
    const genders = this.selectedGenders();
    if (genders.length > 0) {
      result = result.filter((c: DragonBallCharacter) => genders.includes(c.gender));
    }

    // Apply affiliation filter
    const affiliations = this.selectedAffiliations();
    if (affiliations.length > 0) {
      result = result.filter((c: DragonBallCharacter) => affiliations.includes(c.affiliation));
    }

    return result;
  });

  readonly availableRaces = computed(() => this.dragonballService.getRaces());
  readonly availableGenders = computed(() => this.dragonballService.getGenders());
  readonly availableAffiliations = computed(() => this.dragonballService.getAffiliations());

  // Stats
  readonly totalCount = computed(() => this.filteredCharacters().length);

  constructor() {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchQuery.set(query);
    });
  }

  ngOnInit(): void {
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCharacters(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dragonballService.getCharacters(58, 1).subscribe({
      next: (response: { items: DragonBallCharacter[] }) => {
        if (response.items.length > 0) {
          this.allCharacters.set(response.items);
        }
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load characters. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onClearSearch(): void {
    this.searchSubject.next('');
  }

  onRacesChange(races: string[]): void {
    this.selectedRaces.set(races);
  }

  onGendersChange(genders: string[]): void {
    this.selectedGenders.set(genders);
  }

  onAffiliationsChange(affiliations: string[]): void {
    this.selectedAffiliations.set(affiliations);
  }
}