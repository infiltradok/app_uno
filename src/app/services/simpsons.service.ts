import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { SimpsonsCharacter, CharacterListResponse } from '../interfaces/simpsons.interface';

@Injectable({
  providedIn: 'root'
})
export class SimpsonsService {
  private readonly baseUrl = 'https://thesimpsonsapi.com/api';
  private readonly imageCdn = 'https://cdn.thesimpsonsapi.com/500';
  private readonly characterCache = new Map<number, SimpsonsCharacter>();
  private allCharactersCache: SimpsonsCharacter[] = [];

  // Signals for reactive state
  readonly allCharacters = signal<SimpsonsCharacter[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getCharacters(page = 1) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<CharacterListResponse>(`${this.baseUrl}/characters`, {
      params: { page }
    }).pipe(
      tap(res => {
        if (res.results.length > 0) {
          const newCharacters = res.results.filter(c => 
            !this.allCharactersCache.some(existing => existing.id === c.id)
          );
          this.allCharactersCache = [...this.allCharactersCache, ...newCharacters];
          this.allCharacters.set(this.allCharactersCache);
        }
      }),
      catchError(err => {
        this.error.set('Failed to load characters');
        return of({ count: 0, next: null, prev: null, pages: 0, results: [] });
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

    return this.http.get<SimpsonsCharacter>(`${this.baseUrl}/characters/${id}`).pipe(
      tap(character => this.characterCache.set(id, character)),
      catchError(err => {
        this.error.set(`Failed to load character ${id}`);
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  getImageUrl(portraitPath: string): string {
    if (portraitPath.startsWith('http')) return portraitPath;
    return `${this.imageCdn}${portraitPath}`;
  }

  searchCharacters(query: string, characters: SimpsonsCharacter[]): SimpsonsCharacter[] {
    if (!query.trim()) return characters;
    
    const lowerQuery = query.toLowerCase();
    return characters.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.occupation.toLowerCase().includes(lowerQuery)
    );
  }

  filterByGender(characters: SimpsonsCharacter[], genders: string[]): SimpsonsCharacter[] {
    if (!genders.length) return characters;
    return characters.filter(c => genders.includes(c.gender));
  }

  filterByStatus(characters: SimpsonsCharacter[], statuses: string[]): SimpsonsCharacter[] {
    if (!statuses.length) return characters;
    return characters.filter(c => statuses.includes(c.status));
  }

  getGenders(): string[] {
    return ['Male', 'Female'];
  }

  getStatuses(): string[] {
    return ['Alive', 'Deceased'];
  }

  clearCache(): void {
    this.characterCache.clear();
    this.allCharactersCache = [];
    this.allCharacters.set([]);
  }

  hasLoadedAll(): boolean {
    return this.allCharactersCache.length >= 1182;
  }

  getTotalCount(): number {
    return 1182;
  }
}