export interface PokedexFilters {
  searchQuery: string;
  selectedTypes: string[];
  selectedGeneration: number | null;
}

export interface PokedexState {
  pokemons: PokemonSummary[];
  loading: boolean;
  error: string | null;
  filters: PokedexFilters;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}