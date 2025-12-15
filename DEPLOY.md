# 🚀 Guide de déploiement Vercel - Rapide

## Checklist avant déploiement

- [ ] Code poussé sur Git (GitHub, GitLab ou Bitbucket)
- [ ] MongoDB Atlas configuré avec un cluster
- [ ] URI MongoDB récupérée
- [ ] Compte Vercel créé

## Étapes rapides

### 1. MongoDB Atlas
1. Créer un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un utilisateur DB (username + password)
3. Network Access → Add IP Address → `0.0.0.0/0` (toutes les IPs)
4. Database → Connect → Copy connection string
5. Remplacer `<password>` par votre mot de passe dans l'URI

### 2. Vercel
1. Aller sur [vercel.com](https://vercel.com) → New Project
2. Importer votre repository Git
3. Vercel détecte automatiquement la config (vercel.json)

### 3. Variables d'environnement
Dans Vercel → Settings → Environment Variables :

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/cartes-assurance
NODE_ENV = production
```

### 4. Redéployer
- Deployments → ⋯ → Redeploy

## Test

1. **API Health** : `https://votre-projet.vercel.app/api/health`
2. **Frontend** : `https://votre-projet.vercel.app/`

## Problèmes courants

**Erreur MongoDB** → Vérifier l'URI et les permissions réseau (0.0.0.0/0)

**404 sur les fichiers** → Vérifier que les fichiers sont dans `frontend/`

**Service Worker ne fonctionne pas** → Normal, nécessite HTTPS (automatique sur Vercel)

## Support

Voir le README.md pour plus de détails.

