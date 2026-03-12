import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Grid, Map } from 'lucide-react';
import { WorldMap } from '../components/WorldMap';
import { ThreatFeed } from '../components/ThreatFeed';
import { StatsDashboard } from '../components/StatsDashboard';
import { AttackCatalog } from '../components/AttackCatalog';
import { MOCK_WATCHLISTS } from '../utils/mockData';
import { threatService } from '../services/threatService';
import { threatIntelligenceService } from '../services/threatIntelligenceService';

// Error Boundary per Leaflet
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Se è un errore di Leaflet, lo loggiamo ma continuiamo
    if (error.message && error.message.includes('Map container')) {
      return { hasError: true, error };
    }
    throw error;
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#1a1f3a', borderRadius: '8px', color: '#fff' }}>
          <p>⚠️ Errore caricamento mappa. Ricarica la pagina.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Ricarica
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const Dashboard = () => {
  const [threats, setThreats] = useState([]);
  const [watchlists, setWatchlists] = useState([...MOCK_WATCHLISTS]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [minScore, setMinScore] = useState(0);
  const [newCountry, setNewCountry] = useState('');
  const [newMinScore, setNewMinScore] = useState(75);
  const [viewMode, setViewMode] = useState('map'); // 'map' o 'stats'
  const [isOpenCatalog, setIsOpenCatalog] = useState(false);
  const [selectedCountryForCatalog, setSelectedCountryForCatalog] = useState(null);
  const [selectedCountryNameForCatalog, setSelectedCountryNameForCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carica minacce al mount
  useEffect(() => {
    const loadThreats = async () => {
      setLoading(true);
      try {
        // Carica dal backend
        const threatsFromDB = await threatService.getThreats();
        
        // Se non ci sono minacce, genera iniziali
        if (threatsFromDB.length === 0) {
          console.log('📊 Nessuna minaccia nel database, genero iniziali...');
          // Avvia il polling che salverà le minacce
          threatIntelligenceService.startPolling(5, (newThreats) => {
            setThreats(newThreats);
            console.log(`🔄 Aggiornate ${newThreats.length} minacce`);
          });
        } else {
          setThreats(threatsFromDB);
          console.log(`✅ Caricate ${threatsFromDB.length} minacce dal backend`);
          
          // Avvia polling per aggiornamenti
          threatIntelligenceService.startPolling(5, (newThreats) => {
            setThreats(newThreats);
          });
        }
      } catch (error) {
        console.error('Errore caricamento minacce:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThreats();

    return () => {
      threatIntelligenceService.stopPolling();
    };
  }, []);
  const handleAddToWatchlist = () => {
    if (!newCountry.trim()) return;

    const newWatchlist = {
      id: 'w' + Date.now(),
      user: 'local',
      country_to_monitor: newCountry.toUpperCase(),
      min_score: newMinScore,
      created: new Date().toISOString(),
    };
    
    setWatchlists([...watchlists, newWatchlist]);
    setNewCountry('');
    setNewMinScore(75);
  };

  // Rimuovi dalla watchlist
  const handleRemoveFromWatchlist = (recordId) => {
    setWatchlists(watchlists.filter(w => w.id !== recordId));
    if (selectedCountry === recordId) {
      setSelectedCountry(null);
    }
  };

  // Gestisci il click su un paese nella mappa
  const handleCountryClick = ({ countryCode, countryName }) => {
    setSelectedCountryForCatalog(countryCode);
    setSelectedCountryNameForCatalog(countryName);
    setIsOpenCatalog(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0e27', color: '#fff' }}>
      {/* Sidebar sinistra */}
      <div
        style={{
          width: '320px',
          backgroundColor: '#0f1428',
          borderRight: '1px solid #1a1f3a',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1a1f3a' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>🛡️ CyberSentinel</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
            Dashboard Sicurezza
          </p>
        </div>

        {/* Statistiche thread/minacce */}
        <div style={{ padding: '16px', borderBottom: '1px solid #1a1f3a' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ backgroundColor: '#1a1f3a', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>Totale Minacce</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>
                {threats.length}
              </div>
            </div>
            <div style={{ backgroundColor: '#1a1f3a', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>Critiche</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px', color: '#f44336' }}>
                {threats.filter(t => t.abuse_score >= 80).length}
              </div>
            </div>
          </div>
        </div>

        {/* Nazioni monitorate */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>
            📍 Paesi Monitorati ({watchlists.length})
          </h3>

          {watchlists.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#666' }}>Nessun paese monitorato</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {watchlists.map(watchlist => (
                <div
                  key={watchlist.id}
                  onClick={() => setSelectedCountry(watchlist.country_to_monitor)}
                  style={{
                    backgroundColor:
                      selectedCountry === watchlist.country_to_monitor ? '#2196f3' : '#1a1f3a',
                    border: '1px solid #2a2f4a',
                    borderRadius: '4px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <strong>{watchlist.country_to_monitor}</strong>
                    <div style={{ fontSize: '10px', color: '#bbb' }}>
                      Score min: {watchlist.min_score}
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveFromWatchlist(watchlist.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f44336',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Aggiungi nuovo paese */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1a1f3a' }}>
            <input
              type="text"
              placeholder="Codice paese (es: IT)"
              value={newCountry}
              onChange={e => setNewCountry(e.target.value)}
              maxLength="2"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1f3a',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            />
            <input
              type="number"
              placeholder="Score minimo"
              value={newMinScore}
              onChange={e => setNewMinScore(parseInt(e.target.value))}
              min="0"
              max="100"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a1f3a',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            />
            <button
              onClick={handleAddToWatchlist}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#2196f3',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} style={{ marginRight: '4px' }} /> Monitora
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div
          style={{
            backgroundColor: '#0f1428',
            borderBottom: '1px solid #1a1f3a',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              🎯 Minacce Rilevate in Tempo Reale
            </h2>
            {loading && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#ffc107' }}>⏳ Caricamento minacce...</p>}
            {!loading && threats.length > 0 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                ✅ {threats.length} minacce da OpenPhish
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('map')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'map' ? '#2196f3' : '#1a1f3a',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
            >
              <Map size={16} /> Mappa
            </button>
            <button
              onClick={() => setViewMode('stats')}
              style={{
                padding: '8px 12px',
                backgroundColor: viewMode === 'stats' ? '#2196f3' : '#1a1f3a',
                border: '1px solid #2a2f4a',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
            >
              <Grid size={16} /> Statistiche
            </button>
          </div>
        </div>

        {/* Contenuto */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', padding: '16px', overflowY: 'auto' }}>
          {/* Vista principale */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <MapErrorBoundary>
              {viewMode === 'map' ? (
                <WorldMap
                  threats={threats}
                  onCountryClick={handleCountryClick}
                />
              ) : (
                <StatsDashboard threats={threats} />
              )}
            </MapErrorBoundary>
          </div>

          {/* Feed laterale */}
          <div style={{ width: '400px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ThreatFeed
              threats={threats}
              selectedCountry={selectedCountry}
              minScore={minScore}
            />
          </div>
        </div>
      </div>

      {/* Catalogo Attacchi Modal */}
      <AttackCatalog
        isOpen={isOpenCatalog}
        countryCode={selectedCountryForCatalog}
        countryName={selectedCountryNameForCatalog}
        threats={threats}
        onClose={() => setIsOpenCatalog(false)}
      />
    </div>
  );
};
