# Istruzioni per il Deploy su GitHub Pages

## Repository: https://github.com/KilluaZoldich/Gym

L'applicazione è stata configurata per il deploy automatico su GitHub Pages con la nuova repository.

## Configurazioni Aggiornate

✅ **next.config.ts**: Configurato con basePath '/Gym'
✅ **manifest.json**: Aggiornato con i path corretti '/Gym/'
✅ **layout.tsx**: Icone e manifest aggiornati per '/Gym/'
✅ **GitHub Actions**: Workflow configurato per deploy automatico
✅ **Build statico**: Testato e funzionante

## Passi per il Deploy

1. **Inizializza Git** (se non già fatto):
   ```bash
   git init
   ```

2. **Aggiungi tutti i file**:
   ```bash
   git add .
   git commit -m "Initial commit - Gym app ready for GitHub Pages"
   ```

3. **Collega la repository**:
   ```bash
   git remote add origin https://github.com/KilluaZoldich/Gym.git
   git branch -M main
   ```

4. **Push del codice**:
   ```bash
   git push -u origin main
   ```

5. **Abilita GitHub Pages**:
   - Vai su https://github.com/KilluaZoldich/Gym/settings/pages
   - Source: "GitHub Actions"
   - Il deploy partirà automaticamente

## URL dell'App

Dopo il deploy, l'app sarà disponibile su:
**https://killuazoldich.github.io/Gym/**

## Funzionalità

- ✅ PWA completa ottimizzata per iPhone 16 Pro
- ✅ Gestione schede di allenamento
- ✅ Timer per esercizi e riposo
- ✅ Tracciamento progressi
- ✅ Interfaccia touch-friendly
- ✅ Supporto offline
- ✅ Installabile come app nativa

## Note Tecniche

- L'app usa localStorage per la persistenza dei dati (compatibile con GitHub Pages)
- Tutti i path sono configurati per funzionare con il basePath '/Gym/'
- Il build statico è ottimizzato per le performance
- Il workflow GitHub Actions gestisce automaticamente il deploy

## Troubleshooting

Se il deploy fallisce:
1. Verifica che la repository sia pubblica
2. Controlla i logs del workflow in Actions
3. Assicurati che GitHub Pages sia abilitato nelle impostazioni