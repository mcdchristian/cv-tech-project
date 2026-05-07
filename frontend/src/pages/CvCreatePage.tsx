import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCv } from '../api/api';

export default function CvCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', firstname: '', age: '', cin: '', job: '', path: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCv({
        name: form.name,
        firstname: form.firstname,
        age: Number(form.age),
        cin: Number(form.cin),
        job: form.job,
        path: form.path || undefined,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-in">
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate('/'); }}>← Retour au dashboard</a>
      <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Créer un CV
        </h1>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cv-firstname">Prénom</label>
              <input id="cv-firstname" name="firstname" placeholder="Ex: Jean" value={form.firstname} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="cv-name">Nom</label>
              <input id="cv-name" name="name" placeholder="Ex: Dupont" value={form.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cv-age">Âge</label>
              <input id="cv-age" name="age" type="number" min="15" max="65" placeholder="15-65" value={form.age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="cv-cin">CIN</label>
              <input id="cv-cin" name="cin" type="number" placeholder="Numéro CIN" value={form.cin} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="cv-job">Métier / Poste</label>
            <input id="cv-job" name="job" placeholder="Ex: Développeur Full-Stack" value={form.job} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="cv-path">Chemin fichier (optionnel)</label>
            <input id="cv-path" name="path" placeholder="Ex: /uploads/cv.pdf" value={form.path} onChange={handleChange} />
          </div>
          <div className="btn-group" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : '✅ Créer le CV'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
