import { useEffect, useState } from 'react';
import axios from 'axios';

function QuizResults({ quizId }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quiz/${quizId}/results`);
      setResults(res.data);
    } catch (err) {
      console.error('Erreur chargement résultats quiz:', err);
    }
  };

  return (
    <div className="mt-4">
      <h5>Résultats du quiz</h5>
      {results.length === 0 ? (
        <p>Aucun étudiant n'a encore passé ce quiz.</p>
      ) : (
        <ul className="list-group">
          {results.map(r => (
            <li key={r._id} className="list-group-item">
              <strong>{r.etudiant?.name || 'Etudiant inconnu'}</strong> – Score : {r.score}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QuizResults;
