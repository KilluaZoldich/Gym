# Guida per Deployare la WebApp Gym su GitHub Pages

## Prerequisiti
- Account GitHub creato
- Node.js installato sul tuo computer
- Progetto scaricato sul desktop

## Passaggio 1: Preparazione del Repository Locale

### 1.1 Apri il terminale e naviga nella cartella del progetto
```bash
cd ~/Desktop/nome-del-tuo-progetto
```

### 1.2 Inizializza Git (se non già fatto)
```bash
git init
```

### 1.3 Crea un file .gitignore per escludere file non necessari
```bash
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
```

## Passaggio 2: Installazione delle Dipendenze per il Deploy

### 2.1 Installa gh-pages per il deploy su GitHub Pages
```bash
npm install gh-pages --save-dev
```

### 2.2 Aggiorna package.json per supportare il deploy
Apri `package.json` e aggiungi queste righe:
```json
{
  "name": "gym-webapp",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export",
    "deploy": "next build && next export && gh-pages -d out"
  },
  "homepage": "https://[TUO_USERNAME_GITHUB].github.io/[NOME_REPO]",
  "dependencies": {
    // ... le tue dipendenze esistenti
  },
  "devDependencies": {
    "gh-pages": "^5.0.0"
    // ... altre dipendenze di sviluppo
  }
}
```

## Passaggio 3: Configurazione di Next.js per GitHub Pages

### 3.1 Crea o aggiorna next.config.ts
```bash
cat > next.config.ts << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? '/[NOME_REPO]' 
    : '',
  basePath: process.env.NODE_ENV === 'production' 
    ? '/[NOME_REPO]' 
    : '',
}

export default nextConfig
EOF
```

**Nota:** Sostituisci `[NOME_REPO]` con il nome che darai al tuo repository GitHub.

## Passaggio 4: Creazione del Repository su GitHub

### 4.1 Vai su [github.com](https://github.com) e accedi al tuo account

### 4.2 Crea un nuovo repository:
1. Clicca sul "+" in alto a destra
2. Seleziona "New repository"
3. Dai un nome al repository (es: "gym-webapp")
4. Impostalo come "Public"
5. Non aggiungere README, .gitignore o license
6. Clicca su "Create repository"

## Passaggio 5: Collegamento e Push del Progetto

### 5.1 Collega il repository locale a GitHub
```bash
git remote add origin https://github.com/[TUO_USERNAME_GITHUB]/[NOME_REPO].git
git branch -M main
```

### 5.2 Aggiungi tutti i file al repository
```bash
git add .
```

### 5.3 Crea il primo commit
```bash
git commit -m "Initial commit: Gym WebApp"
```

### 5.4 Pusha il codice su GitHub
```bash
git push -u origin main
```

## Passaggio 6: Deploy su GitHub Pages

### 6.1 Esegui il comando di deploy
```bash
npm run deploy
```

Questo comando:
1. Costruirà il progetto Next.js
2. Esporterà i file statici nella cartella `out`
3. Pusherà i file su un branch chiamato `gh-pages`

## Passaggio 7: Configurazione di GitHub Pages

### 7.1 Vai sul tuo repository su GitHub

### 7.2 Abilita GitHub Pages:
1. Clicca su "Settings"
2. Nel menu a sinistra, clicca su "Pages"
3. Sotto "Source", seleziona "Deploy from a branch"
4. Seleziona il branch "gh-pages"
5. Seleziona la cartella "/ (root)"
6. Clicca su "Save"

### 7.3 Attendi qualche minuto
GitHub impiega qualche minuto per processare il deploy. Vedrai un messaggio come:
"Your site is ready to be published at https://[TUO_USERNAME_GITHUB].github.io/[NOME_REPO]"

## Passaggio 8: Verifica del Deploy

### 8.1 Visita il tuo sito
Apri il browser e vai a:
```
https://[TUO_USERNAME_GITHUB].github.io/[NOME_REPO]
```

### 8.2 Verifica che tutto funzioni:
- Le schermate si caricano correttamente
- Il PWA funziona (puoi installare l'app)
- I timer funzionano
- Le schede di allenamento sono visibili

## Troubleshooting Comuni

### Problema: Le immagini non si caricano
**Soluzione:** Assicurati di aver impostato `unoptimized: true` in next.config.ts

### Problema: Il routing non funziona
**Soluzione:** Verifica che `trailingSlash: true` sia impostato in next.config.ts

### Problema: Il deploy fallisce
**Soluzione:** Controlla che tutte le dipendenze siano installate correttamente con `npm install`

### Problema: Il sito è bianco o dà errori JavaScript
**Soluzione:** 
1. Controlla la console del browser per errori
2. Verifica che i percorsi in assetPrefix e basePath siano corretti
3. Controlla che il repository sia pubblico

## Aggiornamenti Futuri

Per aggiornare il sito dopo aver fatto modifiche:

```bash
# Aggiungi le modifiche
git add .
git commit -m "Descrizione delle modifiche"

# Pusha sul branch main
git push origin main

# Esegui il deploy
npm run deploy
```

## Note Importanti

1. **Repository Pubblico:** GitHub Pages funziona solo con repository pubblici (a meno che non hai un account GitHub Pro)

2. **Performance:** GitHub Pages è ottimo per progetti statici, ma per applicazioni complesse con backend, considera alternative come Vercel o Netlify

3. **Custom Domain:** Puoi configurare un dominio personalizzato nelle impostazioni di GitHub Pages

4. **HTTPS:** GitHub Pages fornisce automaticamente HTTPS per il tuo sito

Congratulazioni! La tua webapp gym è ora online e accessibile a chiunque abbia il link.