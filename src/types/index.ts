export interface SongInfo {
  title: string;
  originalTitle: string;
  artist: string;
  album?: string;
  release_date?: string;
}

export interface AnimeThemeDetails {
  artistNames: string[];
  songName: string;
  animeName: string;
  themeType: string;
  sequence: number;
  year: number;
  videoLink: string;
}
