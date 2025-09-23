# Guide d'Installation - Banking App

## Étapes d'installation complète

### 1. Récupération du projet

Vous disposez de tous les fichiers dans les artifacts ci-dessus. Voici comment les organiser :

```bash
# Créer la structure
mkdir -p banking-app/{backend/{models,routes,middleware,config},frontend/{src/{components/{Auth,Banks,Accounts,Balances,common},services,utils,contexts},public}}
```

### 2. Copier les fichiers depuis les artifacts

**Backend :**
- `backend/package.json`
- `backend/server.js`
- `backend/.env.example`
- `backend/config/database.js`
- `backend/models/index.js`
- `backend/models/User.js`
- `backend/models/Bank.js`
- `backend/models/Account.js`
- `backend/models/Balance.js`
- `backend/middleware/auth.js`
- `backend/routes/auth.js`
- `backend/routes/banks.js`
- `backend/routes/accounts.js`
- `backend/routes/balances.js`
- `backend/Dockerfile`
- `backend/.dockerignore`

**Frontend :**
- `frontend/package.json`
- `frontend/public/index.html`
- `frontend/src/index.js`
- `frontend/src/App.js`
- `frontend/src/contexts/AuthContext.js`
- `frontend/src/services/api.js`
- `frontend/src/utils/dateUtils.js`
- `frontend/src/components/Layout.js`
- `frontend/src/components/Auth/Login.js`
- `frontend/src/components/Auth/Register.js`
- `frontend/src/components/Banks/BankList.js`
- `frontend/src/components/Banks/BankDialog.js`
- `frontend/src/components/Accounts/AccountList.js`
- `frontend/src/components/Accounts/AccountDialog.js`
- `frontend/src/components/Balances/BalanceList.js`
- `frontend/src/components/Balances/BalanceDialog.js`
- `frontend/src/components/Balances/BalanceChart.js`
- `frontend/src/components/common/DateFilters.js`
- `frontend/src/components/common/ConfirmDialog.js`
- `frontend/Dockerfile`
- `frontend/.dockerignore`

**Racine :**
- `docker-compose.yml`
- `README.md`
- `.gitignore`

### 3. Installation avec Docker (Recommandé)

```bash
# Aller dans le dossier du projet
cd banking-app

# Démarrer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

**Accès :**
- Frontend : http://localhost:3000
- Backend : http://localhost:5000/api
- Base de données : localhost:5432

### 4. Installation manuelle

#### Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm

#### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifier les variables selon votre configuration PostgreSQL

# Créer la base de données (PostgreSQL requis)
createdb banking_app

# Démarrer le serveur de développement
npm run dev
```

#### Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application React
npm start
```

### 5. Premier démarrage

1. **Ouvrir http://localhost:3000**
2. **Créer un compte utilisateur** via "S'inscrire"
3. **Ajouter des banques** (ex: BNP Paribas, Crédit Agricole)
4. **Créer des comptes bancaires** en associant des banques
5. **Ajouter des soldes** pour suivre l'évolution
6. **Consulter les graphiques** d'évolution

### 6. Structure de données

L'application va créer automatiquement les tables suivantes :
- `Users` : Utilisateurs de l'application
- `Banks` : Banques disponibles
- `Accounts` : Comptes bancaires des utilisateurs
- `Balances` : Historique des soldes par compte

### 7. Fonctionnalités disponibles

- ✅ **Authentification** : Inscription et connexion sécurisées
- ✅ **Gestion des banques** : CRUD complet
- ✅ **Gestion des comptes** : Création avec solde initial
- ✅ **Suivi des soldes** : Historique avec filtres
- ✅ **Graphiques** : Évolution temporelle avec Chart.js
- ✅ **Filtres avancés** : Par dates, comptes, banques
- ✅ **Interface responsive** : Material-UI moderne

### 8. Résolution de problèmes

#### Problème de base de données
```bash
# Vérifier que PostgreSQL est démarré
sudo service postgresql start

# Créer la base si elle n'existe pas
createdb banking_app
```

#### Erreur de dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### Erreur de port
```bash
# Changer les ports dans docker-compose.yml ou .env
# Par défaut : Frontend 3000, Backend 5000, DB 5432
```

### 9. Variables d'environnement importantes

**Backend (.env) :**
```
PORT=5000
DB_HOST=localhost
DB_NAME=banking_app
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=changez_cette_clé_secrète
```

**Frontend :**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 10. Tests et validation

Une fois démarrée, l'application doit permettre :
1. Inscription et connexion utilisateur
2. Création de banques
3. Ajout de comptes avec IBAN
4. Saisie de soldes avec dates
5. Visualisation graphique de l'évolution
6. Filtrage par périodes et comptes

### Support

En cas de problème :
1. Vérifiez les logs Docker : `docker-compose logs`
2. Vérifiez la connexion DB : `docker-compose exec postgres psql -U postgres banking_app`
3. Testez l'API : http://localhost:5000/api/health

L'application est maintenant prête à l'emploi ! 🎉