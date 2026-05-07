import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCvStats, type CvStat } from '../api/api';

export default function StatsPage() {
  const [stats, setStats] = useState<CvStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getCvStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalCvs = stats.reduce((sum, s) => sum + Number(s.nombreDeCv), 0);

  return (
    <div className="page-container animate-in">
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate('/'); }}>← Retour au dashboard</a>
      <div className="page-header">
        <h1>Statistiques</h1>
        <p>Nombre de CVs par tranche d'âge (18-50 ans)</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : stats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Aucune statistique disponible</h3>
          <p>Il n'y a pas encore assez de données pour afficher des statistiques.</p>
        </div>
      ) : (
        <>
          <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Total des CVs
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalCvs}
            </div>
          </div>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.age} className="stat-card">
                <div className="stat-age">{stat.age} ans</div>
                <div className="stat-count">{stat.nombreDeCv}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
