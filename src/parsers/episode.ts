import * as cheerio from 'cheerio';
import { EpisodeDetail, StreamingServer } from '../types';
import { ensureAbsoluteUrl } from '../utils/url';

export interface EpisodeParseOptions {
  url: string;
}

export function parseEpisode(html: string, baseUrl: string): EpisodeDetail {
  const $ = cheerio.load(html);

  // Title - try multiple selectors
  const titleEl = $('h1.post-title').first();
  let title = titleEl.text().trim() || null;
  
  // Fallback to pagetitle or title tag
  if (!title) {
    title = $('h1.pagetitle').first().text().trim() || null;
  }
  if (!title) {
    title = $('title').first().text().split('–')[0].trim() || 
            $('title').first().text().split('-')[0].trim() || 
            null;
  }

  // Player iframe URL
  let playerUrl: string | null = null;
  const iframe = $('#mediaplayer');
  if (iframe.length) {
    const src = iframe.attr('src');
    if (src) {
      playerUrl = ensureAbsoluteUrl(baseUrl, src);
    }
  }

  const servers: StreamingServer[] = [];

  // Primary structure: .vmiror containers with a[data-video] links
  $('.vmiror').each((_, container) => {
    const $container = $(container);
    const name = $container.text().trim() || 'Unknown Server';

    $container.find('a[data-video]').each((_, link) => {
      const $link = $(link);
      const videoUrl = $link.attr('data-video') || '';
      if (!videoUrl) return;

      const resolvedUrl = videoUrl.startsWith('http')
        ? videoUrl
        : ensureAbsoluteUrl(baseUrl, videoUrl);

      const linkText = $link.text().trim();
      const quality = linkText || $link.attr('data-quality') || null;

      servers.push({
        name,
        quality,
        url: resolvedUrl,
        type: 'embed',
      });
    });
  });

  // Fallback: if no .vmiror containers, look for any a[data-video] on the page
  if (servers.length === 0) {
    $('a[data-video]').each((_, link) => {
      const $link = $(link);
      const videoUrl = $link.attr('data-video') || '';
      if (!videoUrl) return;

      const resolvedUrl = videoUrl.startsWith('http')
        ? videoUrl
        : ensureAbsoluteUrl(baseUrl, videoUrl);

      const linkText = $link.text().trim();
      const quality = linkText || $link.attr('data-quality') || null;
      const name = $link.closest('.vmiror').text().trim() || 'Unknown Server';

      servers.push({
        name,
        quality,
        url: resolvedUrl,
        type: 'embed',
      });
    });
  }
  
  // Additional fallback: look for #fplay .vmiror specifically
  if (servers.length === 0) {
    $('#fplay .vmiror').each((_, container) => {
      const $container = $(container);
      const name = $container.text().trim() || 'Unknown Server';
      
      $container.find('a[data-video]').each((_, link) => {
        const $link = $(link);
        const videoUrl = $link.attr('data-video') || '';
        if (!videoUrl) return;
        
        const resolvedUrl = videoUrl.startsWith('http')
          ? videoUrl
          : ensureAbsoluteUrl(baseUrl, videoUrl);
          
        const linkText = $link.text().trim();
        const quality = linkText || $link.attr('data-quality') || null;
        
        servers.push({
          name,
          quality,
          url: resolvedUrl,
          type: 'embed',
        });
      });
    });
  }

  return {
    url: baseUrl,
    title,
    playerUrl,
    servers,
  };
}