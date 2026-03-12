import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Key AbuseIPDB
const ABUSEIPDB_API_KEY = process.env.VITE_ABUSEIPDB_API_KEY || '45b6615c6a74608ebaedf1339974b5c41ff3ebb5213c130d22a957e5bb845c4402fbf30530766e3c';

// Proxy per AbuseIPDB /report endpoint
app.post('/api/abuseipdb/report', async (req, res) => {
  try {
    const { maxAgeInDays = 7, limit = 100, verbose = 1 } = req.query;

    // Crea FormData per AbuseIPDB
    const formData = new URLSearchParams();
    formData.append('maxAgeInDays', maxAgeInDays);
    formData.append('limit', limit);
    formData.append('verbose', verbose);

    // Chiama AbuseIPDB
    const response = await axios.post(
      'https://api.abuseipdb.com/api/v2/report',
      formData,
      {
        headers: {
          'Key': ABUSEIPDB_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    // Ritorna i dati al frontend
    res.json(response.data);
  } catch (error) {
    console.error('❌ Errore AbuseIPDB proxy:', error.message);
    res.status(500).json({
      error: 'Errore nel fetch da AbuseIPDB',
      message: error.message,
    });
  }
});

// Proxy per AbuseIPDB /check endpoint
app.post('/api/abuseipdb/check', async (req, res) => {
  try {
    const { ipAddress, maxAgeInDays = 90, verbose = 1 } = req.query;

    if (!ipAddress) {
      return res.status(400).json({ error: 'ipAddress parameter required' });
    }

    // Crea FormData per AbuseIPDB
    const formData = new URLSearchParams();
    formData.append('ipAddress', ipAddress);
    formData.append('maxAgeInDays', maxAgeInDays);
    formData.append('verbose', verbose);

    // Chiama AbuseIPDB
    const response = await axios.post(
      'https://api.abuseipdb.com/api/v2/check',
      formData,
      {
        headers: {
          'Key': ABUSEIPDB_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    // Ritorna i dati al frontend
    res.json(response.data);
  } catch (error) {
    console.error('❌ Errore AbuseIPDB proxy /check:', error.message);
    res.status(500).json({
      error: 'Errore nel check di AbuseIPDB',
      message: error.message,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend proxy is running' });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`✅ Backend proxy running on http://localhost:${PORT}`);
  console.log(`📝 AbuseIPDB API Key: ${ABUSEIPDB_API_KEY.substring(0, 20)}...`);
});
