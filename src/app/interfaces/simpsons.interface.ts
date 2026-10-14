export interface SimpsonsCharacter {
  id: number;
  age: number | null;
  birthdate: string | null;
  gender: 'Male' | 'Female';
  name: string;
  occupation: string;
  portrait_path: string;
  phrases: string[];
  status: 'Alive' | 'Deceased';
}

export interface CharacterListResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: SimpsonsCharacter[];
}