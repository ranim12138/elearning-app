import { useState } from 'react';
import axios from 'axios';
import './Register.css'; // On va y mettre le style personnalisé
function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="form-section">
          <h2>Créer un compte</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Nom complet" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirmer mot de passe" onChange={handleChange} required />
            <select name="role" onChange={handleChange}>
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">S'inscrire</button>
          </form>
          <p>
            Vous avez déjà un compte ? <a href="/login">Connectez-vous ici</a>
          </p>
          {message && <div className="message">{message}</div>}
        </div>
        <div className="image-section">
          <img src="/img/images.jpeg" alt="Illustration" className="img-fluid h-100 w-100" />
        </div>
      </div>
    </div>
  );
}

export default Register;
