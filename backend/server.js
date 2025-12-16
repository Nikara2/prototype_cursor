/**
 * Serveur Express pour l'API de gestion des cartes d'assurance
 * 
 * Endpoints :
 * - POST /api/cartes : Enregistrer une nouvelle carte
 * - GET /api/cartes : Récupérer toutes les cartes enregistrées
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Configuration dotenv - adapter le chemin selon l'environnement
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permet les requêtes cross-origin depuis le frontend
// Augmenter la limite pour accepter des images encodées en base64
app.use(express.json({ limit: '10mb' })); // Parse les requêtes JSON (payload jusqu'à 10 Mo)

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cartes-assurance';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion à MongoDB réussie');
})
.catch((err) => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
  console.log('💡 Assurez-vous que MongoDB est démarré ou utilisez MongoDB Atlas');
});

// Schéma Mongoose pour les cartes d'assurance
const carteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  numeroAssurance: {
    type: String,
    required: true,
    trim: true
  },
  assureur: {
    type: String,
    required: true,
    trim: true
  },
  dateEnregistrement: {
    type: Date,
    default: Date.now
  },
  // Image encodée en Data URL (base64) envoyée par le frontend (optionnel)
  imageData: {
    type: String,
    required: false
  }
});

const Carte = mongoose.model('Carte', carteSchema);

// Routes API

/**
 * POST /api/cartes
 * Enregistre une nouvelle carte d'assurance
 * 
 * Body attendu :
 * {
 *   "nom": "Dupont",
 *   "prenom": "Jean",
 *   "numeroAssurance": "123456789",
 *   "assureur": "CPAM"
 * }
 */
app.post('/api/cartes', async (req, res) => {
  try {
    // Validation basique des données
    const { nom, prenom, numeroAssurance, assureur, imageData } = req.body;

    if (!nom || !prenom || !numeroAssurance || !assureur) {
      return res.status(400).json({
        error: 'Tous les champs sont requis (nom, prenom, numeroAssurance, assureur)'
      });
    }

    // Création de la nouvelle carte
    const nouvelleCarte = new Carte({
      nom,
      prenom,
      numeroAssurance,
      assureur,
      imageData: imageData || undefined
    });

    const carteEnregistree = await nouvelleCarte.save();

    res.status(201).json({
      message: 'Carte enregistrée avec succès',
      carte: carteEnregistree
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de l\'enregistrement de la carte'
    });
  }
});

/**
 * GET /api/cartes
 * Récupère toutes les cartes enregistrées
 * 
 * Retourne un tableau de toutes les cartes, triées par date d'enregistrement (plus récentes en premier)
 */
app.get('/api/cartes', async (req, res) => {
  try {
    const cartes = await Carte.find().sort({ dateEnregistrement: -1 });
    res.json(cartes);
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des cartes'
    });
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API fonctionnelle' });
});

// Export pour Vercel (serverless)
module.exports = app;

// Démarrage du serveur uniquement en local (pas sur Vercel)
if (require.main === module && !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📱 Frontend accessible sur http://localhost:${PORT}`);
    console.log(`🔌 API disponible sur http://localhost:${PORT}/api`);
  });

  // Gestion des erreurs de port
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Erreur: Le port ${PORT} est déjà utilisé`);
      console.log(`💡 Solutions:`);
      console.log(`   1. Arrêter le processus qui utilise le port ${PORT}`);
      console.log(`   2. Utiliser un autre port en définissant PORT dans .env (ex: PORT=3001)`);
      console.log(`   3. Sur Windows: netstat -ano | findstr :${PORT} puis taskkill /PID <PID> /F`);
      console.log(`   4. Sur Linux/Mac: lsof -ti:${PORT} | xargs kill -9`);
      process.exit(1);
    } else {
      console.error('❌ Erreur serveur:', error);
      process.exit(1);
    }
  });
}

