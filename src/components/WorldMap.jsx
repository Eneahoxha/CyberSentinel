import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mapping di paesi ISO -> Nome
const COUNTRY_NAME_MAP = {
  'CN': 'China', 'RU': 'Russia', 'US': 'United States', 'IN': 'India',
  'BR': 'Brazil', 'DE': 'Germany', 'GB': 'United Kingdom', 'FR': 'France',
  'JP': 'Japan', 'IT': 'Italy', 'CA': 'Canada', 'AU': 'Australia',
  'RO': 'Romania', 'NL': 'Netherlands', 'KZ': 'Kazakhstan', 'VN': 'Vietnam',
  'TH': 'Thailand', 'KP': 'North Korea', 'IR': 'Iran', 'SY': 'Syria',
  'IR': 'Iran', 'ZA': 'South Africa', 'MX': 'Mexico', 'TR': 'Turkey',
};

// Crea icone personalizzate per il rischio
const createRiskIcon = (abuseScore) => {
  let color = '#d32f2f';
  let size = 24;

  if (abuseScore >= 80) {
    color = '#d32f2f'; // Rosso scuro - Critico
    size = 32;
  } else if (abuseScore >= 60) {
    color = '#f57c00'; // Arancione - Alto
    size = 28;
  } else if (abuseScore >= 40) {
    color = '#fbc02d'; // Giallo - Medio
    size = 26;
  } else {
    color = '#fdd835'; // Giallo chiaro - Basso
    size = 24;
  }

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">
        ${abuseScore}
      </div>
    `,
    className: 'threat-icon',
    iconSize: [size, size],
    popupAnchor: [0, -size / 2],
  });
};

// Funzione per ottenere il colore in base al numero di attacchi
const getCountryColor = (attackCount, maxAttacks) => {
  if (attackCount === 0) return '#2d3748';
  
  const intensity = Math.min(attackCount / Math.max(maxAttacks, 1), 1);
  
  if (intensity > 0.75) return '#d32f2f'; // Rosso - Critico (25%+ max)
  if (intensity > 0.5) return '#f57c00';  // Arancione - Alto (50%+ max)
  if (intensity > 0.25) return '#fbc02d'; // Giallo - Medio (25%+ max)
  return '#fdd835'; // Giallo chiaro - Basso
};

export const WorldMap = ({ 
  threats = [], 
  onMarkerClick = null,
  onCountryClick = null,
  threats_by_country = {} 
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  const geoJsonLayer = useRef(null);

  // Calcola il numero di attacchi per paese
  const threatsByCountry = useMemo(() => {
    const map = {};
    threats.forEach(threat => {
      if (threat.country_code) {
        map[threat.country_code] = (map[threat.country_code] || 0) + 1;
      }
    });
    return map;
  }, [threats]);

  // Trova il numero massimo di attacchi per un paese (per normalizzare i colori)
  const maxAttacks = useMemo(() => {
    return Math.max(...Object.values(threatsByCountry), 1);
  }, [threatsByCountry]);

  // Inizializza la mappa una sola volta
  useEffect(() => {
    if (!mapContainer.current) return;

    // Se la mappa esiste già, non reinizializzare
    if (mapInstance.current) {
      return;
    }

    try {
      // Crea la mappa
      const map = L.map(mapContainer.current).setView([20, 0], 2);

      // Aggiungi tile layer dark
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Crea un feature group per i marker
      const markerGroup = L.featureGroup().addTo(map);
      markersGroup.current = markerGroup;
      mapInstance.current = map;

      // Carica il GeoJSON dei paesi per permettere click
      fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        .then(res => res.json())
        .then(geojson => {
          // Assicura che la mappa esista ancora prima di aggiungere il layer
          if (!mapInstance.current) return;

          const geoLayer = L.geoJSON(geojson, {
            style: (feature) => {
              const countryCode = feature.properties.ISO_A2;
              const attackCount = threatsByCountry[countryCode] || 0;
              const color = getCountryColor(attackCount, maxAttacks);
              
              return {
                fillColor: color,
                weight: 1,
                opacity: 0.8,
                color: '#2d3748',
                fillOpacity: 0.4,
              };
            },
            onEachFeature: (feature, layer) => {
              const countryCode = feature.properties.ISO_A2 || feature.properties.ISO_A3 || 'XX';
              // Prova diverse proprietà per il nome
              let countryName = feature.properties.ADMIN || 
                                feature.properties.name || 
                                feature.properties.NAME ||
                                feature.properties.sovereignt ||
                                COUNTRY_NAME_MAP[countryCode] ||
                                countryCode;
              
              const attackCount = threatsByCountry[countryCode] || 0;
              
              // Debug logging
              if (!feature.properties.ADMIN && !feature.properties.name) {
                console.log('🔍 Paese rilevato:', countryCode, '-', countryName, '| Properties:', feature.properties);
              }
              
              // Crea tooltip con info attacchi
              const tooltipContent = `
                <div style="font-size: 12px;">
                  <strong>${countryName}</strong><br/>
                  Attacchi: <span style="color: #ffc107; font-weight: bold;">${attackCount}</span>
                </div>
              `;
              layer.bindTooltip(tooltipContent);
              
              // Aggiungi event listener per il click
              layer.on('click', () => {
                if (onCountryClick && countryCode !== 'XX') {
                  onCountryClick({
                    countryCode,
                    countryName,
                  });
                }
              });

              // Hover effect
              layer.on('mouseover', function () {
                this.setStyle({
                  fillOpacity: 0.7,
                  weight: 2,
                });
                this.bringToFront();
              });

              layer.on('mouseout', function () {
                const attackCount = threatsByCountry[countryCode] || 0;
                const color = getCountryColor(attackCount, maxAttacks);
                this.setStyle({
                  fillColor: color,
                  fillOpacity: 0.4,
                  weight: 1,
                });
              });
            },
          }).addTo(mapInstance.current);
          geoJsonLayer.current = geoLayer;
        })
        .catch(err => console.warn('Impossibile caricare GeoJSON dei paesi:', err));

      // Pulisci al unmount
      return () => {
        if (mapInstance.current) {
          mapInstance.current.off();
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    } catch (error) {
      console.error('Errore nell\'inizializzazione della mappa:', error);
    }
  }, []); // Dependency array vuoto = esegui una sola volta

  // Aggiorna i colori dei paesi basati sul numero di attacchi
  useEffect(() => {
    if (!geoJsonLayer.current) return;

    geoJsonLayer.current.eachLayer(layer => {
      const feature = layer.feature;
      if (feature && feature.properties) {
        const countryCode = feature.properties.ISO_A2;
        const attackCount = threatsByCountry[countryCode] || 0;
        const color = getCountryColor(attackCount, maxAttacks);
        
        layer.setStyle({
          fillColor: color,
          weight: 1,
          opacity: 0.8,
          color: '#2d3748',
          fillOpacity: 0.4,
        });
      }
    });
  }, [threatsByCountry, maxAttacks]);

  // Aggiorna i marker quando le minacce cambiano
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;

    // Pulisci vecchi marker
    markersGroup.current.clearLayers();

    // Aggiungi nuovi marker
    threats.forEach((threat) => {
      if (threat.latitude !== undefined && threat.longitude !== undefined) {
        const marker = L.marker(
          [threat.latitude, threat.longitude],
          {
            icon: createRiskIcon(threat.abuse_score || 0),
          }
        );

        // Aggiungi popup
        const popupContent = `
          <div style="font-size: 12px;">
            <strong>${threat.ip || 'Unknown IP'}</strong><br/>
            <strong>${threat.country_name || 'Unknown'}</strong><br/>
            Rischio: <span style="color: #f44336;">${threat.abuse_score || 0}/100</span><br/>
            ${threat.description || 'N/A'}<br/>
            <small>${threat.created ? new Date(threat.created).toLocaleString() : 'N/A'}</small>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Click handler
        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(threat));
        }

        marker.addTo(markersGroup.current);
      }
    });
  }, [threats, onMarkerClick]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
};
