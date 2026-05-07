import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCvs, type Cv } from '../api/api';
import CvCard from '../components/CvCard';

export default function DashboardPage() {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const data = await getCvs();
      setCvs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCvs(); }, []);

  return (
    <div className="page-container animate-in">
      <div className="page-header">
        <h1>Mes CVs</h1>
        <p>Gérez tous vos curriculum vitae en un seul endroit</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading ? (
        <div className="spinner-container"><div className="spinner" /></div>
      ) : cvs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>Aucun CV pour l'instant</h3>
          <p>Commencez par créer votre premier CV pour le voir apparaître ici.</p>
          <Link to="/cv/new" className="btn btn-primary">+ Créer mon premier CV</Link>
        </div>
      ) : (
        <div className="cv-grid">
          {cvs.map(cv => (
            <CvCard key={cv.id} cv={cv} onDeleted={fetchCvs} />
          ))}
        </div>
      )}
    </div>
  );
}
