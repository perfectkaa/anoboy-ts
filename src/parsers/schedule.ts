import * as cheerio from 'cheerio';
import { ScheduleItem } from '../types';
import { ensureAbsoluteUrl } from '../utils/url';

export interface ScheduleResult {
  items: ScheduleItem[];
  days: string[];
}

export function parseSchedule(html: string, baseUrl: string, dayFilter?: string): ScheduleResult {
  const $ = cheerio.load(html);
  const items: ScheduleItem[] = [];
  const days: string[] = [];

  // Primary: parse schedule table with th/td structure
  // Headers: Judul, Hari, Waktu
  $('table tbody tr').each((_, row) => {
    const $row = $(row);
    
    // Skip header row
    const cells = $row.find('td, th');
    const firstCell = cells.first().text().trim().toLowerCase();
    if (firstCell === 'judul') return; // Skip header
    
    // Try the standard table structure: td:nth-child(1) = title link, td:nth-child(2) = day, td:nth-child(3) = time
    let link = $row.find('td:nth-child(1) a, th:nth-child(1) a').first();
    let dayText = $row.find('td:nth-child(2)').text().trim() || $row.find('th:nth-child(2)').text().trim();
    let timeText = $row.find('td:nth-child(3)').text().trim() || $row.find('th:nth-child(3)').text().trim();

    // Alternative structure where th scope="row" contains the title
    if (!link.attr('href')) {
      link = $row.find('th[scope="row"] a').first();
      if (!dayText) dayText = $row.find('td').first().text().trim();
      if (!timeText) timeText = $row.find('td').last().text().trim();
    }

    const title = link.text().trim();
    const urlRaw = link.attr('href') || null;
    const url = urlRaw ? ensureAbsoluteUrl(baseUrl, urlRaw) : null;

    const day = dayText || null;
    const time = timeText || null;

    if (day && !days.includes(day)) {
      days.push(day);
    }

    if (title) {
      if (dayFilter && day && day.toLowerCase() !== dayFilter.toLowerCase()) {
        return;
      }
      items.push({ title, day, time, url });
    }
  });

  // Fallback: if no table found, try .amv structure (schedule might be displayed as cards)
  if (items.length === 0) {
    $('.amv').each((_, container) => {
      const $container = $(container);
      const link = $container.find('a[rel="bookmark"]').first();
      const title = link.attr('title')?.trim() || link.text().trim() || '';
      const urlRaw = link.attr('href') || '';
      const url = urlRaw ? ensureAbsoluteUrl(baseUrl, urlRaw) : null;
      
      // Extract day from .jamup if available
      const timeEl = $container.find('.jamup').first();
      const updatedAt = timeEl.text().trim() || null;
      
      if (title && url) {
        // Parse day from updatedAt like "UP Senin, 23:06 Wib"
        let day = null;
        let time = null;
        if (updatedAt) {
          const match = updatedAt.match(/UP\s+(\w+)/);
          day = match ? match[1] : updatedAt;
          const timeMatch = updatedAt.match(/(\d{1,2}:\d{2})/);
          time = timeMatch ? timeMatch[1] + ' Wib' : null;
        }
        
        if (day && !days.includes(day)) days.push(day);
        
        if (dayFilter && day && day.toLowerCase() !== dayFilter.toLowerCase()) {
          return;
        }
        
        items.push({ title, day, time, url });
      }
    });
  }

  return { items, days };
}