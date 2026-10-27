export interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  updatedAt: string | null;
  contentType: string | null;
}

export interface EpisodeReference {
  title: string;
  url: string;
  episodeNumber: number | null;
}

export interface StreamingServer {
  name: string;
  quality: string | null;
  url: string;
  type: 'embed' | 'unknown';
}

export interface EpisodeDetail {
  url: string;
  title: string | null;
  playerUrl: string | null;
  servers: StreamingServer[];
}

export interface AnimeDetail {
  title: string;
  url: string;
  image: string | null;
  description: string | null;
  totalEpisodes: number | null;
  studio: string | null;
  source: string | null;
  duration: string | null;
  genres: string[];
  score: number | null;
  episodeList: EpisodeReference[];
}

export interface ScheduleItem {
  title: string;
  day: string | null;
  time: string | null;
  url: string | null;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
  useCache?: boolean;
  retries?: number;
}

export interface AnoboyOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cacheTtl?: number;
  allowedDomains?: string[];
  headers?: Record<string, string>;
}

export interface AnoboyError {
  code: string;
  message: string;
  details?: unknown;
}