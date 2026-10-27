import { Anoboy } from './dist/index.js';
import * as cheerio from 'cheerio';

const anoboy = new Anoboy({ timeout: 15000, retries: 1, cacheTtl: 0 });

async function debug() {
  try {
    const html = await anoboy.getRawHtml('https://anoboy.quest/');
    console.log('HTML length:', html.length);
    
    const $ = cheerio.load(html);
    
    // Check for .amv containers
    const amvCount = $('.amv').length;
    console.log('.amv count:', amvCount);
    
    // Check for other possible selectors
    console.log('.article count:', $('.article').length);
    console.log('.post count:', $('.post').length);
    console.log('.anime-card count:', $('.anime-card').length);
    console.log('.item-post count:', $('.item-post').length);
    console.log('.latest-posts count:', $('.latest-posts').length);
    console.log('.posts count:', $('.posts').length);
    
    // Look for any links with rel="bookmark"
    const bookmarkCount = $('a[rel="bookmark"]').length;
    console.log('a[rel="bookmark"] count:', bookmarkCount);
    
    // Look for any h3.ibox1
    const ibox1Count = $('h3.ibox1').length;
    console.log('h3.ibox1 count:', ibox1Count);
    
    // Print all h3/h2/h1 tags
    console.log('\n--- All heading tags ---');
    $('h1, h2, h3').each((i, el) => {
      const text = $(el).text().trim().substring(0, 100);
      if (text) console.log(`  ${el.tagName}[${i}]:`, text);
    });
    
    // Check for article tags
    console.log('\n--- Article tags ---');
    $('article').each((i, el) => {
      if (i >= 10) return;
      const title = $(el).find('h1, h2, h3, h4, .title').first().text().trim().substring(0, 100);
      console.log(`  article[${i}]:`, title || 'no title found');
    });
    
    // Check for entry-content or similar containers
    console.log('\n--- Content containers ---');
    console.log('entry-content:', $('.entry-content').length);
    console.log('content-area:', $('.content-area').length);
    console.log('main-content:', $('.main-content').length);
    console.log('#main:', $('#main').length);
    console.log('.content:', $('.content').length);
    
    // Print excerpt of body
    const bodyStart = html.indexOf('<body');
    const bodyEnd = html.indexOf('</body>');
    if (bodyStart >= 0) {
      const body = html.substring(bodyStart, bodyEnd >= 0 ? bodyEnd : undefined);
      console.log('\n--- Body excerpt (chars 2000-6000) ---');
      console.log(body.substring(2000, 6000));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug();