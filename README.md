# 🍼 Battesimo Mathi – App Invitati

App per gestire invitati, bomboniere e costi del battesimo di Mathi.
18 Luglio 2025 · Ristorante La Masseria

---

## 🚀 Deploy su Vercel (segui questi passi)

### 1. Crea account GitHub (se non ce l'hai)
- Vai su https://github.com e registrati gratis

### 2. Carica il progetto su GitHub
- Clicca **"New repository"** → chiama `battesimo-mathi` → **Create**
- Carica tutti i file di questa cartella (drag & drop)

### 3. Crea account Vercel
- Vai su https://vercel.com → **Sign up with GitHub**

### 4. Importa il progetto
- Dashboard Vercel → **"Add New Project"**
- Seleziona `battesimo-mathi` → **Deploy**

### 5. Aggiungi il database KV (per salvare i dati online)
- Nel progetto Vercel → **Storage** → **Create Database** → **KV**
- Chiama `battesimo-kv` → **Create**
- Clicca **"Connect to project"** → seleziona il tuo progetto
- Vercel aggiunge automaticamente le variabili d'ambiente

### 6. Rideploy
- Vai su **Deployments** → clicca i tre puntini sull'ultimo deploy → **Redeploy**

### ✅ Fatto!
Avrai un link tipo `battesimo-mathi.vercel.app` da aprire su tutti i telefoni.

---

## ✨ Funzionalità

- **Lista invitati** con nome editabile
- **Adulto / Bambino** — tap per cambiare tipo, quote si aggiornano
- **Categoria** — Famiglia / Amici / Da classificare
- **🎁 Bomboniera** — tap sul regalo per spuntare consegnata
- **Filtri** — per categoria, bambini, da consegnare
- **Ricerca** per nome
- **Riepilogo** con totali ospiti, bomboniere, costi pranzo e bomboniere
- **Sync automatico** ogni 15 secondi tra dispositivi
- **Quote configurabili** (pranzo adulto/bambino, bomboniera adulto/bambino)

---

## 🛠 Struttura progetto

```
battesimo-app/
├── src/
│   ├── app/
│   │   ├── page.js          ← App principale
│   │   ├── layout.js
│   │   ├── globals.css
│   │   └── api/
│   │       ├── invitati/route.js  ← API dati invitati
│   │       └── quote/route.js     ← API quote
│   └── data/
│       └── invitati.js      ← Lista iniziale invitati
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```
