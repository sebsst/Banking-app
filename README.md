# Banking App - Gestion de Comptes Bancaires

Une application complète de gestion de comptes bancaires développée avec Node.js, React et PostgreSQL.

## Fonctionnalités

### Backend (Node.js + Express + PostgreSQL)
- ✅ Authentification JWT
- ✅ Gestion des utilisateurs (inscription/connexion)
- ✅ CRUD des banques
- ✅ CRUD des comptes bancaires (courant/épargne)
- ✅ CRUD des soldes avec filtres et pagination
- ✅ API REST complète avec validation
- ✅ Gestion des erreurs et sécurité basique

### Frontend (React + Material-UI)
- ✅ Interface moderne avec Material-UI
- ✅ Authentification (connexion/inscription)
- ✅ Gestion des banques (création, modification, suppression)
- ✅ Gestion des comptes avec sélection de banque et solde initial
- ✅ Gestion des soldes avec filtres (compte, banque, dates)
- ✅ Graphiques d'évolution avec Chart.js
- ✅ Filtres de dates prédéfinis (1j, 7j, 30j, 6m, 1a, tout)
- ✅ Design responsive

### Base de données
- ✅ Modèle relationnel PostgreSQL
- ✅ Tables : Users, Banks, Accounts, Balances
- ✅ Relations et contraintes
- ✅ Migrations automatiques avec Sequelize

## Installation et Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Installation manuelle

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd banking-app
```

2. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb banking_app
```

3. **Backend**
```bash
cd backend
npm install
cp .env.example .env
# Modifier les variables dans .env selon votre configuration
npm run dev
```

4. **Frontend**
```bash
cd frontend
npm install
npm start
```

### Installation avec Docker (Recommandée)

1. **Démarrer tous les services**
```bash
docker-compose up -d
```

2. **Accéder à l'application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Base de données: localhost:5432

## Structure du Projet

```
banking-app/
├── backend/                 # API Node.js
│   ├── models/             # Modèles Sequelize
│   ├── routes/             # Routes API
│   ├── middleware/         # Middlewares (auth, validation)
│   └── config/             # Configuration DB
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── services/       # Services API
│   │   ├── contexts/       # Contextes React
│   │   └── utils/          # Utilitaires
│   └── public/
└── docker-compose.yml      # Configuration Docker
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur courant

### Banques
- `GET /api/banks` - Lister les banques
- `POST /api/banks` - Créer une banque
- `PUT /api/banks/:id` - Modifier une banque
- `DELETE /api/banks/:id` - Supprimer une banque

### Comptes
- `GET /api/accounts` - Lister les comptes
- `POST /api/accounts` - Créer un compte
- `PUT /api/accounts/:id` - Modifier un compte
- `DELETE /api/accounts/:id` - Supprimer un compte

### Soldes
- `GET /api/balances` - Lister les soldes (avec filtres)
- `POST /api/balances` - Créer un solde
- `PUT /api/balances/:id` - Modifier un solde
- `DELETE /api/balances/:id` - Supprimer un solde
- `GET /api/balances/chart/data` - Données pour graphiques

## Utilisation

1. **Créer un compte utilisateur** via l'interface d'inscription
2. **Ajouter des banques** (BNP Paribas, Crédit Agricole, etc.)
3. **Créer des comptes bancaires** en associant une banque et un solde initial
4. **Suivre l'évolution** en ajoutant régulièrement les soldes
5. **Visualiser les graphiques** pour analyser l'évolution financière

## Variables d'Environnement

### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banking_app
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

## Technologies Utilisées

### Backend
- Node.js & Express.js
- PostgreSQL & Sequelize ORM
- JWT pour l'authentification
- Express Validator
- bcryptjs pour le hachage des mots de passe

### Frontend
- React 18
- Material-UI (MUI) pour l'interface
- Chart.js & react-chartjs-2 pour les graphiques
- Axios pour les appels API
- date-fns pour la gestion des dates
- React Router pour la navigation

### DevOps
- Docker & Docker Compose
- PostgreSQL en conteneur

## Développement

### Scripts disponibles

**Backend:**
- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer avec nodemon

**Frontend:**
- `npm start` - Démarrer l'application React
- `npm run build` - Build de production

### Ajouts possibles
- Tests unitaires et d'intégration
- Authentification à deux facteurs
- Export des données (CSV, PDF)
- Notifications par email
- Sauvegarde automatique des données
- Dashboard avec statistiques avancées
- API de banques pour synchronisation automatique

## Licence

MIT