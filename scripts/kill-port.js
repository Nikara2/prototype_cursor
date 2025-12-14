/**
 * Script pour libérer un port sur Windows
 * 
 * Usage: node scripts/kill-port.js [port]
 * Exemple: node scripts/kill-port.js 3000
 */

const { exec } = require('child_process');
const os = require('os');

const port = process.argv[2] || 3000;
const platform = os.platform();

function killPortWindows(port) {
  return new Promise((resolve, reject) => {
    // Trouver le PID qui utilise le port
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`ℹ️  Aucun processus trouvé sur le port ${port}`);
        resolve();
        return;
      }

      const lines = stdout.trim().split('\n');
      const pids = new Set();

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 0) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      });

      if (pids.size === 0) {
        console.log(`ℹ️  Aucun processus trouvé sur le port ${port}`);
        resolve();
        return;
      }

      console.log(`🔍 Processus trouvés sur le port ${port}: ${Array.from(pids).join(', ')}`);

      // Tuer chaque processus
      let killed = 0;
      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Erreur lors de l'arrêt du processus ${pid}:`, error.message);
          } else {
            console.log(`✅ Processus ${pid} arrêté`);
            killed++;
          }

          if (killed === pids.size) {
            console.log(`\n✅ Port ${port} libéré !`);
            resolve();
          }
        });
      });
    });
  });
}

function killPortUnix(port) {
  return new Promise((resolve, reject) => {
    exec(`lsof -ti:${port}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`ℹ️  Aucun processus trouvé sur le port ${port}`);
        resolve();
        return;
      }

      const pids = stdout.trim().split('\n').filter(pid => pid);

      if (pids.length === 0) {
        console.log(`ℹ️  Aucun processus trouvé sur le port ${port}`);
        resolve();
        return;
      }

      console.log(`🔍 Processus trouvés sur le port ${port}: ${pids.join(', ')}`);

      pids.forEach(pid => {
        exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Erreur lors de l'arrêt du processus ${pid}:`, error.message);
          } else {
            console.log(`✅ Processus ${pid} arrêté`);
          }
        });
      });

      console.log(`\n✅ Port ${port} libéré !`);
      resolve();
    });
  });
}

async function main() {
  console.log(`🔧 Libération du port ${port}...\n`);

  try {
    if (platform === 'win32') {
      await killPortWindows(port);
    } else {
      await killPortUnix(port);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main();

