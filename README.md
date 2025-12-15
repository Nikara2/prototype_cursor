# 📋 Scanner de Cartes d'Assurance - PWA

Prototype d'application Progressive Web App (PWA) pour scanner et extraire automatiquement les informations des cartes d'assurance santé à l'aide de l'OCR.

## 🎯 Fonctionnalités

- ✅ **Scan de carte** : Accès à la caméra (smartphone ou PC)
- ✅ **OCR automatique** : Extraction du texte avec Tesseract.js
- ✅ **Extraction de données** : Nom, Prénom, Numéro d'assurance, Assureur
- ✅ **Enregistrement** : Sauvegarde dans MongoDB
- ✅ **Interface web** : Affichage des cartes enregistrées
- ✅ **PWA** : Installable sur mobile et desktop

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript (vanilla)
- **OCR** : Tesseract.js (côté client)
- **Backend** : Node.js + Express
- **Base de données** : MongoDB avec Mongoose
- **PWA** : Service Worker + Manifest

## 📁 Structure du projet

```
prototype_cursor/
├── backend/
│   ├── server.js          # Serveur Express
│   └── config.example.js  # Exemple de configuration
├── frontend/
│   ├── index.html         # Page principale
│   ├── styles.css         # Styles CSS
│   ├── app.js             # Logique JavaScript
│   ├── service-worker.js  # Service Worker PWA
│   └── manifest.json      # Manifest PWA
├── vercel.json            # Configuration Vercel
├── .vercelignore          # Fichiers ignorés par Vercel
├── package.json           # Dépendances Node.js
└── README.md              # Ce fichier
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### Étapes d'installation

1. **Cloner ou télécharger le projet**

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer MongoDB**

   **Option A : MongoDB local**
   - Installer MongoDB sur votre machine
   - Démarrer MongoDB : `mongod` (ou via service)
   - La connexion se fera automatiquement sur `mongodb://localhost:27017/cartes-assurance`

   **Option B : MongoDB Atlas (cloud)**
   - Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créer un cluster gratuit
   - Récupérer l'URI de connexion
   - Créer un fichier `.env` dans le dossier `backend/` :
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance
     PORT=3000
     ```

4. **Démarrer le serveur**
   ```bash
   npm start
   ```
   
   Ou en mode développement avec auto-reload :
   ```bash
   npm run dev
   ```

5. **Accéder à l'application**
   - Ouvrir votre navigateur : `http://localhost:3000`
   - Sur mobile : utiliser l'IP de votre machine (ex: `http://192.168.1.100:3000`)

## ☁️ Déploiement sur Vercel

### Prérequis pour le déploiement

- Un compte [Vercel](https://vercel.com) (gratuit)
- Un cluster MongoDB Atlas (gratuit disponible)
- Le projet doit être poussé sur GitHub, GitLab ou Bitbucket

### Étapes de déploiement

1. **Préparer MongoDB Atlas**

   - Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créer un cluster gratuit (M0)
   - Créer un utilisateur de base de données avec un mot de passe
   - Autoriser l'accès depuis n'importe quelle IP (0.0.0.0/0) dans "Network Access"
   - Récupérer l'URI de connexion (format : `mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance`)

2. **Pousser le code sur Git**

   ```bash
   git add .
   git commit -m "Préparation pour déploiement Vercel"
   git push origin main
   ```

3. **Déployer sur Vercel**

   **Option A : Via l'interface Vercel (recommandé)**
   
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer sur "Add New Project"
   - Importer votre repository Git
   - Vercel détectera automatiquement la configuration

   **Option B : Via la CLI Vercel**
   
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

4. **Configurer les variables d'environnement**

   Dans le dashboard Vercel de votre projet :
   
   - Aller dans **Settings** → **Environment Variables**
   - Ajouter les variables suivantes :
     
     | Variable | Valeur | Description |
     |----------|--------|-------------|
     | `MONGODB_URI` | `mongodb+srv://...` | URI de connexion MongoDB Atlas |
     | `NODE_ENV` | `production` | Environnement de production |
   
   ⚠️ **Important** : Après avoir ajouté les variables, vous devez **redéployer** le projet pour qu'elles soient prises en compte.

5. **Redéployer le projet**

   - Dans le dashboard Vercel, aller dans **Deployments**
   - Cliquer sur les trois points (⋯) du dernier déploiement
   - Sélectionner **Redeploy**

### Configuration Vercel

Le projet inclut déjà un fichier `vercel.json` configuré pour :
- ✅ Servir les fichiers statiques du frontend
- ✅ Router les requêtes API vers le backend
- ✅ Configurer les headers de sécurité
- ✅ Gérer le Service Worker pour la PWA

### Vérification après déploiement

1. **Tester l'API**
   ```
   https://votre-projet.vercel.app/api/health
   ```
   Devrait retourner : `{"status":"OK","message":"API fonctionnelle"}`

2. **Tester le frontend**
   ```
   https://votre-projet.vercel.app/
   ```
   L'application devrait se charger correctement

3. **Tester la connexion MongoDB**
   - Essayer d'enregistrer une carte via l'interface
   - Vérifier les logs Vercel pour les erreurs éventuelles

### Variables d'environnement requises sur Vercel

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGODB_URI` | ✅ Oui | URI de connexion MongoDB Atlas |
| `NODE_ENV` | ⚠️ Recommandé | `production` pour Vercel |
| `PORT` | ❌ Non | Géré automatiquement par Vercel |

### Dépannage du déploiement

**Erreur : "MongoDB connection failed"**
- Vérifier que `MONGODB_URI` est correctement configurée dans Vercel
- Vérifier que l'IP 0.0.0.0/0 est autorisée dans MongoDB Atlas
- Vérifier les credentials MongoDB

**Erreur : "Cannot find module"**
- Vérifier que toutes les dépendances sont dans `package.json`
- Vérifier que `node_modules` n'est pas dans `.vercelignore`

**Le frontend ne charge pas**
- Vérifier que les fichiers sont dans le dossier `frontend/`
- Vérifier les routes dans `vercel.json`

**Le Service Worker ne fonctionne pas**
- Vérifier que l'application est en HTTPS (automatique sur Vercel)
- Vérifier les headers dans `vercel.json`

## 📱 Utilisation

### Scanner une carte

1. Cliquer sur **"Scanner la carte"**
2. Autoriser l'accès à la caméra
3. Positionner la carte dans le cadre
4. Cliquer sur **"Capturer"**
5. Cliquer sur **"Analyser avec OCR"**
6. Vérifier et corriger les informations extraites
7. Cliquer sur **"Enregistrer"**

### Consulter les cartes

Les cartes enregistrées s'affichent automatiquement dans la section "Cartes enregistrées". Utilisez le bouton **"Actualiser"** pour mettre à jour la liste.

## 🔧 Configuration

### Variables d'environnement

**En local :** Créer un fichier `.env` dans `backend/` :

```env
MONGODB_URI=mongodb://localhost:27017/cartes-assurance
PORT=3000
```

**Sur Vercel :** Configurer dans le dashboard (voir section Déploiement)

### Personnalisation de l'OCR

Le fichier `frontend/app.js` contient la fonction `extractInfoFromText()` qui peut être personnalisée pour améliorer l'extraction selon le format de vos cartes.

## 🧪 Données de test

Pour tester sans scanner, vous pouvez utiliser l'API directement :

```bash
curl -X POST http://localhost:3000/api/cartes \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "numeroAssurance": "1234567890123",
    "assureur": "CPAM"
  }'
