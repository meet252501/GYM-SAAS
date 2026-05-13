import https from 'https';

const queries = [
  ['chest',        'bench+press+chest+exercise'],
  ['biceps',       'bicep+curl+dumbbell'],
  ['triceps',      'tricep+extension+exercise'],
  ['shoulders',    'shoulder+press+overhead'],
  ['abdominals',   'sit+up+crunch+abs'],
  ['quadriceps',   'squat+exercise+gym'],
  ['hamstrings',   'deadlift+hamstring'],
  ['glutes',       'hip+thrust+glute'],
  ['calves',       'calf+raise'],
  ['lats',         'pull+up+pullup+lat'],
  ['middle back',  'barbell+row+back'],
  ['lower back',   'back+extension+lower'],
  ['traps',        'shrug+trap'],
  ['forearms',     'wrist+curl+forearm'],
  ['adductors',    'inner+thigh+adductor'],
  ['abductors',    'lateral+raise+leg'],
  ['neck',         'neck+stretch+exercise'],
  ['cardio',       'jumping+jack+cardio'],
];

function fetchPage(q) {
  return new Promise((res) => {
    const url = `https://lottiefiles.com/search?q=${q}&category=free`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (r) => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        const matches = d.match(/lottie\.host\/[a-f0-9-]+\/[^"' ]+\.(?:lottie|json)/gi) || [];
        const assetMatches = d.match(/assets-v2\.lottiefiles\.com\/a\/[^"' ]+\.(?:lottie|json)/gi) || [];
        const all = [...new Set([...matches, ...assetMatches])];
        res(all.slice(0, 5));
      });
    });
    req.on('error', () => res([]));
    req.setTimeout(10000, () => { req.destroy(); res([]); });
  });
}

const result = {};
for (const [muscle, q] of queries) {
  const urls = await fetchPage(q);
  result[muscle] = urls;
  console.log(`${muscle}: ${urls.length} found`);
  if (urls.length > 0) console.log(`  -> ${urls[0]}`);
  await new Promise(r => setTimeout(r, 600));
}

console.log('\n\n=== FULL RESULT ===');
console.log(JSON.stringify(result, null, 2));
