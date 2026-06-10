const fs = require('fs');
const https = require('https');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { execSync } = require('child_process');

const videoId = '13QG8yKgoRoIw67eMi15VqVyYyIdA8J1l';
const url = `https://drive.google.com/uc?export=download&id=${videoId}`;
const input = path.join(__dirname, '..', 'original_hero.mp4');
const output = path.join(__dirname, '..', 'public', 'hero_scroll_kf_v2.mp4');

if (fs.existsSync(output)) {
  console.log("File already exists, skipping download and encode.");
  process.exit(0);
}

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
        file.on('finish', () => file.close(resolve));
      }
    }).on('error', function(err) {
      fs.unlink(dest, () => reject(err));
    });
  });
}

console.log("Downloading video...", url);
download(url, input)
  .then(() => {
    console.log("Download complete. Encoding with faststart...");
    try {
      const cmd = `${ffmpegInstaller.path} -y -i ${input} -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 28 -g 1 -keyint_min 1 -movflags +faststart -an ${output}`;
      console.log("Running:", cmd);
      execSync(cmd, { stdio: 'inherit' });
      console.log("Encoding complete!");
    } catch (err) {
      console.error("Error encoding:", err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error downloading:', err);
    process.exit(1);
  });
