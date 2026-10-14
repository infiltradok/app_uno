import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';
import { Pokemon, PokemonListResponse, PokemonListItem, TypeResponse, TypeListItem } from '../interfaces/pokemon.interface';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly pokemonCache = new Map<string, Pokemon>();
  private readonly listCache = new Map<string, PokemonListResponse>();

  // Signals for reactive state
  readonly pokemonList = signal<Pokemon[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly allTypes = signal<string[]>([]);

  constructor(private http: HttpClient) {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.http.get<TypeResponse>(`${this.baseUrl}/type`)
      .pipe(
        map(res => res.results.map(t => t.name).filter(n => n !== 'unknown' && n !== 'shadow')),
        catchError(() => of([]))
      )
      .subscribe(types => this.allTypes.set(types));
  }

  getPokemonList(limit = 20, offset = 0) {
    const cacheKey = `list_${limit}_${offset}`;
    
    if (this.listCache.has(cacheKey)) {
      return of(this.listCache.get(cacheKey)!);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon`, {
      params: { limit, offset }
    }).pipe(
      tap(res => this.listCache.set(cacheKey, res)),
      catchError(err => {
        this.error.set('Failed to load Pokémon list');
        return of({ count: 0, next: null, previous: null, results: [] });
      }),
      tap(() => this.loading.set(false))
    );
  }

  getPokemon(nameOrId: string | number) {
    const key = String(nameOrId).toLowerCase();
    
    if (this.pokemonCache.has(key)) {
      return of(this.pokemonCache.get(key)!);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${key}`).pipe(
      tap(pokemon => this.pokemonCache.set(key, pokemon)),
      catchError(err => {
        this.error.set(`Failed to load Pokémon ${key}`);
        return of(null);
      }),
      tap(() => this.loading.set(false))
    );
  }

  getPokemonDetail(id: number) {
    return this.getPokemon(id);
  }

  searchPokemon(query: string, allPokemons: Pokemon[]): Pokemon[] {
    if (!query.trim()) return allPokemons;
    
    const lowerQuery = query.toLowerCase();
    return allPokemons.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      String(p.id).includes(lowerQuery)
    );
  }

  filterByType(pokemons: Pokemon[], types: string[]): Pokemon[] {
    if (!types.length) return pokemons;
    return pokemons.filter(p => 
      types.some(t => p.types.some(pt => pt.type.name === t))
    );
  }

  getTypes(): string[] {
    return this.allTypes();
  }

  // Convert list item to ID
  getIdFromUrl(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Transform list item to summary for display
  toSummary(item: PokemonListItem): { id: number; name: string; url: string } {
    return {
      id: this.getIdFromUrl(item.url),
      name: item.name,
      url: item.url
    };
  }

  clearCache(): void {
    this.pokemonCache.clear();
    this.listCache.clear();
  }
}