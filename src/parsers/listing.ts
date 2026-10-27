import * as cheerio from 'cheerio';
import { AnimeItem } from '../types';
import { ensureAbsoluteUrl } from '../utils/url';

export interface ListingResult {
  items: AnimeItem[];
  pagination: {
    currentPage: number | null;
    totalPages: number | null;
    hasNext: boolean;
    nextUrl: string | null;
  };
}

const extractImageUrl = (imgSrc: string, baseUrl: string): string | null => {
  if (!imgSrc) return null;
  if (imgSrc.startsWith('data:')) return null;
  try {
    return ensureAbsoluteUrl(baseUrl, imgSrc);
  } catch {
    return null;
  }
};

const inferContentType = (title: string): string | null => {
  const lower = title.toLowerCase();
  if (lower.includes('episode')) return 'anime';
  if (lower.includes('ova')) return 'ova';
  if (lower.includes('movie') || lower.includes('film')) return 'movie';
  if (lower.includes('season')) return 'anime';
  if (lower.includes('sp')) return 'special';
  return 'anime';
};

export function parseListing(html: string, baseUrl: string): ListingResult {
  const $ = cheerio.load(html);

  const items: AnimeItem[] = [];

  const containers = $('.amv');
  for (const container of containers) {
    const $container = $(container);
    
    // The .amv container is inside an <a> tag - get the parent link
    const parentLink = $container.parent('a');
    const titleLink = $container.find('.amvj h3.ibox1').first();
    const img = $container.find('img').first();
    const timeEl = $container.find('.jamup').first();

    const title = titleLink.text().trim() || parentLink.attr('title')?.trim() || '';
    const url = parentLink.attr('href') || '';
    const fullUrl = url ? ensureAbsoluteUrl(baseUrl, url) : '';
    const thumbnail = extractImageUrl(img.attr('src') || '', baseUrl);
    const updatedAt = timeEl.text().trim() || null;
    const contentType = title ? inferContentType(title) : null;

    if (title && fullUrl) {
      items.push({
        title,
        url: fullUrl,
        thumbnail,
        updatedAt,
        contentType,
      });
    }
  }

  const pagination = parsePagination($, baseUrl);

  return { items, pagination };
}

function parsePagination($: cheerio.CheerioAPI, baseUrl: string) {
  const currentPage =
    parseInt($('.wp-pagenavi .current, .pagination .current').first().text().trim()) || null;

  let totalPages: number | null = null;
  const pageLinks = $('.wp-pagenavi a, .pagination a');
  for (const el of pageLinks) {
    const text = $(el).text().trim();
    const num = parseInt(text);
    if (!isNaN(num) && (!totalPages || num > totalPages)) {
      totalPages = num;
    }
  }

  const nextLink = $('.wp-pagenavi a[rel="next"], .pagination .next, a.next').first();
  const nextUrlRaw = nextLink.attr('href') || null;
  const nextUrl = nextUrlRaw ? ensureAbsoluteUrl(baseUrl, nextUrlRaw) : null;

  return {
    currentPage,
    totalPages,
    hasNext: !!nextUrl,
    nextUrl,
  };
}

export const parseCategoryListing = (html: string, baseUrl: string): AnimeItem[] => {
  return parseListing(html, baseUrl).items;
};