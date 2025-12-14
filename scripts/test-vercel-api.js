#!/usr/bin/env node

/**
 * Script de test simple pour les endpoints Vercel
 * Teste la connexion MongoDB et les API
 */

require('dotenv').config();

const http = require('http');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🧪 Test des endpoints Vercel\n');
console.log(`📍 MONGODB_URI: ${MONGODB_URI ? '✅ Configurée' : '❌ NON configurée'}\n`);

if (!MONGODB_URI) {
  console.error('⚠️  MONGODB_URI non définie dans .env');
  console.error('   Créez un fichier .env avec:');
  console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database\n');
  process.exit(1);
}

// Fonction pour faire une requête HTTP
function testEndpoint(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}`);
        console.log(`Status: ${res.statusCode}\n`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erreur: ${error.message}`);
      resolve({ error: error.message });
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Tests simples
async function runTests() {
  console.log('Assurez-vous que le serveur tourne: npm run vercel-dev\n');
  console.log('Attendez 3 secondes...\n');

  setTimeout(async () => {
    console.log('=== Test 1: GET /api/health ===');
    await testEndpoint('GET', '/api/health');

    console.log('=== Test 2: GET /api/cartes (liste vide initialement) ===');
    await testEndpoint('GET', '/api/cartes');

    console.log('=== Test 3: POST /api/cartes (nouvelle carte) ===');
    const testData = {
      nom: 'Dupont',
      prenom: 'Jean',
      numeroAssurance: '1234567890123',
      assureur: 'CPAM'
    };
    await testEndpoint('POST', '/api/cartes', testData);

    console.log('\n✅ Tests terminés');
  }, 3000);
}

runTests();
