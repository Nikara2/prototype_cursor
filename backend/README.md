# Configuration Backend

## Variables d'environnement

Créer un fichier `.env` dans ce dossier avec le contenu suivant :

```env
MONGODB_URI=mongodb://localhost:27017/cartes-assurance
PORT=3000
```

### MongoDB Local

Si vous utilisez MongoDB en local :
```env
MONGODB_URI=mongodb://localhost:27017/cartes-assurance
```

### MongoDB Atlas (Cloud)

Si vous utilisez MongoDB Atlas :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance
```

Remplacez `username`, `password` et `cluster` par vos propres valeurs.

## Test de l'API

Pour tester l'API avec des données de test :

```bash
node backend/test-api.js
```

Assurez-vous que le serveur est démarré avant d'exécuter les tests.

