import { AnoboyClient } from './client';
import { parseListing, ListingResult } from './parsers/listing';
import { parseSchedule, ScheduleResult } from './parsers/schedule';
import { parseAnimeDetail } from './parsers/detail';
import { parseEpisode, EpisodeDetail } from './parsers/episode';
import {
  AnimeItem,
  AnimeDetail,
  EpisodeReference,
  EpisodeDetail as IEpisodeDetail,
  StreamingServer,
  ScheduleItem,
  PaginationOptions,
  RequestOptions,
  AnoboyOptions,
  AnoboyError,
} from './types';
import {
  NetworkError,
  TimeoutError,
  HttpError,
  ParseError,
  InvalidUrlError,
  NotFoundError,
  RateLimitError,
} from './errors';
import { ensureAbsoluteUrl } from './utils/url';

export {
  AnimeItem,
  AnimeDetail,
  EpisodeReference,
  IEpisodeDetail,
  StreamingServer,
  ScheduleItem,
  PaginationOptions,
  RequestOptions,
  AnoboyOptions,
  AnoboyError,
  NetworkError,
  TimeoutError,
  HttpError,
  ParseError,
  InvalidUrlError,
  NotFoundError,
  RateLimitError,
};

const DEFAULT_BASE_URL = 'https://anoboy.quest/';

// Category URLs discovered from the actual site navigation
const CATEGORY_URLS: Record<string, string> = {
  animeList: 'category/anime/ongoing/',
  donghuaList: 'category/donghua/',
  movies: 'category/anime-movie/',
  tokusatsu: 'category/tokusatsu/',
  liveAction: 'category/live-action-movie/',
  ghibli: 'category/studio-ghibli/',
  schedule: '2015/05/anime-subtitle-indonesia-ini-adalah-arsip-file-kami/',
};

export class Anoboy {
  private client: AnoboyClient;

  constructor(options: AnoboyOptions = {}) {
    this.client = new AnoboyClient(options);
  }

  private async fetchHtml(url: string, options: RequestOptions = {}): Promise<string> {
    try {
      return await this.client.get(url, options);
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      if (error instanceof TimeoutError) throw error;
      if (error instanceof HttpError) throw error;
      if (error instanceof RateLimitError) throw error;
      if (error instanceof InvalidUrlError) throw error;
      throw error;
    }
  }

  async getLatest(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const url = options.page 
      ? ensureAbsoluteUrl(DEFAULT_BASE_URL, `page/${options.page}/`)
      : DEFAULT_BASE_URL;
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getSchedule(options: RequestOptions & { day?: string } = {}): Promise<ScheduleResult> {
    // Schedule data is on the homepage in a hidden #jadwal div
    // The /jadwal/ page itself doesn't contain the table
    const url = DEFAULT_BASE_URL;
    const html = await this.fetchHtml(url, options);
    return parseSchedule(html, url, options.day);
  }

  async getAnimeList(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.animeList);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getDonghuaList(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.donghuaList);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getMovies(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.movies);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getTokusatsu(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.tokusatsu);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getLiveAction(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.liveAction);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getGhibli(options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, CATEGORY_URLS.ghibli);
    const url = addPagination(baseUrl, options.page);
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getAnimeDetail(url: string): Promise<AnimeDetail> {
    const html = await this.fetchHtml(url);
    return parseAnimeDetail(html, url);
  }

  async getEpisode(url: string): Promise<IEpisodeDetail> {
    const html = await this.fetchHtml(url);
    return parseEpisode(html, url);
  }

  async search(query: string, options: PaginationOptions & RequestOptions = {}): Promise<ListingResult> {
    const baseUrl = ensureAbsoluteUrl(DEFAULT_BASE_URL, '?s=' + encodeURIComponent(query));
    const url = options.page && options.page > 1 
      ? ensureAbsoluteUrl(DEFAULT_BASE_URL, `page/${options.page}/?s=${encodeURIComponent(query)}`)
      : baseUrl;
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getPage(url: string, options: RequestOptions = {}): Promise<ListingResult> {
    const html = await this.fetchHtml(url, options);
    return parseListing(html, url);
  }

  async getRawHtml(url: string, options: RequestOptions = {}): Promise<string> {
    return this.fetchHtml(url, options);
  }

  clearCache(): void {
    this.client.clearCache();
  }
}

function addPagination(baseUrl: string, page?: number): string {
  if (!page || page <= 1) return baseUrl;
  return baseUrl.replace(/\/$/, '') + '/page/' + page + '/';
}

export default Anoboy;