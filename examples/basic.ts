import { Anoboy } from '../src/index';

async function main() {
  const anoboy = new Anoboy();

  console.log('Fetching latest anime...');
  const latest = await anoboy.getLatest();
  console.log(`Found ${latest.items.length} items`);
  if (latest.items[0]) {
    console.log('First:', latest.items[0].title);
  }

  console.log('\nFetching schedule...');
  const schedule = await anoboy.getSchedule();
  console.log(`Found ${schedule.items.length} schedule items`);

  console.log('\nFetching anime detail...');
  const detail = await anoboy.getAnimeDetail(
    'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/'
  );
  console.log('Title:', detail.title);
  console.log('Episodes:', detail.totalEpisodes);
  console.log('Studio:', detail.studio);

  console.log('\nFetching episode servers...');
  const episode = await anoboy.getEpisode(
    'https://anoboy.quest/2026/10/shuiro-no-kamen-episode-3/'
  );
  console.log('Servers:', episode.servers.length);
}

main().catch(console.error);