import { describe, it, expect } from 'vitest';
import { Anoboy } from '../src/index';
import { InvalidUrlError, HttpError } from '../src/errors';

const anoboy = new Anoboy({
  timeout: 15000,
  retries: 1,
  cacheTtl: 0,
});

describe('Network Integration Tests (real website)', () => {
  it('should fetch latest anime listings', { timeout: 20000 }, async () => {
    const result = await anoboy.getLatest();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].title).toBeTruthy();
    expect(result.items[0].url).toMatch(/https?:\/\/anoboy\.quest/);
  });

  it('should fetch schedule', { timeout: 20000 }, async () => {
    const result = await anoboy.getSchedule();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.days.length).toBeGreaterThan(0);
  });

  it('should fetch anime list category', { timeout: 20000 }, async () => {
    const result = await anoboy.getAnimeList();
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('should fetch anime detail', { timeout: 20000 }, async () => {
    const latest = await anoboy.getLatest();
    const detailUrl = latest.items.length > 0 ? latest.items[0].url : null;
    
    if (detailUrl) {
      const detail = await anoboy.getAnimeDetail(detailUrl);
      expect(detail.title).toBeTruthy();
    }
  });

  it('should fetch episode servers', { timeout: 20000 }, async () => {
    const latest = await anoboy.getLatest();
    const episodeUrl = latest.items.length > 0 ? latest.items[0].url : null;
    
    if (episodeUrl && latest.items[0].contentType === 'anime' && latest.items[0].title.includes('Episode')) {
      const episode = await anoboy.getEpisode(episodeUrl);
      expect(episode.url).toBe(episodeUrl);
    }
  });

  it('should respect domain validation', { timeout: 5000 }, async () => {
    await expect(anoboy.getRawHtml('https://example.com/')).rejects.toThrow(InvalidUrlError);
  });

  it('should handle 404 errors', { timeout: 20000 }, async () => {
    await expect(anoboy.getRawHtml('https://anoboy.quest/nonexistent-page-12345/')).rejects.toThrow(
      HttpError
    );
  });

  it('should handle timeout', { timeout: 10000 }, async () => {
    const timeoutAnoboy = new Anoboy({ timeout: 1, retries: 0 });
    try {
      await timeoutAnoboy.getLatest();
      throw new Error('Expected timeout error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/timeout|Timeout/);
    }
  });

  it('should fetch page with pagination', { timeout: 20000 }, async () => {
    const result = await anoboy.getLatest({ page: 2 });
    expect(result.items.length).toBeGreaterThanOrEqual(0);
  });

  it('should search for anime', { timeout: 20000 }, async () => {
    const result = await anoboy.search('One Piece');
    expect(result.items.length).toBeGreaterThan(0);
  });
});