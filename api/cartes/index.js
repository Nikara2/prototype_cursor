const connectToDatabase = require('../mongoose');
const mongoose = require('mongoose');

const CarteSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  numeroAssurance: { type: String, required: true, trim: true },
  assureur: { type: String, required: true, trim: true },
  dateEnregistrement: { type: Date, default: Date.now }
});

const Carte = mongoose.models.Carte || mongoose.model('Carte', CarteSchema);

// Helper to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`📍 ${req.method} /api/cartes`);
    await connectToDatabase();

    if (req.method === 'GET') {
      const cartes = await Carte.find().sort({ dateEnregistrement: -1 });
      console.log(`✅ Found ${cartes.length} cartes`);
      return res.status(200).json(cartes);
    }

    if (req.method === 'POST') {
      const { nom, prenom, numeroAssurance, assureur } = req.body || {};

      if (!nom || !prenom || !numeroAssurance || !assureur) {
        console.warn('⚠️  Missing required fields:', { nom, prenom, numeroAssurance, assureur });
        return res.status(400).json({ error: 'Tous les champs sont requis (nom, prenom, numeroAssurance, assureur)' });
      }

      const nouvelleCarte = await Carte.create({ nom, prenom, numeroAssurance, assureur });
      console.log('✅ Carte saved:', nouvelleCarte._id);
      return res.status(201).json({ message: 'Carte enregistrée avec succès', carte: nouvelleCarte });
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (error) {
    console.error('❌ API /api/cartes error:', error.message || error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ error: 'Erreur serveur lors de la gestion des cartes', details: error.message });
  }
};
