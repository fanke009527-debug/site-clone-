const net = require('node:net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findPort(start = 8765, maxAttempts = 10) {
  for (let port = start; port < start + maxAttempts; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error(`No available port found in range ${start}-${start + maxAttempts - 1}`);
}

module.exports = { findPort, checkPort };

if (require.main === module) {
  findPort().then((port) => {
    process.stdout.write(String(port));
  });
}
