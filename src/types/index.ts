export interface User {
  id: string;
  email: string;
  gamesPlayed: number;
  currentStreak: number;
  mood?: string;
}

export interface GameCard {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  path: string;
  color: string;
}

export interface MoodContent {
  mood: string;
  playlists: Array<{
    title: string;
    url: string;
    thumbnail: string;
  }>;
  movies: Array<{
    title: string;
    url: string;
    thumbnail: string;
  }>;
}

export interface Meme {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}