```

## 📡 API REST

### POST /api/cartes
Enregistre une nouvelle carte.

**Body :**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "numeroAssurance": "1234567890123",
  "assureur": "CPAM"
}
```

**Réponse :**
```json
{
  "message": "Carte enregistrée avec succès",
  "carte": { ... }
}
```

### GET /api/cartes
Récupère toutes les cartes enregistrées.

**Réponse :**
```json
[
  {
    "_id": "...",
    "nom": "Dupont",
    "prenom": "Jean",
    "numeroAssurance": "1234567890123",
    "assureur": "CPAM",
    "dateEnregistrement": "2024-01-15T10:30:00.000Z"
  }
]
```

### GET /api/health
Vérifie l'état de l'API.

## 🔒 Sécurité

⚠️ **Ceci est un prototype** - Pour la production, ajouter :
- Authentification (JWT, OAuth)
- Validation stricte des données
- HTTPS obligatoire (automatique sur Vercel)
- Chiffrement des données sensibles
- Rate limiting
- CORS configuré correctement

## 🐛 Dépannage

### Erreur "Port déjà utilisé" (EADDRINUSE)

Si vous obtenez l'erreur `EADDRINUSE: address already in use :::3000` :

**Solution 1 : Libérer le port automatiquement**
```bash
node scripts/kill-port.js 3000
```

**Solution 2 : Utiliser un autre port**
Créer/modifier `backend/.env` :
```env
PORT=3001
```
Puis redémarrer le serveur et accéder à `http://localhost:3001`

**Solution 3 : Arrêter manuellement (Windows)**
```bash
# Trouver le processus
netstat -ano | findstr :3000

# Arrêter le processus (remplacer <PID> par le numéro trouvé)
taskkill /PID <PID> /F
```

**Solution 4 : Arrêter manuellement (Linux/Mac)**
```bash
# Trouver et arrêter le processus
lsof -ti:3000 | xargs kill -9
```

### La caméra ne s'ouvre pas
- Vérifier les permissions du navigateur
- Utiliser HTTPS (ou localhost)
- Tester sur un autre navigateur

### Erreur de connexion MongoDB
- Vérifier que MongoDB est démarré (en local)
- Vérifier l'URI dans `.env` (en local) ou dans Vercel (en production)
- Vérifier les credentials MongoDB Atlas

### OCR ne fonctionne pas
- Vérifier la connexion internet (Tesseract.js charge des modèles)
- Améliorer la qualité de l'image
- Ajuster la fonction `extractInfoFromText()`

## 📝 Notes

- L'OCR fonctionne mieux avec des images de bonne qualité et un bon éclairage
- Les résultats OCR peuvent nécessiter une correction manuelle
- Pour améliorer l'extraction, adapter les patterns dans `extractInfoFromText()`
- Les icônes PWA (icon-192.png, icon-512.png) doivent être ajoutées pour une installation complète
- Sur Vercel, l'application est automatiquement en HTTPS, ce qui est requis pour la caméra et le Service Worker

## 📄 Licence

MIT

## 👨‍💻 Auteur

Prototype développé pour démonstration des fonctionnalités PWA et OCR.
