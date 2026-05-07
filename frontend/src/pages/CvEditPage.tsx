import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCvById, updateCv } from '../api/api';

export default function CvEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', firstname: '', age: '', cin: '', job: '', path: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cv = await getCvById(Number(id));
        setForm({
          name: cv.name,
          firstname: cv.firstname,
          age: String(cv.age),
          cin: String(cv.cin),
          job: cv.job,
          path: cv.path || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CV introuvable');
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await updateCv(Number(id), {
        name: form.name,
        firstname: form.firstname,
        age: Number(form.age),
        cin: Number(form.cin),
        job: form.job,
        path: form.path || undefined,
      });
      navigate(`/cv/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="page-container"><div className="spinner-container"><div className="spinner" /></div></div>;

  return (
    <div className="page-container animate-in">
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate(-1); }}>← Retour</a>
      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Modifier le CV
        </h1>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-firstname">Prénom</label>
              <input id="edit-firstname" name="firstname" value={form.firstname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-name">Nom</label>
              <input id="edit-name" name="name" value={form.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-age">Âge</label>
              <input id="edit-age" name="age" type="number" min="15" max="65" value={form.age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="edit-cin">CIN</label>
              <input id="edit-cin" name="cin" type="number" value={form.cin} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-job">Métier / Poste</label>
            <input id="edit-job" name="job" value={form.job} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="edit-path">Chemin fichier (optionnel)</label>
            <input id="edit-path" name="path" value={form.path} onChange={handleChange} />
          </div>
          <div className="btn-group" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Mise à jour...' : '💾 Sauvegarder'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
