import { useEffect, useState } from 'react';
import axios from 'axios';

function EvaluationPasser({ courseId, etudiantId }) {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [contenu, setContenu] = useState('');
  const [fichier, setFichier] = useState(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  useEffect(() => {
  if (selectedEvaluation) fetchMySubmission();
}, [selectedEvaluation]);

const [mySubmission, setMySubmission] = useState(null);

const fetchMySubmission = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/evaluation/${selectedEvaluation}/etudiant/${etudiantId}`);
    setMySubmission(res.data);
  } catch (err) {
    console.error('Erreur chargement ma soumission:', err);
  }
};


  const fetchEvaluations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/evaluation/course/${courseId}`);
      setEvaluations(res.data);
    } catch (err) {
      console.error('Erreur chargement évaluations:', err);
    }
  };

 const handleSubmit = async () => {
  try {
    let fileUrl = '';
    if (fichier) {
      const formData = new FormData();
      formData.append('file', fichier);

      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      fileUrl = uploadRes.data.url; // ✅ utilise .url ici
      console.log('File URL uploaded:', fileUrl);
    }

    await axios.post(`http://localhost:5000/api/evaluation/${selectedEvaluation}/soumettre`, {
      etudiantId,
      contenu,
      fichier: fileUrl // ✅ envoie bien fileUrl
    });

    alert('Évaluation soumise');
    setContenu('');
    setFichier(null);
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la soumission');
    console.error('Erreur soumission:', err);
  }
};


  return (
    <div className="mt-4">
      <h5>Évaluations</h5>
      <ul className="list-group mb-3">
        {evaluations.map(e => (
          <li
            key={e._id}
            className="list-group-item"
            onClick={() => setSelectedEvaluation(e._id)}
            style={{ cursor: 'pointer' }}
          >
            {e.titre}
          </li>
        ))}
      </ul>

      {selectedEvaluation && (
        <div>
          <textarea
            placeholder="Votre réponse"
            className="form-control mb-2"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          ></textarea>
          <input
            type="file"
            className="form-control mb-2"
            onChange={(e) => setFichier(e.target.files[0])}
          />
          <button className="btn btn-primary" onClick={handleSubmit}>
            Soumettre
          </button>
          {mySubmission && (
  <div className="mt-3 alert alert-info">
    <h6>Votre soumission</h6>
    {mySubmission.contenu && <div><strong>Texte :</strong> {mySubmission.contenu}</div>}
    {mySubmission.fichier && (
      <div>
        <strong>Fichier :</strong>{' '}
       <a href={mySubmission.fichier} target="_blank" rel="noreferrer">Télécharger</a>

      </div>
    )}
    <div><strong>Note :</strong> {mySubmission.note !== undefined ? mySubmission.note : 'Non corrigée'}</div>
    <div><strong>Remarque :</strong> {mySubmission.remarque || '-'}</div>
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default EvaluationPasser;
