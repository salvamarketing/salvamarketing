const https = require('https');
const url = 'https://drive.google.com/uc?export=download&id=1D9LaPIQTYLcNhK6UYGpejUZd-HL7Wjg8';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirecting to:', res.headers.location);
    https.get(res.headers.location, (res2) => {
      console.log('Status Code 2:', res2.statusCode);
      console.log('Headers 2:', res2.headers);
      let size = 0;
      res2.on('data', chunk => size += chunk.length);
      res2.on('end', () => console.log('Total size:', size));
    });
  }
});
