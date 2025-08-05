#!/bin/bash

# Script per deploy automatico su GitHub Pages
# Esegui questo script nella cartella del progetto

echo "=== Script di Deploy per GitHub Pages ==="
echo

# Controlla se git è inizializzato
if [ ! -d ".git" ]; then
    echo "Inizializzazione di Git..."
    git init
fi

# Chiede le informazioni necessarie
read -p "Inserisci il tuo username GitHub: " github_username
read -p "Inserisci il nome del repository: " repo_name

# Aggiorna package.json con le dipendenze necessarie
echo "Installazione di gh-pages..."
npm install gh-pages --save-dev

# Crea .gitignore se non esiste
if [ ! -f ".gitignore" ]; then
    echo "Creazione di .gitignore..."
    cat > .gitignore << EOF
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
fi

# Aggiorna package.json con gli script di deploy
echo "Aggiornamento di package.json..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.export = 'next build && next export';
packageJson.scripts.deploy = 'next build && next export && gh-pages -d out';
packageJson.homepage = 'https://' + '$github_username' + '.github.io/' + '$repo_name';

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Crea/aggiorna next.config.ts
echo "Creazione di next.config.ts..."
cat > next.config.ts << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? '/$repo_name' 
    : '',
  basePath: process.env.NODE_ENV === 'production' 
    ? '/$repo_name' 
    : '',
}

export default nextConfig
EOF

echo
echo "Configurazione completata!"
echo
echo "Ora segui questi passaggi:"
echo "1. Crea un repository su GitHub: https://github.com/new"
echo "2. Nome repository: $repo_name"
echo "3. Rendilo pubblico"
echo "4. Esegui questi comandi:"
echo
echo "git remote add origin https://github.com/$github_username/$repo_name.git"
echo "git branch -M main"
echo "git add ."
echo "git commit -m 'Initial commit: Gym WebApp'"
echo "git push -u origin main"
echo "npm run deploy"
echo
echo "5. Vai su Settings > Pages del tuo repository GitHub"
echo "6. Seleziona 'gh-pages' branch come source"
echo "7. Attendi il completamento del deploy"
echo
echo "Il tuo sito sarà disponibile a: https://$github_username.github.io/$repo_name"