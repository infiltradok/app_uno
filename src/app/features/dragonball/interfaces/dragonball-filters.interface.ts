import { DragonBallCharacter } from '../../../interfaces/dragonball.interface';

export interface DragonBallFilters {
  searchQuery: string;
  selectedRaces: string[];
  selectedGenders: string[];
  selectedAffiliations: string[];
}

export interface DragonBallState {
  characters: DragonBallCharacter[];
  loading: boolean;
  error: string | null;
  filters: DragonBallFilters;
}