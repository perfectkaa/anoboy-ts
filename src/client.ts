import { AnoboyOptions, RequestOptions } from './types';
import {
  NetworkError,
  TimeoutError,
  HttpError,
  RateLimitError,
  InvalidUrlError,
} from './errors';
import { isAllowedDomain, ensureAbsoluteUrl } from './utils/url';

interface CacheEntry {
  data: string;
  timestamp: number;
}

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_CACHE_TTL = 60000;
const DEFAULT_BASE_URL = 'https://anoboy.quest/';

export class AnoboyClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private cacheTtl: number;
  private allowedDomains: string[];
  private defaultHeaders: Record<string, string>;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<string>>();

  constructor(options: AnoboyOptions = {}) {
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.retries = options.retries ?? DEFAULT_RETRIES;
    this.cacheTtl = options.cacheTtl ?? DEFAULT_CACHE_TTL;
    this.allowedDomains = options.allowedDomains || ['anoboy.quest'];
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (compatible; anoboy-ts/1.0; +https://github.com/anoboy-ts)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      ...options.headers,
    };
  }

  private validateUrl(url: string): void {
    if (!isAllowedDomain(url, this.allowedDomains)) {
      throw new InvalidUrlError(
        `Domain not allowed. Only domains matching: ${this.allowedDomains.join(', ')}`
      );
    }
  }

  private getCacheKey(url: string, signal?: AbortSignal): string {
    return url;
  }

  private getFromCache(url: string): string | null {
    const entry = this.cache.get(url);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTtl) {
      this.cache.delete(url);
      return null;
    }
    return entry.data;
  }

  private setCache(url: string, data: string): void {
    this.cache.set(url, { data, timestamp: Date.now() });
  }

  private async fetchWithTimeout(
    url: string,
    signal?: AbortSignal
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: signal || controller.signal,
        headers: this.defaultHeaders,
        redirect: 'follow',
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new RateLimitError('Rate limit exceeded. Please try again later.');
        }
        throw new HttpError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout for ${url}`);
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout for ${url}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async retryFetch(
    url: string,
    retries: number,
    signal?: AbortSignal
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, signal);
        const html = await response.text();
        return html;
      } catch (error) {
        lastError = error as Error;
        if (error instanceof HttpError || error instanceof RateLimitError) {
          throw error;
        }
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw new NetworkError(
      `Failed to fetch ${url} after ${retries + 1} attempts: ${lastError?.message}`,
      lastError
    );
  }

  async get(url: string, options: RequestOptions = {}): Promise<string> {
    this.validateUrl(url);

    const { timeout, signal, useCache = true, retries = this.retries } = options;

    const cacheKey = this.getCacheKey(url, signal);

    if (useCache) {
      const cached = this.getFromCache(url);
      if (cached) return cached;
    }

    const pending = this.pendingRequests.get(url);
    if (pending) return pending;

    const fetchPromise = (async () => {
      try {
        const html = await this.retryFetch(url, retries, signal);
        if (useCache) {
          this.setCache(url, html);
        }
        return html;
      } finally {
        this.pendingRequests.delete(url);
      }
    })();

    this.pendingRequests.set(url, fetchPromise);
    return fetchPromise;
  }

  async getHtml(url: string, options: RequestOptions = {}): Promise<string> {
    return this.get(url, options);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const createClient = (options?: AnoboyOptions) => new AnoboyClient(options);