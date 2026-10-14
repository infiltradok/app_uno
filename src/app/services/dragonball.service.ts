import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { DragonBallCharacter, CharacterListResponse } from '../interfaces/dragonball.interface';

@Injectable({
  providedIn: 'root'
})
export class DragonballService {
  private readonly baseUrl = 'https://dragonball-api.com/api';
  private readonly characterCache = new Map<number, DragonBallCharacter>();
  private allCharactersCache: DragonBallCharacter[] | null = null;

  // Signals for reactive state
  readonly allCharacters = signal<DragonBallCharacter[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly availableRaces = signal<string[]>([]);
  readonly availableGenders = signal<string[]>([]);
  readonly availableAffiliations = signal<string[]>([]);

  constructor(private http: HttpClient) {}

  getCharacters(limit = 58, page = 1) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CharacterListResponse>(`${this.baseUrl}/characters`, {
      params: { limit, page }
    }).pipe(
      tap(res => {
        if (res.items.length > 0) {
          this.allCharacters.set(res.items);
          this.extractFilterOptions(res.items);
        }
      }),
      catchError(err => {
        this.error.set('Failed to load characters');
        return of({ items: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 0, totalPages: 0, currentPage: 0 }, links: { first: '', previous: '', next: '', last: '' } });
      }),
      tap(() => this.loading.set(false))
    );
  }

  getCharacter(id: number) {
    if (this.characterCache.has(id)) {
      return of(this.characterCache.get(id)!);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DragonBallCharacter>(`${this.baseUrl}/characters/${id}`).pipe(
      tap(character => this.characterCache.set(id, character)),
      catchError(err => {
        this.error.set(`Failed to load character ${id}`);
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  private extractFilterOptions(characters: DragonBallCharacter[]): void {
    const races = [...new Set(characters.map(c => c.race))].sort();
    const genders = [...new Set(characters.map(c => c.gender))].sort();
    const affiliations = [...new Set(characters.map(c => c.affiliation))].sort();
    
    this.availableRaces.set(races);
    this.availableGenders.set(genders);
    this.availableAffiliations.set(affiliations);
  }

  getRaces(): string[] {
    return this.availableRaces();
  }

  getGenders(): string[] {
    return this.availableGenders();
  }

  getAffiliations(): string[] {
    return this.availableAffiliations();
  }

  searchCharacters(query: string, characters: DragonBallCharacter[]): DragonBallCharacter[] {
    if (!query.trim()) return characters;
    
    const lowerQuery = query.toLowerCase();
    return characters.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.race.toLowerCase().includes(lowerQuery) ||
      c.affiliation.toLowerCase().includes(lowerQuery)
    );
  }

  filterByRace(characters: DragonBallCharacter[], races: string[]): DragonBallCharacter[] {
    if (!races.length) return characters;
    return characters.filter(c => races.includes(c.race));
  }

  filterByGender(characters: DragonBallCharacter[], genders: string[]): DragonBallCharacter[] {
    if (!genders.length) return characters;
    return characters.filter(c => genders.includes(c.gender));
  }

  filterByAffiliation(characters: DragonBallCharacter[], affiliations: string[]): DragonBallCharacter[] {
    if (!affiliations.length) return characters;
    return characters.filter(c => affiliations.includes(c.affiliation));
  }

  clearCache(): void {
    this.characterCache.clear();
    this.allCharactersCache = null;
  }
}