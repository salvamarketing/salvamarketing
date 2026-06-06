import fs from 'fs';
import https from 'https';

const url = 'https://drive.google.com/uc?export=download&id=1D9LaPIQTYLcNhK6UYGpejUZd-HL7Wjg8';
const file = fs.createWriteStream('./public/hero-bg.mp4');

console.log('Downloading...');

https.get(url, function(response) {
  if (response.statusCode === 303 || response.statusCode === 302 || response.statusCode === 301) {
    if (response.headers.location) {
        https.get(response.headers.location, function(redirectResponse) {
           redirectResponse.pipe(file);
           redirectResponse.on('end', () => console.log('Done'));
        });
    }
  } else {
    response.pipe(file);
    response.on('end', () => console.log('Done direct'));
  }
});
