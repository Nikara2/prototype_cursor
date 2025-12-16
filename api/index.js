const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques depuis /public
app.use(express.static(path.join(__dirname, '../public')));

// ============= MongoDB Setup =============
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.__mongoose_cache || (global.__mongoose_cache = { conn: null, promise: null });

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ MongoDB connected');
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ============= MongoDB Schema =============
const CarteSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  numeroAssurance: { type: String, required: true, trim: true },
  assureur: { type: String, required: true, trim: true },
  dateEnregistrement: { type: Date, default: Date.now }
});

const Carte = mongoose.models.Carte || mongoose.model('Carte', CarteSchema);

// ============= API Routes =============

app.get('/api/health', (req, res) => {
  const mongodbUri = process.env.MONGODB_URI ? '✅ Configured' : '❌ NOT set';
  res.status(200).json({
    status: 'OK',
    message: 'API fonctionnelle',
    mongodb: mongodbUri,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cartes', async (req, res) => {
  try {
    await connectToDatabase();
    const cartes = await Carte.find().sort({ dateEnregistrement: -1 });
    return res.status(200).json(cartes);
  } catch (error) {
    console.error('❌ GET /api/cartes error:', error.message);
    return res.status(500).json({ error: 'Erreur lors de la récupération des cartes', details: error.message });
  }
});

app.post('/api/cartes', async (req, res) => {
  try {
    await connectToDatabase();
    const { nom, prenom, numeroAssurance, assureur } = req.body || {};

    if (!nom || !prenom || !numeroAssurance || !assureur) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const nouvelleCarte = await Carte.create({ nom, prenom, numeroAssurance, assureur });
    return res.status(201).json({ message: 'Carte enregistrée avec succès', carte: nouvelleCarte });
  } catch (error) {
    console.error('❌ POST /api/cartes error:', error.message);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement', details: error.message });
  }
});

// ============= Serve Frontend (SPA) =============
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============= Export for Vercel =============
module.exports = app;
