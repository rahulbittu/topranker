#!/bin/bash
node -e "
const net = require('net');

function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port);
  });
}

async function main() {
  for (let i = 0; i < 15; i++) {
    const free = await isPortFree(8081);
    if (free) {
      console.log('Port 8081 is free, starting Metro...');
      process.exit(0);
    }
    console.log('Waiting for port 8081 to free up... (' + (i+1) + '/15)');
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Warning: port 8081 still busy after 15s, trying anyway...');
  process.exit(0);
}
main();
"
npm run expo:dev
