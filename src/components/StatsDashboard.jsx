import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#d32f2f', '#f57c00', '#fbc02d', '#4caf50', '#2196f3', '#9c27b0'];

export const StatsDashboard = ({ threats = [] }) => {
  // Calcola statistiche
  const stats = useMemo(() => {
    if (threats.length === 0) {
      return {
        totalThreats: 0,
        criticalThreats: 0,
        highThreats: 0,
        mediumThreats: 0,
        topCountries: [],
        riskDistribution: [],
        timeSeries: [],
      };
    }

    // Conta minacce per livello di rischio
    const criticalThreats = threats.filter(t => t.abuse_score >= 80).length;
    const highThreats = threats.filter(t => t.abuse_score >= 60 && t.abuse_score < 80).length;
    const mediumThreats = threats.filter(t => t.abuse_score >= 40 && t.abuse_score < 60).length;

    // Top paesi con più minacce
    const countryCounts = {};
    threats.forEach(threat => {
      const country = threat.country_code || 'XX';
      if (!countryCounts[country]) {
        countryCounts[country] = {
          name: threat.country_name || country,
          value: 0,
          avgScore: 0,
        };
      }
      countryCounts[country].value += 1;
      countryCounts[country].avgScore += threat.abuse_score;
    });

    Object.values(countryCounts).forEach(country => {
      country.avgScore = Math.round(country.avgScore / country.value);
    });

    const topCountries = Object.values(countryCounts)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Distribuzione rischi
    const riskDistribution = [
      {
        name: 'Critico (80-100)',
        value: criticalThreats,
        fill: '#d32f2f',
      },
      {
        name: 'Alto (60-79)',
        value: highThreats,
        fill: '#f57c00',
      },
      {
        name: 'Medio (40-59)',
        value: mediumThreats,
        fill: '#fbc02d',
      },
      {
        name: 'Basso (<40)',
        value: threats.length - criticalThreats - highThreats - mediumThreats,
        fill: '#4caf50',
      },
    ].filter(item => item.value > 0);

    // Time series - ultimi 7 giorni
    const timeSeries = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      timeSeries[dateKey] = 0;
    }

    threats.forEach(threat => {
      const threatDate = new Date(threat.created).toISOString().split('T')[0];
      if (timeSeries[threatDate] !== undefined) {
        timeSeries[threatDate] += 1;
      }
    });

    const timeSeriesData = Object.entries(timeSeries).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
      minacce: count,
    }));

    return {
      totalThreats: threats.length,
      criticalThreats,
      highThreats,
      mediumThreats,
      topCountries,
      riskDistribution,
      timeSeries: timeSeriesData,
    };
  }, [threats]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '20px',
        backgroundColor: '#0a0e27',
        borderRadius: '8px',
        color: '#fff',
        overflowY: 'auto',
        maxHeight: '100%',
      }}
    >
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Totale Minacce', value: stats.totalThreats, color: '#2196f3' },
          { label: 'Critiche', value: stats.criticalThreats, color: '#d32f2f' },
          { label: 'Alto', value: stats.highThreats, color: '#f57c00' },
          { label: 'Medio', value: stats.mediumThreats, color: '#fbc02d' },
        ].map(kpi => (
          <div
            key={kpi.label}
            style={{
              backgroundColor: '#1a1f3a',
              border: `2px solid ${kpi.color}`,
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px', color: '#aaa' }}>{kpi.label}</div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: kpi.color,
                marginTop: '8px',
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Grafico temporale */}
      {stats.timeSeries.length > 0 && (
        <div style={{ backgroundColor: '#1a1f3a', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ margins: 0, marginBottom: '16px', fontSize: '16px' }}>
            📊 Minacce negli ultimi 7 giorni
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0e27',
                  border: '1px solid #666',
                  borderRadius: '4px',
                }}
                formatter={value => [value, 'Minacce']}
              />
              <Line
                type="monotone"
                dataKey="minacce"
                stroke="#2196f3"
                strokeWidth={2}
                dot={{ fill: '#2196f3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top paesi */}
      {stats.topCountries.length > 0 && (
        <div style={{ backgroundColor: '#1a1f3a', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
            🌍 Top Paesi Attacchi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topCountries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#aaa" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0e27',
                  border: '1px solid #666',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="value" fill="#f57c00" name="Numero Minacce" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribuzione rischi */}
      {stats.riskDistribution.length > 0 && (
        <div style={{ backgroundColor: '#1a1f3a', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
            ⚠️ Distribuzione Livelli di Rischio
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
