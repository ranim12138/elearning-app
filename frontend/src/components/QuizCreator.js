import React, { useState } from 'react';

function QuizCreator({ courseId }) {
  const [quiz, setQuiz] = useState({
    titre: '',
    description: '',
    questions: [{
      enonce: '',
      type: 'qcm',
      options: ['', ''],
      reponseCorrecte: ''
    }]
  });

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name.includes('question')) {
      const [field, qIndex] = name.split('-');
      const newQuestions = [...quiz.questions];
      newQuestions[qIndex][field] = value;
      setQuiz({ ...quiz, questions: newQuestions });
    } else {
      setQuiz({ ...quiz, [name]: value });
    }
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { enonce: '', type: 'qcm', options: ['', ''], reponseCorrecte: '' }
      ]
    });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options.push('');
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Envoyer le quiz au backend
  };

  return (
    <div className="card p-3 mt-4">
      <h4>Créer un Quiz</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titre"
          placeholder="Titre du quiz"
          className="form-control mb-2"
          value={quiz.titre}
          onChange={(e) => handleChange(e, null)}
          required
        />
        
        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} className="card mb-3 p-3">
            <input
              type="text"
              name={`enonce-${qIndex}`}
              placeholder="Question"
              className="form-control mb-2"
              value={q.enonce}
              onChange={(e) => handleChange(e, qIndex)}
              required
            />
            
            <select
              name={`type-${qIndex}`}
              className="form-select mb-2"
              value={q.type}
              onChange={(e) => handleChange(e, qIndex)}
            >
              <option value="qcm">QCM</option>
              <option value="reponse_libre">Réponse libre</option>
            </select>
            
            {q.type === 'qcm' && (
              <>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oIndex] = e.target.value;
                        const newQuestions = [...quiz.questions];
                        newQuestions[qIndex].options = newOptions;
                        setQuiz({ ...quiz, questions: newQuestions });
                      }}
                      required
                    />
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(qIndex)}>
                  + Ajouter option
                </button>
                
                <select
                  className="form-select mt-2"
                  value={q.reponseCorrecte}
                  onChange={(e) => handleChange(e, qIndex)}
                  required
                >
                  <option value="">Sélectionner la réponse correcte</option>
                  {q.options.map((_, index) => (
                    <option key={index} value={index}>
                      Option {index + 1}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
        
        <button type="button" className="btn btn-secondary mb-3" onClick={addQuestion}>
          + Ajouter question
        </button>
        
        <button type="submit" className="btn btn-primary">Créer Quiz</button>
      </form>
    </div>
  );
}

export default QuizCreator;