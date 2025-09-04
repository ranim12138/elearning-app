import { useEffect, useState } from 'react';
import axios from 'axios';

function EvaluationManager({ courseId }) {
  const [evaluations, setEvaluations] = useState([]);
  const [form, setForm] = useState({ titre: '', description: '', dateLimite: '' });
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchEvaluations();
  }, []);  

  const fetchEvaluations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/evaluation/course/${courseId}`);
      setEvaluations(res.data);
    } catch (err) {
      console.error('Erreur chargement évaluations:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/evaluation', {
        ...form,
        course: courseId,
        enseignant: JSON.parse(localStorage.getItem('user'))._id
      });
      setForm({ titre: '', description: '', dateLimite: '' });
      fetchEvaluations();
    } catch (err) {
      console.error('Erreur création évaluation:', err);
    }
  };

  const fetchResults = async (evaluationId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/evaluation/${evaluationId}/results`);
      setResults(res.data);
      setSelectedEvaluation(evaluationId);
    } catch (err) {
      console.error('Erreur chargement résultats:', err);
    }
  };

  const handleCorrection = async (resultId, note, remarque) => {
    try {
      await axios.put(`http://localhost:5000/api/evaluation/corriger/${resultId}`, { note, remarque });
      alert('Correction enregistrée');
      fetchResults(selectedEvaluation);
    } catch (err) {
      console.error('Erreur correction:', err);
    }
  };

const handleDelete = async (evaluationId) => {
  if (window.confirm('Confirmer la suppression de cette évaluation ?')) {
    try {
      await axios.delete(`http://localhost:5000/api/evaluation/${evaluationId}`);
      fetchEvaluations(); // rafraîchir la liste
      alert('Évaluation supprimée avec succès');
    } catch (err) {
      console.error('Erreur suppression évaluation:', err);
      alert('Erreur lors de la suppression');
    }
  }
};



  return (
    <div className="mt-4">
      <h5>Créer une évaluation</h5>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titre"
          placeholder="Titre"
          className="form-control mb-2"
          value={form.titre}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          className="form-control mb-2"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>
        <input
          type="date"
          name="dateLimite"
          className="form-control mb-2"
          value={form.dateLimite}
          onChange={handleChange}
        />
        <button type="submit" className="btn btn-primary">Créer</button>
      </form>

      <h6 className="mt-4">Évaluations existantes</h6>
      <ul className="list-group">
  {evaluations.map(e => (
    <li key={e._id} className="list-group-item d-flex justify-content-between align-items-center">
      <div>
        {e.titre}
      </div>
      <div>
        <button
          className="btn btn-info btn-sm me-2"
          onClick={() => fetchResults(e._id)}
        >
          Voir soumissions
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(e._id)}
        >
          Supprimer
        </button>
      </div>
    </li>
  ))}
</ul>


      {results.length > 0 && (
        <div className="mt-4">
          <h6>Soumissions</h6>
          <ul className="list-group">
  {results.map(r => (
    <li key={r._id} className="list-group-item">
      <strong>{r.etudiant?.name || 'Étudiant inconnu'}</strong><br />
      {r.contenu && <div><strong>Texte :</strong> {r.contenu}</div>}

  {r.fichier && (
  <div>
    <strong>Fichier :</strong>{' '}
    <a
      href={r.fichier.startsWith('http') ? r.fichier : `http://localhost:5000/${r.fichier}`}
      target="_blank"
      rel="noreferrer"
    >
      Télécharger
    </a>
  </div>
)}


      <div>Note : {r.note !== undefined ? r.note : 'Non notée'}</div>
      <div>Remarque : {r.remarque || '-'}</div>

      {/* Inputs de correction */}
      <input
        type="number"
        placeholder="Note"
        className="form-control mb-1"
        onChange={(e) => r.noteTemp = e.target.value}
      />
      <input
        type="text"
        placeholder="Remarque"
        className="form-control mb-1"
        onChange={(e) => r.remarqueTemp = e.target.value}
      />
      <button
        className="btn btn-success btn-sm"
        onClick={() => handleCorrection(r._id, r.noteTemp, r.remarqueTemp)}
      >
        Corriger
      </button>
    </li>
  ))}
</ul>

        </div>
      )}
    </div>
  );
}

export default EvaluationManager;
