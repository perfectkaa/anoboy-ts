import { describe, it, expect } from 'vitest';
import { parseAnimeDetail } from '../src/parsers/detail';
import * as fs from 'fs';
import * as path from 'path';

const fixturePath = path.join(__dirname, 'fixtures', 'detail.html');
const html = fs.readFileSync(fixturePath, 'utf-8');
const url = 'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/';

describe('parseAnimeDetail', () => {
  it('should parse title', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.title).toBe('Shuiro no Kamen Episode 3');
  });

  it('should parse image URL', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.image).toBe('https://blogger.googleusercontent.com/img/a/blogger.png');
  });

  it('should parse description', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.description).toContain('Shuiro no Kamen adalah');
  });

  it('should normalize ??? to null for numeric fields', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.totalEpisodes).toBeNull();
  });

  it('should parse studio and source from metadata table', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.studio).toBe('Studio Ghibli');
    expect(detail.source).toBe('Original');
  });

  it('should parse duration', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.duration).toBe('24 menit per episode');
  });

  it('should parse genres', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.genres).toEqual(['Action', 'Adventure', 'Fantasy']);
  });

  it('should parse score as number', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.score).toBe(8.5);
  });

  it('should parse episode list', () => {
    const detail = parseAnimeDetail(html, url);
    expect(detail.episodeList).toHaveLength(3);
    expect(detail.episodeList[0].title).toBe('Shuiro no Kamen Episode 1');
    expect(detail.episodeList[0].url).toBe('https://anoboy.quest/2026/10/shuiro-no-kamen-episode-1/');
    expect(detail.episodeList[0].episodeNumber).toBe(1);
  });

  it('should handle empty HTML', () => {
    const detail = parseAnimeDetail('<html><body></body></html>', url);
    expect(detail.title).toBe('Unknown Title');
    expect(detail.image).toBeNull();
    expect(detail.description).toBeNull();
  });
});