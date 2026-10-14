import { SimpsonsCharacter } from '../../../interfaces/simpsons.interface';

export interface SimpsonsFilters {
  searchQuery: string;
  selectedGenders: string[];
  selectedStatuses: string[];
}

export interface SimpsonsState {
  characters: SimpsonsCharacter[];
  loading: boolean;
  error: string | null;
  filters: SimpsonsFilters;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}