import React, { useEffect, useState } from 'react';
import { X, MapPin, AlertTriangle, Copy, CheckCircle } from 'lucide-react';

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

export const AttackCatalog = ({ 
  isOpen, 
  countryName, 
  countryCode,
  threats = [], 
  onClose 
}) => {
  const [attackList, setAttackList] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    // Filtra e ordina gli attacchi per il paese selezionato
    if (countryCode && threats.length > 0) {
      const filtered = threats
        .filter(t => t.country_code === countryCode)
        .sort((a, b) => {
          // Ordina per score decrescente
          if (b.abuse_score !== a.abuse_score) {
            return b.abuse_score - a.abuse_score;
          }
          // Poi per data
          return new Date(b.created) - new Date(a.created);
        });
      setAttackList(filtered);
    }
  }, [countryCode, threats]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        style={{
          backgroundColor: '#0f1419',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          border: '1px solid #2d3748',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'linear-gradient(135deg, #1a1f3a 0%, #2d3748 100%)',
            padding: '20px',
            borderBottom: '1px solid #2d3748',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 101,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color="#ff6b6b" />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 'bold' }}>
                Catalogo Attacchi
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
                {countryName} ({countryCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px 8px',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            backgroundColor: '#1a1f3a',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            borderBottom: '1px solid #2d3748',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
              {attackList.length}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>Attacchi Totali</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
              {attackList.filter(a => a.abuse_score >= 80).length}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>Critici</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {attackList.filter(a => a.abuse_score >= 60 && a.abuse_score < 80).length}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>Alti</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#fbc02d',
              }}
            >
              {Math.round(
                attackList.reduce((sum, a) => sum + a.abuse_score, 0) /
                  (attackList.length || 1)
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>Score Medio</div>
          </div>
        </div>

        {/* Attack List */}
        <div style={{ padding: '20px' }}>
          {attackList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <AlertTriangle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Nessun attacco rilevato per questo paese</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attackList.map((attack, idx) => (
                <div
                  key={`${attack.ip}-${idx}`}
                  style={{
                    backgroundColor: '#1a1f3a',
                    border: `2px solid ${getRiskColor(attack.abuse_score)}`,
                    borderRadius: '8px',
                    padding: '16px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d3748';
                    e.currentTarget.style.boxShadow = `0 0 12px ${getRiskColor(
                      attack.abuse_score
                    )}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1f3a';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* IP e Rischio */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                      <code
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          backgroundColor: '#0f1419',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#64b5f6',
                          flex: 1,
                        }}
                        onClick={() => copyToClipboard(attack.ip, `ip-${idx}`)}
                        title="Click per copiare"
                      >
                        {attack.ip}
                      </code>
                      {copied === `ip-${idx}` && (
                        <CheckCircle size={16} color="#4caf50" />
                      )}
                    </div>
                    <div
                      style={{
                        backgroundColor: getRiskColor(attack.abuse_score),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        minWidth: '80px',
                        textAlign: 'center',
                      }}
                    >
                      {getRiskLabel(attack.abuse_score)}
                      <br />
                      {attack.abuse_score}/100
                    </div>
                  </div>

                  {/* Dettagli */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#aaa' }}>Paese:</span>
                      <span style={{ color: '#fff', marginLeft: '8px', fontWeight: '500' }}>
                        {attack.country_name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      <span style={{ color: '#aaa' }}>Coordinate:</span>
                      <span style={{ color: '#fff', marginLeft: '8px', fontFamily: 'monospace' }}>
                        {attack.latitude?.toFixed(2)}°, {attack.longitude?.toFixed(2)}°
                      </span>
                    </div>
                  </div>

                  {/* Descrizione */}
                  {attack.description && (
                    <div style={{ marginBottom: '10px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#ccc',
                          backgroundColor: '#0f1419',
                          padding: '8px',
                          borderRadius: '4px',
                          borderLeft: `3px solid ${getRiskColor(attack.abuse_score)}`,
                        }}
                      >
                        {attack.description}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {new Date(attack.created).toLocaleString('it-IT')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
