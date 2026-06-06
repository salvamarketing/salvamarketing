const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://drive.google.com/uc?export=download&id=1D9LaPIQTYLcNhK6UYGpejUZd-HL7Wjg8';
const dest = path.join(__dirname, '..', 'public', 'hero-bg.mp4');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303) {
        if (response.headers.location) {
          download(response.headers.location, dest).then(resolve).catch(reject);
        } else {
          reject(new Error('Redirected without location header'));
        }
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', function(err) {
      fs.unlink(dest, () => reject(err));
    });
  });
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir, { recursive: true });
}

download(url, dest)
  .then(() => console.log('Successfully downloaded hero-bg.mp4'))
  .catch(err => {
    console.error('Error downloading video:', err);
    process.exit(1);
  });
