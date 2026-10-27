import { describe, it, expect } from 'vitest';
import { parseSchedule } from '../src/parsers/schedule';
import * as fs from 'fs';
import * as path from 'path';

const fixturePath = path.join(__dirname, 'fixtures', 'schedule.html');
const html = fs.readFileSync(fixturePath, 'utf-8');
const baseUrl = 'https://anoboy.quest/';

describe('parseSchedule', () => {
  it('should parse schedule table', () => {
    const result = parseSchedule(html, baseUrl);
    expect(result.items).toHaveLength(4);
    expect(result.days).toContain('Minggu');
    expect(result.days).toContain('Rabu');
    expect(result.days).toContain('Senin');
  });

  it('should parse correct fields', () => {
    const result = parseSchedule(html, baseUrl);
    const first = result.items[0];
    expect(first.title).toBe('Ao no Hako Season 1 + 2');
    expect(first.day).toBe('Minggu');
    expect(first.time).toBe('19:00 WIB');
    expect(first.url).toBe('https://anoboy.quest/2026/10/ao-no-hako-season-1-2/');
  });

  it('should filter by day', () => {
    const result = parseSchedule(html, baseUrl, 'Rabu');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Battle Spirits [Re]: Zekkai no Kuu');
  });

  it('should handle empty HTML', () => {
    const result = parseSchedule('<html><body></body></html>', baseUrl);
    expect(result.items).toHaveLength(0);
    expect(result.days).toHaveLength(0);
  });
});