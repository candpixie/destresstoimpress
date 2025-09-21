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
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
  is_video?: boolean;
  domain?: string;
  ups?: number;
  created_utc?: number;
}

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
  is_video: boolean;
  domain: string;
  ups: number;
  created_utc: number;
}

export interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}