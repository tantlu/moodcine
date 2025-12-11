export interface Movie {
  id: string; // We will generate a unique ID based on title
  title: string;
  year: number;
  reason: string;
  genre: string;
}

export interface SavedMovie extends Movie {
  savedAt: number;
}

export interface MovieDetails {
  synopsis: string;
  cast: string[];
  rating: string;
  director: string;
}