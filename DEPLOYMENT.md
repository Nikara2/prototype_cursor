# 🚀 Déploiement sur Vercel

Ce guide explique comment déployer l'application sur Vercel après les changements serverless.

## ✅ Prérequis

1. **Compte Vercel** : créez-en un gratuitement sur [vercel.com](https://vercel.com)
2. **MongoDB Atlas** : créez un cluster gratuit sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Git** : votre projet doit être dans un repo GitHub, GitLab ou Bitbucket

## 📋 Étape 1 : Créer un cluster MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte ou connectez-vous
3. Créez un **nouveau cluster** (option gratuit M0)
4. Dans "Database Access", créez un nouvel utilisateur (note le username et password)
5. Dans "Network Access", ajoutez votre IP ou autorisez `0.0.0.0/0` (accès global pour Vercel)
6. Cliquez sur le cluster et copiez l'URI de connexion :
   - Format : `mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance?retryWrites=true&w=majority`
   - Remplacez `username` et `password` par vos identifiants

## 🔧 Étape 2 : Configuration locale (.env)

Créez un fichier `.env` à la racine du projet :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance?retryWrites=true&w=majority
```

Testez localement :

```bash
npm install
npx vercel dev
```

Puis ouvrez `http://localhost:3000/api/health` pour vérifier que la connexion MongoDB fonctionne.

## 📤 Étape 3 : Pousser vers GitHub

```bash
git add .
git commit -m "Add serverless API for Vercel deployment"
git push origin main
```

## 🌐 Étape 4 : Déployer sur Vercel

### Option A : Via le dashboard Vercel (recommandé)

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"New Project"**
3. Connectez votre repo GitHub/GitLab/Bitbucket
4. Sélectionnez votre projet `prototype_cursor`
5. Vercel détecte automatiquement la configuration `vercel.json`
6. Allez à **Settings > Environment Variables**
7. Ajoutez une nouvelle variable :
   - **Name** : `MONGODB_URI`
   - **Value** : votre URI MongoDB Atlas (de l'étape 1)
8. Cliquez sur **Deploy**

### Option B : Via la CLI Vercel

```bash
# Se connecter à Vercel
vercel login

# Déployer
vercel --prod

# À la première exécution, ajoutez les variables d'environnement quand demandé
# Ou configurez-les dans vercel env add MONGODB_URI production
```

## ✅ Vérification après déploiement

1. Allez sur votre URL Vercel (ex: `https://votre-app.vercel.app`)
2. Testez l'endpoint santé :
   ```
   https://votre-app.vercel.app/api/health
   ```
   Devrait retourner :
   ```json
   {
     "status": "OK",
     "message": "API fonctionnelle",
     "mongodb": "✅ Configured",
     "timestamp": "2024-01-15T..."
   }
   ```

3. Testez POST/GET sur `/api/cartes` depuis le frontend
4. Vérifiez les logs avec :
   ```bash
   vercel logs <your-url> --since 1h
   ```

## 🐛 Dépannage

### ❌ Erreur 404 sur /api/cartes

**Cause** : `MONGODB_URI` non défini ou incorrecte

**Solutions** :
1. Vérifiez que `MONGODB_URI` est définie dans Environment Variables (Vercel Settings)
2. Testez l'URI en local avec `npx vercel dev`
3. Vérifiez que votre cluster MongoDB Atlas est actif

### ❌ "MONGODB_URI not set" dans les logs

**Cause** : Variable non propagée

**Solutions** :
1. Supprimez la variable et réajoutez-la
2. Redéployez : `vercel --prod`
3. Attendez quelques minutes avant de tester

### ❌ Erreur de connexion "timeout"

**Cause** : Firewall MongoDB Atlas ou IP non autorisée

**Solutions** :
1. Dans MongoDB Atlas > Network Access
2. Autorisez `0.0.0.0/0` ou l'IP de Vercel
3. Testez la connexion avec un outil comme MongoDB Compass

### ✅ Succès

Vous devriez voir :
- Frontend chargé sur la racine `/`
- API accessible sur `/api/cartes`
- CORS configuré (requêtes cross-origin autorisées)
- Logs visibles dans Vercel dashboard

## 📊 Architecture Vercel

```
vercel.json déploie :

/api/cartes/index.js    → fonction serverless POST/GET /api/cartes
/api/health.js          → fonction serverless GET /api/health
/api/mongoose.js        → module partagé (connection caching)
/frontend/*             → fichiers statiques (HTML/CSS/JS)
```

## 🔄 Mise à jour du déploiement

Pour les prochaines mises à jour :

```bash
# Développement local
npx vercel dev

# Commit et push
git add .
git commit -m "..."
git push origin main

# Vercel redéploie automatiquement
# Ou : vercel --prod
```

## 💡 Conseils

- **Logs** : consultez régulièrement `vercel logs` pour déboguer
- **Variables d'env** : testez toujours localement avec `.env` avant de déployer
- **Monitoring** : activez Analytics dans Vercel Settings
- **Domaine personnalisé** : ajoutez dans Vercel Settings > Domains

## ❓ Questions fréquentes

**Q: Puis-je utiliser MongoDB local au lieu d'Atlas ?**
A: Non, Vercel n'a pas accès aux DB locales. Utilisez MongoDB Atlas (gratuit).

**Q: Comment augmenter la limite de requêtes ?**
A: Vérifiez votre plan Vercel. Les plans Pro offrent plus de serverless functions.

**Q: Les connexions MongoDB s'accumulent ?**
A: Non, `api/mongoose.js` cache la connexion globalement (déjà optimisé).

**Q: Peut-on ajouter d'autres endpoints ?**
A: Oui, créez des fichiers dans `api/` (ex: `api/cartes/[id].js` pour les routes dynamiques).
