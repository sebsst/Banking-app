#!/bin/bash

# Script pour créer l'architecture complète du projet banking-app
echo "Création de l'architecture du projet banking-app..."

# Créer la structure des dossiers
mkdir -p banking-app/{backend/{models,routes,middleware,config,migrations},frontend/{src/{components/{Auth,Banks,Accounts,Balances,common},services,utils,contexts},public}}

# Créer les fichiers backend
echo "Création des fichiers backend..."

# package.json backend
cat > banking-app/backend/package.json << 'EOF'
{
  "name": "banking-app-backend",
  "version": "1.0.0",
  "description": "API REST pour l'application de gestion de comptes bancaires",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "sequelize": "^6.35.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["banking", "nodejs", "api"],
  "author": "",
  "license": "MIT"
}
EOF

# .env.example
cat > banking-app/backend/.env.example << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banking_app
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
EOF

# server.js (contenu dans les artifacts précédents)
# Les autres fichiers backend seront créés selon les artifacts

# Créer les fichiers frontend
echo "Création des fichiers frontend..."

# package.json frontend
cat > banking-app/frontend/package.json << 'EOF'
{
  "name": "banking-app-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.1",
    "@mui/material": "^5.15.1",
    "@mui/x-date-pickers": "^6.18.3",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "chartjs-adapter-date-fns": "^3.0.0",
    "date-fns": "^2.30.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:5000"
}
EOF

# Créer docker-compose.yml
cat > banking-app/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: banking_app
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=banking_app
      - DB_USER=postgres
      - DB_PASSWORD=password
      - JWT_SECRET=your_super_secret_jwt_key_here
      - JWT_EXPIRES_IN=7d
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
EOF

# Créer .gitignore
cat > banking-app/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Build outputs
build/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Database
*.sqlite
*.sqlite3

# Docker
.docker/

# Temporary files
temp/
tmp/
EOF

echo "Structure de base créée ! Vous devez maintenant copier le contenu des artifacts pour compléter les fichiers."
echo ""
echo "Instructions pour finaliser :"
echo "1. Copiez tous les contenus des artifacts dans leurs fichiers respectifs"
echo "2. cd banking-app"
echo "3. Pour démarrage rapide avec Docker : docker-compose up -d"
echo "4. Ou installation manuelle :"
echo "   - Backend : cd backend && npm install && npm run dev"
echo "   - Frontend : cd frontend && npm install && npm start"
echo ""
echo "L'application sera disponible sur :"
echo "- Frontend : http://localhost:3000"
echo "- Backend API : http://localhost:5000/api"

# Créer le zip
echo "Création du fichier ZIP..."
cd banking-app
zip -r ../banking-app-complete.zip . -x "node_modules/*" ".git/*"
cd ..

echo "✅ Projet créé avec succès !"
echo "📁 Dossier : banking-app/"
echo "📦 Archive : banking-app-complete.zip"