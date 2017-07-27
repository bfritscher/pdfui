const client = require('scp2');
const fs = require('fs');
const os = require('os');
const path = require('path');

client.scp('dist/', {
  host: 's.j42.org',
  path: '/home/docker/pdfui/dist/',
  username: 'boris',
  privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh/id_rsa')),
}, (err) => {
  if (err) {
    console.log(err);
  }
});
