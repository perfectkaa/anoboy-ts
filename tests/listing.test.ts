import { describe, it, expect } from 'vitest';
import { parseListing } from '../src/parsers/listing';
import * as fs from 'fs';
import * as path from 'path';

const fixturePath = path.join(__dirname, 'fixtures', 'listing.html');
const html = fs.readFileSync(fixturePath, 'utf-8');
const baseUrl = 'https://anoboy.quest/';

describe('parseListing', () => {
  it('should parse anime cards', () => {
    const result = parseListing(html, baseUrl);
    expect(result.items).toHaveLength(4);

    const first = result.items[0];
    expect(first.title).toBe('Test Anime Episode 4');
    expect(first.url).toBe('https://anoboy.quest/2026/10/test-anime-episode-4/');
    expect(first.thumbnail).toBe('https://anoboy.quest/img/upload/test-anime.jpg');
    expect(first.updatedAt).toBe('UP Senin, 23:06 Wib');
    expect(first.contentType).toBe('anime');
  });

  it('should resolve relative thumbnail URLs to absolute', () => {
    const result = parseListing(html, baseUrl);
    for (const item of result.items) {
      if (item.thumbnail) {
        expect(item.thumbnail).toMatch(/^https?:\/\//);
      }
    }
  });

  it('should handle pagination links', () => {
    const result = parseListing(html, baseUrl);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.nextUrl).toBe('https://anoboy.quest/page/2/');
  });

  it('should handle empty HTML', () => {
    const result = parseListing('<html><body></body></html>', baseUrl);
    expect(result.items).toHaveLength(0);
    expect(result.pagination.hasNext).toBe(false);
  });
});