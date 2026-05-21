const fs = require('fs');
const https = require('https');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { execSync } = require('child_process');

const url = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260417_061226_74f0749c-a22d-42b3-895e-5d6203bc741c.mp4";
const input = "original_video.mp4";
const output = "public/section2_scroll.mp4";

console.log("Downloading video...");
const file = fs.createWriteStream(input);
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close(() => {
      console.log("Download complete, encoding...");
      try {
        const cmd = `${ffmpegInstaller.path} -y -i ${input} -c:v libx264 -preset veryfast -crf 28 -g 1 -keyint_min 1 -an ${output}`;
        console.log("Running:", cmd);
        execSync(cmd, { stdio: 'inherit' });
        console.log("Encoding complete!");
      } catch (err) {
        console.error("Error encoding:", err);
      }
    });
  });
});
