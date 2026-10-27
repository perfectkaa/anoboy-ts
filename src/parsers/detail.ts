import * as cheerio from 'cheerio';
import { AnimeDetail, EpisodeReference } from '../types';
import { ensureAbsoluteUrl } from '../utils/url';

const normalizeNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '???' || trimmed === 'N/A' || trimmed === 'n/a') {
    return null;
  }
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
};

const normalizeText = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '???' || trimmed === 'N/A' || trimmed === 'n/a') {
    return null;
  }
  return trimmed;
};

export function parseAnimeDetail(html: string, url: string): AnimeDetail {
  const $ = cheerio.load(html);

  // Title from pagetitle, post-title, or title tag
  let title = normalizeText($('h1.pagetitle').first().text()) || 
              normalizeText($('h1.post-title').first().text()) || 
              normalizeText($('title').first().text().replace(' – anoBoy', '').replace(' - anoBoy', '').replace('Subtitle Indonesia', '').trim()) || 
              'Unknown Title';

  // Main image - look for various patterns
  let image: string | null = null;
  
  // Try .unduhan img first
  const unduhanImg = $('.unduhan img').first().attr('src');
  if (unduhanImg) {
    image = ensureAbsoluteUrl(url, unduhanImg);
  }
  
  // Try entry-content img
  if (!image) {
    const entryImg = $('.entry-content img').first().attr('src');
    if (entryImg) image = ensureAbsoluteUrl(url, entryImg);
  }
  
  // Try .wp-post-image
  if (!image) {
    const wpImg = $('.wp-post-image').first().attr('src');
    if (wpImg) image = ensureAbsoluteUrl(url, wpImg);
  }
  
  // Try any img with src containing "googleusercontent"
  if (!image) {
    const bloggerImg = $('img[src*="googleusercontent"]').first().attr('src');
    if (bloggerImg) image = ensureAbsoluteUrl(url, bloggerImg);
  }

  // Description - look in .unduhan or .entry-content paragraphs
  let description: string | null = null;
  const descriptionContainer = $('.unduhan');
  
  if (descriptionContainer.length) {
    // Get all paragraphs within .unduhan
    const paragraphs = descriptionContainer.find('p');
    if (paragraphs.length > 0) {
      paragraphs.each((_, el) => {
        const text = $(el).text().trim();
        if (text && !text.includes('Di unggah') && !text.includes('Terbit')) {
          description = text;
          return false; // Break on first valid description
        }
      });
    }
    
    // If no paragraphs, try getting text directly from description container
    if (!description) {
      const fullText = descriptionContainer.text().trim();
      // Remove known non-description parts
      const cleanedText = fullText
        .replace(/^Di unggah.*$/, '')
        .replace(/^Terbit.*$/, '')
        .trim();
      if (cleanedText) {
        description = normalizeText(cleanedText);
      }
    }
  }
  
  // Fallback: try entry-content
  if (!description) {
    const entryContent = $('.entry-content');
    if (entryContent.length) {
      const paragraphs = entryContent.find('p');
      paragraphs.each((_, el) => {
        const text = $(el).text().trim();
        if (text && !text.includes('Di unggah') && !text.includes('Terbit')) {
          description = text;
          return false;
        }
      });
    }
  }

  // Metadata from tables - the table has th/td pairs
  const metadata: Record<string, string> = {};
  
  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th');
    if (cells.length >= 2) {
      const label = cells.first().text().trim().toLowerCase();
      const value = cells.last().text().trim();
      if (label && value) {
        metadata[label] = value;
      }
    }
  });

  const totalEpisodes = normalizeNumber(metadata['episodes'] || metadata['episode'] || '');
  const studio = normalizeText(metadata['studio'] || '');
  const sourceField = normalizeText(metadata['source'] || metadata['souce'] || '');

  // Duration - from #durasi element or metadata
  let duration: string | null = null;
  const durasiEl = $('#durasi');
  if (durasiEl.length) {
    duration = normalizeText(durasiEl.text());
  } else {
    duration = normalizeText(metadata['durasi'] || metadata['duration'] || '');
  }

  // Genres - from #genre element or metadata
  let genres: string[] = [];
  const genreEl = $('#genre');
  if (genreEl.length) {
    const genreText = genreEl.text().trim();
    // Split by comma and filter
    genres = genreText
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g && g !== 'Genre' && g !== 'ONGOING' && !g.startsWith('ONGOING'))
      .slice(0, 15); // Limit to reasonable number
  } else {
    const genreMetadata = normalizeText(metadata['genre'] || metadata['genres'] || '');
    genres = genreMetadata ? genreMetadata.split(',').map((g) => g.trim()).filter(Boolean) : [];
  }

  // Score - from #score element or metadata
  let score: number | null = null;
  const scoreEl = $('#score');
  if (scoreEl.length) {
    const scoreText = scoreEl.text().trim().replace(/\/10/, '');
    score = normalizeNumber(scoreText);
  } else {
    score = normalizeNumber(metadata['score'] || '');
  }

  // Episode list - look for various patterns
  const episodeList: EpisodeReference[] = [];
  
  // Pattern 1: .singlelink .lcp_catlist li a
  $('.singlelink .lcp_catlist li a').each((_, el) => {
    const $el = $(el);
    const title = $el.text().trim() || '';
    const href = $el.attr('href') || '';
    if (title && href) {
      const episodeNumber = extractEpisodeNumber(title);
      episodeList.push({
        title,
        url: ensureAbsoluteUrl(url, href),
        episodeNumber,
      });
    }
  });
  
  // Pattern 2: Look for episode links in tables
  if (episodeList.length === 0) {
    $('table a[href*="episode"]').each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim() || '';
      const href = $el.attr('href') || '';
      if (title && href && href !== '#') {
        const episodeNumber = extractEpisodeNumber(title);
        episodeList.push({
          title,
          url: ensureAbsoluteUrl(url, href),
          episodeNumber,
        });
      }
    });
  }
  
  // Pattern 3: Look for links containing episode numbers in URL
  if (episodeList.length === 0) {
    $('a[href*="/episode-"]').each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim() || '';
      const href = $el.attr('href') || '';
      if (title && href && href !== '#') {
        const episodeNumber = extractEpisodeNumber(title);
        episodeList.push({
          title,
          url: ensureAbsoluteUrl(url, href),
          episodeNumber,
        });
      }
    });
  }

  return {
    title,
    url,
    image,
    description,
    totalEpisodes,
    studio,
    source: sourceField,
    duration,
    genres,
    score,
    episodeList,
  };
}

function extractEpisodeNumber(title: string): number | null {
  const match = title.match(/Episode\s*(\d+)/i) || title.match(/\s(\d+)$/);
  if (match) {
    const num = parseInt(match[1]);
    return isNaN(num) ? null : num;
  }
  return null;
}