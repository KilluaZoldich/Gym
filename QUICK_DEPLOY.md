# Guida Rapida Deploy GitHub Pages

## Metodo 1: Manuale (Raccomandato)

### 1. Installa dipendenza
```bash
npm install gh-pages --save-dev
```

### 2. Modifica package.json
Aggiungi questi script:
```json
{
  "scripts": {
    "export": "next build && next export",
    "deploy": "next build && next export && gh-pages -d out"
  },
  "homepage": "https://TUO_USERNAME.github.io/NOME_REPO"
}
```

### 3. Configura next.config.ts
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/NOME_REPO' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/NOME_REPO' : '',
}

export default nextConfig
```

### 4. Crea repository GitHub
- Vai su github.com → New repository
- Nome: `NOME_REPO`
- Rendilo pubblico

### 5. Push su GitHub
```bash
git init
git remote add origin https://github.com/TUO_USERNAME/NOME_REPO.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 6. Deploy
```bash
npm run deploy
```

### 7. Abilita GitHub Pages
- Settings → Pages
- Source: gh-pages branch
- Folder: / (root)

## Metodo 2: Script Automatico

Esegui lo script:
```bash
./deploy-github.sh
```

Segui le istruzioni e inserisci:
- Il tuo username GitHub
- Il nome del repository

## URL del Sito

Il tuo sito sarà disponibile a:
```
https://TUO_USERNAME.github.io/NOME_REPO
```

## Aggiornamenti

Dopo ogni modifica:
```bash
git add .
git commit -m "Update"
git push origin main
npm run deploy
```

## Problemi Comuni

- **Immagini non caricate**: Controlla `unoptimized: true` in next.config.ts
- **Routing rotto**: Controlla `trailingSlash: true`
- **Errore 404**: Aspetta 5-10 minuti dopo il deploy
- **Repository privato**: GitHub Pages richiede repo pubblici (o account Pro)