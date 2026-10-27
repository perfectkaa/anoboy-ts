const { parseAnimeDetail } = require('./src/parsers/detail');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, 'tests', 'fixtures', 'detail.html');
const html = fs.readFileSync(fixturePath, 'utf-8');
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

// Check cheerio parsing directly
const $ = cheerio.load(html);
console.log('\n--- Debug ---');
console.log('.unduhan p text:', $('.unduhan p').text().trim());
console.log('entry-content:', $('.entry-content').length);
console.log('tables:', $('table').length);
$('table tr').each((i, el) => {
  const $row = $(el);
  const cells = $row.find('td, th');
  cells.each((j, cell) => {
    console.log(`  row ${i} cell ${j}:`, $(cell).text().trim());
  });
});