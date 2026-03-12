/**
 * Threat Intelligence Service
 * Genera minacce realistiche e le salva nel backend
 */

import { threatService } from './threatService';

// Database realistico di paesi ad alto rischio
const HIGH_RISK_COUNTRIES = [
  { code: 'CN', name: 'China', latitude: 35.8617, longitude: 104.1954 },
  { code: 'RU', name: 'Russia', latitude: 61.524, longitude: 105.3188 },
  { code: 'IR', name: 'Iran', latitude: 32.4279, longitude: 53.6880 },
  { code: 'KP', name: 'North Korea', latitude: 40.3399, longitude: 127.5101 },
  { code: 'SY', name: 'Syria', latitude: 34.8021, longitude: 38.9968 },
  { code: 'NL', name: 'Netherlands', latitude: 52.1326, longitude: 5.2913 },
  { code: 'RO', name: 'Romania', latitude: 45.9432, longitude: 24.9668 },
  { code: 'KZ', name: 'Kazakhstan', latitude: 48.0196, longitude: 66.9237 },
  { code: 'VN', name: 'Vietnam', latitude: 14.0583, longitude: 108.2772 },
  { code: 'TH', name: 'Thailand', latitude: 15.8700, longitude: 100.9925 },
  { code: 'BR', name: 'Brazil', latitude: -14.2350, longitude: -51.9253 },
  { code: 'IN', name: 'India', latitude: 20.5937, longitude: 78.9629 },
];

// Descrizioni realistiche di minacce
const THREAT_DESCRIPTIONS = [
  'Phishing/Malware URL detected',
  'Brute force attack detected',
  'Command & Control (C2) server',
  'Email spoofing campaign',
  'Botnet activity detected',
  'SQL injection attempt',
  'DDoS attack origin',
  'Ransomware distribution server',
  'Malware payload hosting',
  'Credential harvesting site',
  'Drive-by download site',
  'Fake login portal',
];

/**
 * Genera un IP random
 */
function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

/**
 * Genera una minaccia realistica
 */
function generateRealisticThreat() {
  const country = HIGH_RISK_COUNTRIES[Math.floor(Math.random() * HIGH_RISK_COUNTRIES.length)];
  const score = Math.floor(Math.random() * 60) + 40; // 40-100
  const description = THREAT_DESCRIPTIONS[Math.floor(Math.random() * THREAT_DESCRIPTIONS.length)];

  // Varia leggermente le coordinate del paese
  const latVariation = (Math.random() - 0.5) * 5;
  const lonVariation = (Math.random() - 0.5) * 5;

  return {
    id: `threat-${Date.now()}-${Math.random()}`,
    ip: generateRandomIP(),
    url: `http://${generateRandomIP()}:${Math.floor(Math.random() * 65535)}`,
    country_code: country.code,
    country_name: country.name,
    latitude: country.latitude + latVariation,
    longitude: country.longitude + lonVariation,
    city: country.name,
    isp: `ISP-${Math.floor(Math.random() * 1000)}`,
    abuse_score: score,
    description,
    created: new Date().toISOString(),
    source: 'Threat Intelligence API',
  };
}

/**
 * Genera un batch di minacce realistiche
 */
function generateThreats(count = 20) {
  const threats = [];
  for (let i = 0; i < count; i++) {
    threats.push(generateRealisticThreat());
  }
  return threats;
}

/**
 * Servizio di polling automatico
 */
let pollingInterval = null;
let threatDatabase = [];

export const threatIntelligenceService = {
  /**
   * Avvia il polling automatico
   * @param {number} intervalSeconds - Intervallo in secondi (default: 5)
   * @param {Function} onThreatsUpdated - Callback quando arrivano nuove minacce
   */
  async startPolling(intervalSeconds = 5, onThreatsUpdated = null) {
    // Genera minacce iniziali
    const initialThreats = generateThreats(30);
    threatDatabase = [...initialThreats];
    
    // Salva nel backend
    console.log('💾 Salvataggio minacce iniziali nel backend...');
    await threatService.createThreats(initialThreats);
    
    if (onThreatsUpdated) {
      onThreatsUpdated([...threatDatabase]);
    }
    
    console.log(`✅ Threat Intelligence polling avviato ogni ${intervalSeconds} secondi`);

    // Aggiungi nuove minacce periodicamente
    pollingInterval = setInterval(async () => {
      // Aggiungi 3-5 nuove minacce
      const newThreats = generateThreats(Math.floor(Math.random() * 3) + 3);
      threatDatabase = [...newThreats, ...threatDatabase.slice(0, 95)]; // Tieni ultimi 95
      
      // Salva nel backend
      await threatService.createThreats(newThreats);
      
      if (onThreatsUpdated) {
        onThreatsUpdated([...threatDatabase]);
      }
    }, intervalSeconds * 1000);
  },

  /**
   * Ferma il polling
   */
  stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
      console.log('⛔ Threat Intelligence polling fermato');
    }
  },

  /**
   * Recupera minacce dal backend
   */
  async fetchThreats() {
    try {
      const threats = await threatService.getThreats();
      threatDatabase = threats;
      return threats;
    } catch (error) {
      console.error('❌ Errore caricamento minacce dal backend:', error);
      return [];
    }
  },

  /**
   * Limpia cache
   */
  clearCache() {
    threatDatabase = [];
  },
};
