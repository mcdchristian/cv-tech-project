import { Link } from 'react-router-dom';
import type { Cv } from '../api/api';
import { deleteCv } from '../api/api';

interface Props {
  cv: Cv;
  onDeleted: () => void;
}

export default function CvCard({ cv, onDeleted }: Props) {
  const initials = `${cv.firstname.charAt(0)}${cv.name.charAt(0)}`.toUpperCase();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Supprimer le CV de ${cv.firstname} ${cv.name} ?`)) return;
    try {
      await deleteCv(cv.id);
      onDeleted();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <Link to={`/cv/${cv.id}`} className="cv-card" style={{ textDecoration: 'none' }}>
      <div className="cv-card-header">
        <div className="cv-card-avatar">{initials}</div>
        <div>
          <div className="cv-card-name">{cv.firstname} {cv.name}</div>
          <div className="cv-card-job">{cv.job}</div>
        </div>
      </div>
      <div className="cv-card-details">
        <span className="cv-card-detail">
          <span className="detail-icon">🎂</span> {cv.age} ans
        </span>
        <span className="cv-card-detail">
          <span className="detail-icon">🪪</span> {cv.cin}
        </span>
        {cv.createdAt && (
          <span className="cv-card-detail">
            <span className="detail-icon">📅</span> {new Date(cv.createdAt).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
      <div className="cv-card-actions">
        <Link to={`/cv/${cv.id}/edit`} className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>
          ✏️ Modifier
        </Link>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          🗑️ Supprimer
        </button>
      </div>
    </Link>
  );
}
