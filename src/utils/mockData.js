/**
 * Mock data per testing e sviluppo
 * Non usare in produzione
 */

export const MOCK_THREATS = [
  {
    id: '1',
    ip: '192.168.1.100',
    country_code: 'CN',
    country_name: 'China',
    latitude: 39.9075,
    longitude: 116.39723,
    abuse_score: 95,
    description: 'Brute force SSH, Spamming',
    created: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    ip: '195.154.31.123',
    country_code: 'RU',
    country_name: 'Russia',
    latitude: 55.7558,
    longitude: 37.6173,
    abuse_score: 87,
    description: 'Port scanning, DDoS',
    created: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: '3',
    ip: '77.88.8.88',
    country_code: 'RU',
    country_name: 'Russia',
    latitude: 55.7558,
    longitude: 37.6173,
    abuse_score: 72,
    description: 'Web scraping',
    created: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: '4',
    ip: '203.0.113.45',
    country_code: 'KP',
    country_name: 'North Korea',
    latitude: 39.0392,
    longitude: 125.7625,
    abuse_score: 98,
    description: 'Ransomware C2, Malware',
    created: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '5',
    ip: '176.32.98.166',
    country_code: 'IR',
    country_name: 'Iran',
    latitude: 35.6892,
    longitude: 51.3895,
    abuse_score: 65,
    description: 'Botnet, Phishing',
    created: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '6',
    ip: '185.220.100.254',
    country_code: 'NL',
    country_name: 'Netherlands',
    latitude: 52.1326,
    longitude: 5.2913,
    abuse_score: 58,
    description: 'Proxy abuse',
    created: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '7',
    ip: '46.101.88.147',
    country_code: 'US',
    country_name: 'United States',
    latitude: 41.2619,
    longitude: -77.7986,
    abuse_score: 42,
    description: 'Email spoofing',
    created: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
];

export const MOCK_WATCHLISTS = [
  {
    id: 'w1',
    user: 'user123',
    country_to_monitor: 'CN',
    min_score: 80,
    created: new Date().toISOString(),
  },
  {
    id: 'w2',
    user: 'user123',
    country_to_monitor: 'RU',
    min_score: 70,
    created: new Date().toISOString(),
  },
];

export const COUNTRY_NAMES = {
  CN: 'China',
  RU: 'Russia',
  KP: 'North Korea',
  IR: 'Iran',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  PL: 'Poland',
  NL: 'Netherlands',
  LA: 'Laos',
  VN: 'Vietnam',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  KR: 'South Korea',
  JP: 'Japan',
  AU: 'Australia',
};

export const getCountryName = (code) => {
  return COUNTRY_NAMES[code?.toUpperCase()] || code || 'Unknown';
};
