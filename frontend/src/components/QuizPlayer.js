import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizPlayer({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [reponses, setReponses] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
        setQuiz(res.data);
        setReponses(new Array(res.data.questions.length).fill(''));
      } catch (err) {
        console.error('Erreur lors du chargement du quiz', err);
      }
    };
    
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (qIndex, answer) => {
    const newReponses = [...reponses];
    newReponses[qIndex] = answer;
    setReponses(newReponses);
  };

  const submitQuiz = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
        reponses
      });
      setResult(res.data);
    } catch (err) {
      console.error('Erreur lors de la soumission', err);
    }
  };

  if (!quiz) return <div>Chargement...</div>;

  return (
    <div className="card p-3">
      <h4>{quiz.titre}</h4>
      <p>{quiz.description}</p>
      
      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-4">
          <h6>Question {qIndex + 1}: {q.enonce}</h6>
          
          {q.type === 'qcm' ? (
            <div>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`question-${qIndex}`}
                    id={`option-${qIndex}-${oIndex}`}
                    value={oIndex}
                    onChange={() => handleAnswer(qIndex, oIndex)}
                  />
                  <label className="form-check-label" htmlFor={`option-${qIndex}-${oIndex}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              className="form-control"
              value={reponses[qIndex]}
              onChange={(e) => handleAnswer(qIndex, e.target.value)}
            />
          )}
        </div>
      ))}
      
      {!result ? (
        <button className="btn btn-primary" onClick={submitQuiz}>
          Soumettre le quiz
        </button>
      ) : (
        <div className="alert alert-info">
          <h5>Résultat: {result.score}/{result.total}</h5>
          <p>Score: {Math.round((result.score / result.total) * 100)}%</p>
        </div>
      )}
    </div>
  );
}

export default QuizPlayer;