export interface SongInfo {
  title: string;
  originalTitle: string;
  artist: string;
  album?: string;
  release_date?: string;
  coverArt?: string;
  appleMusicUrl?: string;
  appleMusicId?: string;
  spotifyUrl?: string;
  shazamUrl?: string;
}

export interface AnimeThemeDetails {
  artistNames: string[];
  songName: string;
  animeName: string;
  animeImage: string;
  themeType: string;
  sequence: number;
  year: number;
  videoLink: string;
}
