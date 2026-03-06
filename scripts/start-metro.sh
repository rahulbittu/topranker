#!/bin/bash
node -e "
const fs = require('fs');
const net = require('net');

function killPortOwner(port) {
  try {
    const portHex = port.toString(16).toUpperCase().padStart(4, '0');
    const files = ['/proc/net/tcp', '/proc/net/tcp6'];
    for (const file of files) {
      try {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts[1] && parts[1].endsWith(':' + portHex) && parts[3] === '0A') {
            const inode = parts[9];
            const pids = fs.readdirSync('/proc').filter(p => /^\d+$/.test(p));
            for (const pid of pids) {
              try {
                const fds = fs.readdirSync('/proc/' + pid + '/fd');
                for (const fd of fds) {
                  try {
                    const link = fs.readlinkSync('/proc/' + pid + '/fd/' + fd);
                    if (link.includes('socket:[' + inode + ']')) {
                      console.log('Killing PID ' + pid + ' (owns port ' + port + ')');
                      process.kill(parseInt(pid), 'SIGKILL');
                    }
                  } catch(e) {}
                }
              } catch(e) {}
            }
          }
        }
      } catch(e) {}
    }
  } catch(e) {}
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port);
  });
}

async function main() {
  const free = await isPortFree(8081);
  if (free) {
    console.log('Port 8081 is free, starting Metro...');
    process.exit(0);
  }
  console.log('Port 8081 is busy, killing owner...');
  killPortOwner(8081);
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 500));
    const nowFree = await isPortFree(8081);
    if (nowFree) {
      console.log('Port 8081 freed, starting Metro...');
      process.exit(0);
    }
  }
  console.log('Port still busy after kill attempts, starting anyway...');
  process.exit(0);
}
main();
"
npm run expo:dev
