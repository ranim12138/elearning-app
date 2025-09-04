import { useEffect, useState } from 'react';
import axios from 'axios';
import QuizResults from './QuizResults';

function QuizManager({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    titre: '',
    questions: []
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/quiz/course/${courseId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error('Erreur chargement quizzes:', err);
    }
  };

  const handleQuizChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (e, index) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = e.target.value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const addQuestionToForm = () => {
    setForm({
      ...form,
      questions: [...form.questions, newQuestion]
    });
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/quiz', {
        ...form,
        course: courseId,
        enseignant: storedUser._id
      });
      setForm({ titre: '', questions: [] });
      fetchQuizzes();
    } catch (err) {
      console.error('Erreur création quiz:', err);
    }
  };

  const handleDelete = async (quizId) => {
  if (window.confirm('Confirmer la suppression de ce quiz ?')) {
    try {
      await axios.delete(`http://localhost:5000/api/quiz/${quizId}`);
      fetchQuizzes(); // rafraîchir la liste après suppression
      alert('Quiz supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression quiz:', err);
      alert('Erreur lors de la suppression');
    }
  }
};


  return (
    <div className="mt-4">
      <h5>Créer un quiz</h5>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titre"
          placeholder="Titre du quiz"
          className="form-control mb-2"
          value={form.titre}
          onChange={handleQuizChange}
          required
        />

        <h6>Ajouter une question</h6>
        <input
          type="text"
          placeholder="Question"
          className="form-control mb-2"
          value={newQuestion.question}
          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
        />
        {newQuestion.options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${i + 1}`}
            className="form-control mb-2"
            value={opt}
            onChange={(e) => handleQuestionChange(e, i)}
          />
        ))}
        <input
          type="text"
          placeholder="Bonne réponse"
          className="form-control mb-2"
          value={newQuestion.correctAnswer}
          onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
        />
        <button type="button" className="btn btn-secondary mb-3" onClick={addQuestionToForm}>
          Ajouter la question
        </button>

        <button type="submit" className="btn btn-primary">Créer quiz</button>
      </form>

      <h6 className="mt-4">Quiz existants</h6>
      <ul className="list-group">
        {quizzes.map(q => (
          <li key={q._id} className="list-group-item">
  <div className="d-flex justify-content-between align-items-center">
    <span>{q.titre} – {q.questions.length} questions</span>

    <div>
      <button
        className="btn btn-info btn-sm me-2"
        onClick={() => setSelectedQuizId(q._id)}
      >
        Voir résultats
      </button>

      <button
        className="btn btn-danger btn-sm"
        onClick={() => handleDelete(q._id)}
      >
        Supprimer
      </button>
    </div>
  </div>

  {selectedQuizId === q._id && (
    <div className="mt-2">
      <QuizResults quizId={q._id} />
      <button
        className="btn btn-secondary btn-sm mt-2"
        onClick={() => setSelectedQuizId(null)}
      >
        Fermer
      </button>
    </div>
  )}
</li>
        ))}
      </ul>
    </div>
  );
}

export default QuizManager;
