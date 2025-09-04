import { useEffect, useState } from 'react';
import axios from 'axios';

function QuizPasser({ courseId, etudiantId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  // ✅ Déplace fetchQuizzes avant useEffect
  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quiz/course/${courseId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error('Erreur chargement quizzes:', err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]); // ✅ ajoute fetchQuizzes comme dépendance

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/quiz/${selectedQuiz._id}/passer`, {
        etudiantId,
        reponses: answers // ✅ corrige reponses -> answers
      });
      setScore(res.data.score);
      alert(`Quiz soumis. Votre note : ${res.data.score}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la soumission');
      console.error('Erreur passage quiz:', err);
    }
  };

  return (
    <div className="mt-4">
      <h5>Quiz disponibles</h5>
      <ul className="list-group mb-3">
        {quizzes.map(q => (
          <li
            key={q._id}
            className="list-group-item"
            onClick={() => {
              setSelectedQuiz(q);
              setAnswers(new Array(q.questions.length).fill(''));
              setScore(null);
            }}
            style={{ cursor: 'pointer' }}
          >
            {q.titre}
          </li>
        ))}
      </ul>

      {selectedQuiz && (
        <div>
          <h6>{selectedQuiz.titre}</h6>
          {selectedQuiz.questions.map((q, index) => (
            <div key={index} className="mb-3">
              <strong>{q.question}</strong>
              {q.options.map((opt, i) => (
                <div key={i}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={opt}
                    checked={answers[index] === opt}
                    onChange={() => handleAnswerChange(index, opt)}
                  />{' '}
                  {opt}
                </div>
              ))}
            </div>
          ))}
          <button className="btn btn-success" onClick={handleSubmit}>
            Soumettre
          </button>

          {score !== null && (
            <div className="alert alert-info mt-3">
              Votre score : {score} / {selectedQuiz.questions.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizPasser;
