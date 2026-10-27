# anoboy-ts

An unofficial TypeScript scraper and API wrapper for [anoboy.quest](https://anoboy.quest/).

> ⚠️ **Disclaimer**: This package is **not affiliated with, endorsed by, or sponsored by** Anoboy. It is an independent community project created for educational purposes. Use at your own risk. The author is not responsible for any issues arising from the use of this package.

## Features

- **Type-safe** TypeScript with strict mode
- **Modular** architecture (parsers, client, types, errors)
- **Lightweight** — no browser automation, no database
- **HTTP client** with timeout, retry, cache, deduplication, and domain validation
- **Clean public API** for anime listing, schedule, detail, and episode parsing
- **ESM & CommonJS** support via tsup build
- **Unit-tested** with Vitest using local HTML fixtures

## Installation

```bash
npm install anoboy-ts
```

## Quick Start

```typescript
import { Anoboy } from 'anoboy-ts';

const anoboy = new Anoboy();

// Get latest anime
const latest = await anoboy.getLatest();
console.log(latest.items[0]?.title);

// Get weekly schedule
const schedule = await anoboy.getSchedule();

// Get anime detail
const detail = await anoboy.getAnimeDetail(
  'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/'
);

// Get episode streaming servers
const episode = await anoboy.getEpisode(
  'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/'
);
console.log(episode.servers);
```

## API Documentation

### `Anoboy` Class

Constructor accepts `AnoboyOptions`:

```typescript
interface AnoboyOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cacheTtl?: number;
  allowedDomains?: string[];
  headers?: Record<string, string>;
}
```

#### Methods

- `getLatest(options?)` — Get latest anime updates
- `getSchedule(options?)` — Get weekly schedule (optionally filtered by day)
- `getAnimeList(options?)` — Get anime list
- `getDonghuaList(options?)` — Get donghua list
- `getMovies(options?)` — Get movies list
- `getTokusatsu(options?)` — Get tokusatsu list
- `getLiveAction(options?)` — Get live action list
- `getGhibli(options?)` — Get Ghibli list
- `getAnimeDetail(url)` — Get detailed anime information
- `getEpisode(url)` — Get episode streaming servers
- `search(query, options?)` — Search anime
- `getPage(url)` — Parse a generic listing page
- `getRawHtml(url)` — Get raw HTML (requires explicit opt-in)
- `clearCache()` — Clear the in-memory cache

### Types

```typescript
interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  updatedAt: string | null;
  contentType: string | null;
}

interface AnimeDetail {
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

interface EpisodeReference {
  title: string;
  url: string;
  episodeNumber: number | null;
}

interface EpisodeDetail {
  url: string;
  title: string | null;
  playerUrl: string | null;
  servers: StreamingServer[];
}

interface StreamingServer {
  name: string;
  quality: string | null;
  url: string;
  type: 'embed' | 'unknown';
}

interface ScheduleItem {
  title: string;
  day: string | null;
  time: string | null;
  url: string | null;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface RequestOptions {
  timeout?: number;
  signal?: AbortSignal;
  useCache?: boolean;
  retries?: number;
}
```

## Error Handling

Custom error classes for different failure modes:

```typescript
import {
  NetworkError,
  TimeoutError,
  HttpError,
  ParseError,
  InvalidUrlError,
  NotFoundError,
  RateLimitError,
} from 'anoboy-ts';

try {
  await anoboy.getLatest();
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP ${error.status}: ${error.message}`);
  }
}
```

## Configuration

```typescript
const anoboy = new Anoboy({
  timeout: 15000,           // 15 seconds
  retries: 3,               // retry count
  cacheTtl: 120000,         // 2 minutes
  allowedDomains: ['anoboy.quest'],
  headers: {
    'User-Agent': 'MyApp/1.0',
  },
});
```

## Testing

```bash
npm test
```

Tests use local HTML fixtures and do not require internet access.

## Building

```bash
npm run build
```

Generates both ESM and CommonJS distributions in `dist/`.

## Limitations

- This is an unofficial package and is not affiliated with Anoboy.
- Some category endpoints (`getDonghuaList`, `getMovies`, etc.) are based on URL patterns and may not be fully verified.
- The package does not handle CAPTCHA, authentication, or paywalls.
- Rate limiting and robots.txt should be respected.
- Streaming URLs are parsed as embed URLs; actual video files are not downloaded.

## Troubleshooting

- **`InvalidUrlError`**: The URL domain is not in the allowed list. Configure `allowedDomains` in options.
- **`TimeoutError`**: Increase `timeout` or check network connectivity.
- **`RateLimitError`**: The server returned HTTP 429. Wait and retry later.
- **`ParseError`**: HTML structure may have changed. Please report this to the maintainers.

## License

MIT