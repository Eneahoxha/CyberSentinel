import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, MapPin, Target } from 'lucide-react';

const getRiskColor = (score) => {
  if (score >= 80) return '#d32f2f';
  if (score >= 60) return '#f57c00';
  if (score >= 40) return '#fbc02d';
  return '#4caf50';
};

const getRiskLabel = (score) => {
  if (score >= 80) return 'CRITICO';
  if (score >= 60) return 'ALTO';
  if (score >= 40) return 'MEDIO';
  return 'BASSO';
};

export const ThreatFeed = ({ threats = [], selectedCountry = null, minScore = 0 }) => {
  const [displayThreats, setDisplayThreats] = useState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    // Filtra i threat in base al paese selezionato e score minimo
    let filtered = threats;

    if (selectedCountry) {
      filtered = filtered.filter(t => t.country_code === selectedCountry);
    }

    if (minScore > 0) {
      filtered = filtered.filter(t => t.abuse_score >= minScore);
    }

    // Ordina per score decrescente e per data
    filtered = filtered.sort((a, b) => {
      if (b.abuse_score !== a.abuse_score) {
        return b.abuse_score - a.abuse_score;
      }
      return new Date(b.created) - new Date(a.created);
    });

    setDisplayThreats(filtered);

    // Auto-scroll in basso quando arrivano nuovi threat
    if (feedRef.current) {
      setTimeout(() => {
        if (feedRef.current && feedRef.current.scrollHeight) {
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [threats, selectedCountry, minScore]);

  return (
    <div
      ref={feedRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#0a0e27',
        borderRadius: '8px',
        padding: '16px',
        color: '#fff',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          🚨 Feed Minacce in Tempo Reale
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#bbb' }}>
          Totale: {displayThreats.length} minacce
        </p>
      </div>

      {displayThreats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#666' }}>
          <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>Nessuna minaccia rilevata</p>
          {selectedCountry && (
            <p style={{ fontSize: '12px' }}>
              Prova a rimuovere i filtri del paese
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayThreats.map((threat, idx) => (
            <div
              key={`${threat.ip}-${idx}`}
              style={{
                backgroundColor: '#1a1f3a',
                border: `2px solid ${getRiskColor(threat.abuse_score)}`,
                borderRadius: '6px',
                padding: '12px',
                fontSize: '13px',
                animation: idx < 5 ? 'slideIn 0.3s ease-out' : 'none',
              }}
            >
              {/* Header con IP e rischio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', flex: 1 }}>
                  {threat.ip}
                </div>
                <div
                  style={{
                    backgroundColor: getRiskColor(threat.abuse_score),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    marginLeft: '8px',
                  }}
                >
                  {getRiskLabel(threat.abuse_score)} ({threat.abuse_score})
                </div>
              </div>

              {/* Paese e coordinati */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  <strong>{threat.country_name}</strong>
                </div>
                <div style={{ color: '#aaa' }}>
                  {threat.latitude.toFixed(2)}°, {threat.longitude.toFixed(2)}°
                </div>
              </div>

              {/* Descrizione */}
              {threat.description && (
                <div style={{ marginTop: '8px', color: '#ccc', fontSize: '11px' }}>
                  {threat.description}
                </div>
              )}

              {/* Timestamp */}
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
                {new Date(threat.created).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
