import { describe, it, expect } from 'vitest';
import { parseEpisode } from '../src/parsers/episode';
import * as fs from 'fs';
import * as path from 'path';

const fixturePath = path.join(__dirname, 'fixtures', 'episode.html');
const html = fs.readFileSync(fixturePath, 'utf-8');
const baseUrl = 'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/';

describe('parseEpisode', () => {
  it('should parse episode title', () => {
    const result = parseEpisode(html, baseUrl);
    expect(result.title).toBe('Shuiro no Kamen Episode 3');
  });

  it('should parse iframe#mediaplayer', () => {
    const result = parseEpisode(html, baseUrl);
    expect(result.playerUrl).toBe('https://stream.anoboy.quest/embed/shuiro3');
  });

  it('should parse multiple streaming servers', () => {
    const result = parseEpisode(html, baseUrl);
    expect(result.servers).toHaveLength(3);
  });

  it('should read URL from data-video attribute', () => {
    const result = parseEpisode(html, baseUrl);
    expect(result.servers[0].url).toBe('https://anoboy.quest/uploads/adsbatch720.php?url=abc123');
    expect(result.servers[1].url).toBe('https://anoboy.quest/uploads/yup/data.php?data=xyz789');
    expect(result.servers[2].url).toBe('https://external.stream/vid123');
  });

  it('should parse server quality labels', () => {
    const result = parseEpisode(html, baseUrl);
    expect(result.servers[0].quality).toBe('720p - Btube');
    expect(result.servers[1].quality).toBe('1080p - YUp');
    expect(result.servers[2].quality).toBe('480p - External');
  });

  it('should parse server names from .vmiror container', () => {
    const result = parseEpisode(html, baseUrl);
    // Names are extracted from the container text
    expect(result.servers[0].name.length).toBeGreaterThan(0);
  });

  it('should set type as embed', () => {
    const result = parseEpisode(html, baseUrl);
    for (const server of result.servers) {
      expect(server.type).toBe('embed');
    }
  });
});