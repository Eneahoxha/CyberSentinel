# 🛡️ CyberSentinel

**Live Cyber Threat Map** - Monitoraggio minacce cyber in tempo reale, stile CheckPoint's ThreatMap

## 📊 Caratteristiche

- 🗺️ **Mappa interattiva in tempo reale** - Visualizza minacce geolocalizzate sulla mappa mondiale
- 🎯 **Catalogo attacchi per paese** - Clicca su un paese per vedere i dettagli di tutti gli attacchi
- 📈 **Statistiche avanzate** - Dashboard con trend, paesi colpiti, score medi
- 🔄 **Aggiornamenti in tempo reale** - Nuove minacce ogni 5 secondi
- 💾 **Backend PocketBase** - Persistenza dati e watchlist personalizzate
- 🎨 **UI Dark Mode** - UI moderna e responsive stile cybersecurity

## 🚀 Quick Start

### Prerequisiti
- Node.js 16+
- PocketBase (running su http://127.0.0.1:8090)

### Installazione

```bash
# Installa dipendenze
npm install

# Avvia l'app (dev server)
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`

## 🏗️ Struttura Progetto

```
src/
├── components/          # Componenti React
│   ├── WorldMap.jsx        # Mappa Leaflet con GeoJSON
│   ├── ThreatFeed.jsx      # Feed attacchi in tempo reale
│   ├── StatsDashboard.jsx  # Dashboard statistiche
│   └── AttackCatalog.jsx   # Modal catalogo attacchi per paese
│
├── pages/              # Pagine principali
│   └── Dashboard.jsx      # Layout principale
│
├── services/           # Logica backend & API calls
│   ├── threatService.js              # CRUD attacchi (PocketBase)
│   ├── threatIntelligenceService.js  # Generazione minacce + polling
│   └── pocketbaseService.js          # Auth e utilities (legacy)
│
├── utils/              # Helper functions
│   ├── constants.js       # Costanti globali
│   └── mockData.js        # Dati mock per watchlist
│
├── App.jsx             # Entry point
├── App.css
├── main.jsx
└── index.css
```

## 📡 Backend - PocketBase

### Collections

#### `threats` (Data)
Attacchi cyber rilevati
- `id` - Identificativo unico
- `ip` - Indirizzo IP attaccante
- `country_code` - Codice paese ISO (es: CN, RU)
- `country_name` - Nome paese
- `latitude` - Coordinata geografica
- `longitude` - Coordinata geografica
- `abuse_score` - Score da 0-100
- `description` - Descrizione attacco
- `created` - Data creazione
- `updated` - Data aggiornamento

#### `watchlists` (Data)
Paesi monitorati dall'utente
- `id` - ID unico
- `user` - Relazione con users
- `country_to_monitor` - Codice paese (es: IT)
- `min_score` - Score minimo per filtrare
- `created` - Data creazione

#### `users` (Auth)
Utenti e autenticazione (deprecato, non usato)

## 🔄 Flusso Dati

```
1. Dashboard si carica
   ↓
2. threatService.getThreats() → carica dal backend
   ↓
3. Se vuoto:
   - threatIntelligenceService genera 30 minacce
   - threatService.createThreats() → salva nel backend
   ↓
4. Polling ogni 5 secondi:
   - Genera 3-5 nuove minacce
   - Salva nel backend
   - Aggiorna UI della mappa
```

## 🎮 Come Usare

### Visualizzare gli Attacchi
1. Apri `http://localhost:5173`
2. La mappa si carica con attacchi da 12+ paesi ad alto rischio
3. I paesi si colorano in base al volume di attacchi:
   - 🔴 **Rosso** = Attacchi critici (>75%)
   - 🟠 **Arancione** = Attacchi alti (50-75%)
   - 🟡 **Giallo** = Attacchi medi (25-50%)
   - 🟨 **Giallo chiaro** = Attacchi bassi (<25%)

### Fare click su un Paese
1. Clicca su qualsiasi paese sulla mappa
2. Si apre il **Catalogo Attacchi** modale
3. Vedi tutti gli attacchi da quel paese con:
   - IP (cliccabile per copiare)
   - Score di rischio
   - Coordinate geografiche
   - Descrizione e timestamp

### Monitorare un Paese
1. Sidebar sinistra: "Paesi Monitorati"
2. Inserisci codice paese (es: `IT`) e score minimo (es: `75`)
3. Clicca "Monitora"
4. Il paese appare nella watchlist
5. Il feed si filtra automaticamente

### Visualizzare Statistiche
1. Top bar: clicca su "Statistiche"
2. Vedi:
   - Totale minacce
   - Top paesi colpiti
   - Trend storici
   - Malware types

## 🔧 Configurazione

### Connessione PocketBase
File: `src/services/threatService.js`
```javascript
const POCKETBASE_URL = 'http://127.0.0.1:8090';
```

### Intervallo Polling
File: `src/pages/Dashboard.jsx`
```javascript
threatIntelligenceService.startPolling(5); // 5 secondi
```

## 📚 API Endpoints Usati

### Threats Collection
```
GET    /api/collections/threats/records
POST   /api/collections/threats/records
PATCH  /api/collections/threats/records/{id}
DELETE /api/collections/threats/records/{id}
```

### Con filtri
```
GET /api/collections/threats/records?filter=(country_code="CN")
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Maps**: Leaflet.js + OpenStreetMap
- **Backend**: PocketBase (self-hosted)
- **Icons**: Lucide React
- **Styling**: CSS-in-JS (inline styles)

## 📝 Sviluppo

### Aggiungere una nuova minaccia manualmente
```javascript
import { threatService } from './services/threatService';

const newThreat = {
  ip: '192.168.1.100',
  country_code: 'CN',
  country_name: 'China',
  latitude: 35.8617,
  longitude: 104.1954,
  abuse_score: 85,
  description: 'Brute force attack'
};

await threatService.createThreat(newThreat);
```

### Pulire il database
```javascript
await threatService.clearAllThreats();
```

## 🐛 Troubleshooting

### "Cannot connect to PocketBase"
- Assicurati che PocketBase sia in esecuzione: `http://127.0.0.1:8090`
- Check console per CORS errors

### "Mappa non carica correttamente"
- Refresh la pagina
- Check che Leaflet.js sia caricato

### "Nessun attacco visualizzato"
- Aspetta 5 secondi per il primo polling
- Controlla che la collezione `threats` sia vuota nel backend

## 📄 Licenza

MIT

## 👤 Autore

CyberSentinel Development Team
