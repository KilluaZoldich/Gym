# Scheda Allenamento - PWA

Un'applicazione web progressiva (PWA) per gestire schede di allenamento e tracciare i progressi in palestra. Ottimizzata per dispositivi mobili, in particolare iPhone 16 Pro.

## 🚀 Caratteristiche

- **PWA Completa**: Installabile su dispositivi mobili con funzionalità offline
- **Responsive Design**: Ottimizzata per iPhone 16 Pro e altri dispositivi mobili
- **Gestione Schede**: Crea, modifica e duplica schede di allenamento personalizzate
- **Tracking Allenamenti**: Registra serie, ripetizioni e pesi per ogni esercizio
- **Timer di Riposo**: Timer automatico tra le serie
- **Dati Persistenti**: Utilizza localStorage per mantenere i dati localmente
- **Template Predefiniti**: Schede di allenamento già pronte per iniziare subito

## 🛠️ Tecnologie Utilizzate

- **Next.js 15** - Framework React con export statico
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Styling utility-first
- **Shadcn/ui** - Componenti UI moderni
- **Lucide React** - Icone
- **UUID** - Generazione ID univoci
- **Sonner** - Notifiche toast

## 📱 Installazione come PWA

### Su iPhone/iPad:
1. Apri l'app in Safari
2. Tocca il pulsante "Condividi" (quadrato con freccia)
3. Scorri e tocca "Aggiungi alla schermata Home"
4. Tocca "Aggiungi" per confermare

### Su Android:
1. Apri l'app in Chrome
2. Tocca il menu (tre punti)
3. Tocca "Aggiungi alla schermata Home"
4. Tocca "Aggiungi" per confermare

## 🚀 Deploy su GitHub Pages

Questa applicazione è configurata per il deploy automatico su GitHub Pages.

### Setup Iniziale

1. **Crea un nuovo repository su GitHub**
2. **Abilita GitHub Pages**:
   - Vai su Settings > Pages
   - Source: "GitHub Actions"
3. **Push del codice**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```

### Deploy Automatico

Il workflow GitHub Actions (`.github/workflows/deploy.yml`) si attiva automaticamente:
- Ad ogni push su `main`
- Ad ogni pull request su `main`

L'app sarà disponibile su: `https://USERNAME.github.io/REPOSITORY`

### Configurazione Repository

Se il nome del repository è diverso da "Scheda", aggiorna:

1. **next.config.ts**:
   ```typescript
   basePath: process.env.NODE_ENV === 'production' ? '/NOME-REPOSITORY' : '',
   assetPrefix: process.env.NODE_ENV === 'production' ? '/NOME-REPOSITORY/' : '',
   ```

2. **public/manifest.json**:
   ```json
   "start_url": "/NOME-REPOSITORY/",
   "scope": "/NOME-REPOSITORY/",
   ```

3. **src/app/layout.tsx**: Aggiorna tutti i path delle icone

## 🏃‍♂️ Sviluppo Locale

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Test del build statico
npm run build && npx serve out
```

## 📁 Struttura del Progetto

```
src/
├── app/
│   ├── layout.tsx          # Layout principale con meta PWA
│   ├── page.tsx             # Componente principale dell'app
│   └── globals.css          # Stili globali
├── components/ui/           # Componenti UI riutilizzabili
├── hooks/                   # Custom hooks React
└── lib/
    ├── api-static.ts        # API client per localStorage
    └── utils.ts             # Utility functions

public/
├── manifest.json            # Manifest PWA
├── icon-*.png              # Icone PWA
└── apple-touch-icon.png    # Icona iOS

.github/workflows/
└── deploy.yml              # Workflow GitHub Actions
```

## 🎯 Funzionalità Principali

### Gestione Schede
- Creazione schede personalizzate
- Template predefiniti (Forza Completa, Upper Body, Lower Body, Cardio & Forza)
- Duplicazione schede esistenti
- Modifica ed eliminazione

### Allenamento
- Avvio sessioni di allenamento
- Registrazione serie con peso e ripetizioni
- Timer di riposo automatico
- Navigazione tra esercizi
- Completamento allenamento con statistiche

### Dati e Persistenza
- Salvataggio automatico in localStorage
- Dati di esempio precaricati
- Sincronizzazione stato UI
- Gestione errori e loading states

## 🔧 Personalizzazione

### Colori e Tema
Modifica `src/app/globals.css` per personalizzare i colori:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* Altri colori... */
}
```

### Template di Allenamento
Aggiungi nuovi template in `src/app/page.tsx`:

```typescript
const workoutTemplates = {
  "nuovo-template": {
    name: "Nome Template",
    description: "Descrizione",
    exercises: [
      // Esercizi...
    ]
  }
};
```

## 📱 Ottimizzazioni Mobile

- **Safe Areas**: Supporto per notch e Dynamic Island
- **Touch Friendly**: Pulsanti e aree touch ottimizzate
- **Viewport**: Configurazione viewport per PWA
- **Performance**: Lazy loading e ottimizzazioni bundle
- **Offline**: Funzionalità base offline tramite localStorage

## 🐛 Troubleshooting

### Build Fallisce
- Verifica che non ci siano API routes in `src/app/api/`
- Controlla la sintassi JSON in `package.json`
- Assicurati che `output: 'export'` sia in `next.config.ts`

### PWA Non Si Installa
- Verifica che `manifest.json` sia accessibile
- Controlla i path delle icone
- Assicurati che l'app sia servita via HTTPS

### Dati Non Persistono
- Verifica che localStorage sia supportato
- Controlla la console per errori JavaScript
- Assicurati che `initializeSampleData()` sia chiamata

## 📄 Licenza

MIT License - Sentiti libero di usare questo progetto per i tuoi allenamenti!

## 🤝 Contributi

I contributi sono benvenuti! Apri una issue o una pull request per miglioramenti e correzioni.

---

**Buon allenamento! 💪**