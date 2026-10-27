import { parseAnimeDetail } from './src/parsers/detail';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const html = fs.readFileSync('./tests/fixtures/detail.html', 'utf-8');
const url = 'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/';

const detail = parseAnimeDetail(html, url);
console.log('Title:', detail.title);
console.log('Image:', detail.image);
console.log('Description:', detail.description);
console.log('Studio:', detail.studio);
console.log('Source:', detail.source);
console.log('Duration:', detail.duration);
console.log('Genres:', detail.genres);
console.log('Score:', detail.score);
console.log('Episode list:', detail.episodeList.length);

const $ = cheerio.load(html);
console.log('\n--- Debug ---');
console.log('.unduhan p text:', $('.unduhan p').text().trim());
console.log('tables:', $('table').length);
$('table tr').each((i, el) => {
  const $row = $(el);
  const cells = $row.find('td, th');
  cells.each((j, cell) => {
    console.log(`  row ${i} cell ${j}:`, $(cell).text().trim());
  });
});