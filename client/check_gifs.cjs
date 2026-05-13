const fs = require('fs');
const https = require('https');

const fileContent = fs.readFileSync('./src/data/exerciseLibrary.js', 'utf8');

// Extract all gifUrls using regex
const regex = /"gifUrl":\s*"([^"]+)"/g;
let match;
const urls = [];

while ((match = regex.exec(fileContent)) !== null) {
  urls.push(match[1]);
}

console.log(`Found ${urls.length} GIF URLs in the library.`);

if (urls.length === 0) {
  console.error("No URLs found. Exiting.");
  process.exit(1);
}

// Check a random sample of 5 URLs
const sampleSize = Math.min(5, urls.length);
const sampleUrls = [];
for (let i = 0; i < sampleSize; i++) {
  const randomIndex = Math.floor(Math.random() * urls.length);
  sampleUrls.push(urls[randomIndex]);
}

console.log(`Testing a random sample of ${sampleSize} URLs...`);

const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR', message: e.message });
    });
  });
};

Promise.all(sampleUrls.map(checkUrl)).then((results) => {
  let allPass = true;
  results.forEach(res => {
    if (res.status === 200) {
      console.log(`  ✅ [200 OK] ${res.url}`);
    } else {
      console.log(`  ❌ [FAILED ${res.status}] ${res.url}`);
      allPass = false;
    }
  });

  if (allPass) {
    console.log("\n🎉 GIF Asset Verification Passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️ Some GIF Assets Failed to Load.");
    process.exit(1);
  }
});
