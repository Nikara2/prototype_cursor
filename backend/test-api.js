/**
 * Script de test pour l'API
 * 
 * Usage: node backend/test-api.js
 * 
 * Ce script permet de tester l'API en créant des données de test
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Données de test
const testCartes = [
    {
        nom: 'Dupont',
        prenom: 'Jean',
        numeroAssurance: '1234567890123',
        assureur: 'CPAM'
    },
    {
        nom: 'Martin',
        prenom: 'Marie',
        numeroAssurance: '9876543210987',
        assureur: 'MSA'
    },
    {
        nom: 'Bernard',
        prenom: 'Pierre',
        numeroAssurance: '4567891234567',
        assureur: 'MGEN'
    }
];

/**
 * Faire une requête POST
 */
function postCarte(carte) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(carte);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/cartes',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(body) });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

/**
 * Faire une requête GET
 */
function getCartes() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/cartes',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(body) });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

/**
 * Exécuter les tests
 */
async function runTests() {
    console.log('🧪 Démarrage des tests API...\n');

    try {
        // Test 1: Créer des cartes de test
        console.log('📝 Création de cartes de test...');
        for (const carte of testCartes) {
            const result = await postCarte(carte);
            if (result.status === 201) {
                console.log(`✅ Carte créée: ${carte.prenom} ${carte.nom}`);
            } else {
                console.log(`❌ Erreur: ${result.body.error}`);
            }
        }

        console.log('\n📋 Récupération de toutes les cartes...');
        const result = await getCartes();
        if (result.status === 200) {
            console.log(`✅ ${result.body.length} carte(s) trouvée(s)`);
            result.body.forEach((carte, index) => {
                console.log(`   ${index + 1}. ${carte.prenom} ${carte.nom} - ${carte.assureur}`);
            });
        }

        console.log('\n✅ Tests terminés avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur est démarré (npm start)');
    }
}

// Exécuter les tests
runTests();

