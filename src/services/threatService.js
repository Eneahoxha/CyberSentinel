/**
 * Threat Service - Integrazione PocketBase
 * Gestisce il CRUD degli attacchi nel backend
 */

const POCKETBASE_URL = 'http://127.0.0.1:8090';
const THREATS_COLLECTION = 'threats';

export const threatService = {
  /**
   * Carica tutti gli attacchi dal backend
   */
  async getThreats() {
    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/${THREATS_COLLECTION}/records`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Errore: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Errore caricamento attacchi:', error);
      return [];
    }
  },

  /**
   * Salva un singolo attacco
   */
  async createThreat(threatData) {
    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/${THREATS_COLLECTION}/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ip: threatData.ip,
            country_code: threatData.country_code,
            country_name: threatData.country_name,
            latitude: threatData.latitude,
            longitude: threatData.longitude,
            abuse_score: threatData.abuse_score,
            description: threatData.description,
            created: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Errore salvataggio: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Errore creazione attacco:', error);
      return null;
    }
  },

  /**
   * Salva multipli attacchi in batch
   */
  async createThreats(threatsData) {
    const results = [];
    
    for (const threat of threatsData) {
      const result = await this.createThreat(threat);
      if (result) {
        results.push(result);
      }
      // Delay per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  },

  /**
   * Aggiorna un attacco
   */
  async updateThreat(threatId, threatData) {
    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/${THREATS_COLLECTION}/records/${threatId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(threatData),
        }
      );

      if (!response.ok) {
        throw new Error(`Errore update: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore aggiornamento attacco:', error);
      return null;
    }
  },

  /**
   * Elimina un attacco
   */
  async deleteThreat(threatId) {
    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/${THREATS_COLLECTION}/records/${threatId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Errore delete: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Errore eliminazione attacco:', error);
      return false;
    }
  },

  /**
   * Filtra attacchi per paese
   */
  async getThreatsByCountry(countryCode) {
    try {
      const response = await fetch(
        `${POCKETBASE_URL}/api/collections/${THREATS_COLLECTION}/records?filter=(country_code="${countryCode}")`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Errore: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`❌ Errore filtro paese ${countryCode}:`, error);
      return [];
    }
  },

  /**
   * Pulisci tutti gli attacchi (utile per testing)
   */
  async clearAllThreats() {
    try {
      const threats = await this.getThreats();
      
      for (const threat of threats) {
        await this.deleteThreat(threat.id);
      }

      console.log('✅ Tutti gli attacchi eliminati');
      return true;
    } catch (error) {
      console.error('❌ Errore pulizia attacchi:', error);
      return false;
    }
  },
};
