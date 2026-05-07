import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCvById, deleteCv, type Cv } from '../api/api';

export default function CvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCv] = useState<Cv | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getCvById(Number(id));
        setCv(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CV introuvable');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Supprimer ce CV ?`)) return;
    try {
      await deleteCv(Number(id));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (loading) return <div className="page-container"><div className="spinner-container"><div className="spinner" /></div></div>;
  if (error) return <div className="page-container"><div className="alert alert-error">⚠️ {error}</div><Link to="/" className="btn btn-secondary">← Dashboard</Link></div>;
  if (!cv) return null;

  const initials = `${cv.firstname.charAt(0)}${cv.name.charAt(0)}`.toUpperCase();
  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="page-container animate-in cv-detail">
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate('/'); }}>← Retour au dashboard</a>
      <div className="glass-card">
        <div className="cv-detail-header">
          <div className="cv-detail-avatar">{initials}</div>
          <div className="cv-detail-info">
            <h2>{cv.firstname} {cv.name}</h2>
            <p>{cv.job}</p>
          </div>
        </div>
        <div className="cv-detail-grid">
          <div className="detail-item">
            <label>Âge</label>
            <span>{cv.age} ans</span>
          </div>
          <div className="detail-item">
            <label>CIN</label>
            <span>{cv.cin}</span>
          </div>
          <div className="detail-item">
            <label>Métier</label>
            <span>{cv.job}</span>
          </div>
          <div className="detail-item">
            <label>Fichier</label>
            <span>{cv.path || 'Aucun'}</span>
          </div>
          <div className="detail-item">
            <label>Créé le</label>
            <span>{fmt(cv.createdAt)}</span>
          </div>
          <div className="detail-item">
            <label>Mis à jour le</label>
            <span>{fmt(cv.updatedAt)}</span>
          </div>
        </div>
        <div className="btn-group">
          <Link to={`/cv/${cv.id}/edit`} className="btn btn-primary">✏️ Modifier</Link>
          <button className="btn btn-danger" onClick={handleDelete}>🗑️ Supprimer</button>
        </div>
      </div>
    </div>
  );
}
