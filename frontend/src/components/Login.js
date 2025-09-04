import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Login.css'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Effacer le message d'erreur quand l'utilisateur commence à taper
    if (message) setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      setMessage('Connexion réussie !')
      
      // Stocker les informations utilisateur et token
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('token', res.data.token)
      
      // Ajouter le token aux en-têtes des futures requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      
      // Redirection basée sur le rôle
      if (res.data.user.role === 'admin') {
        navigate('/admin')
      } else if (res.data.user.role === 'enseignant') {
        navigate('/enseignant')
      } else {
        navigate('/etudiant')
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      if (err.response?.status === 401) {
        setMessage('Email ou mot de passe incorrect')
      } else if (err.response?.data?.message) {
        setMessage(err.response.data.message)
      } else if (err.request) {
        setMessage('Impossible de se connecter au serveur. Veuillez réessayer plus tard.')
      } else {
        setMessage('Une erreur inattendue s\'est produite')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="login-card shadow-lg rounded d-flex overflow-hidden">
        {/* Form Section */}
        <div className="login-form p-5">
          <h2 className="mb-4 text-center">Se connecter</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                id="floatingEmail" 
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange} 
                required 
              />
              <label htmlFor="floatingEmail">Email</label>
            </div>

            <div className="form-floating mb-4">
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                id="floatingPassword" 
                placeholder="Mot de passe"
                value={form.password}
                onChange={handleChange} 
                required 
              />
              <label htmlFor="floatingPassword">Mot de passe</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion...
                </>
              ) : (
                'Connexion'
              )}
            </button>
            
          </form>
          <p className="mt-3 text-center">
            Pas encore de compte ? <Link to="/">Inscrivez-vous ici</Link>
          </p>
          {message && (
            <div className={`alert mt-3 text-center ${
              message.includes('réussie') ? 'alert-success' : 'alert-danger'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Illustration Section */}
        <div className="login-image d-none d-md-block">
          <img src="/img/images.jpeg" alt="Illustration de connexion" className="img-fluid h-100 w-100 object-fit-cover" />
        </div>
      </div>
    </div>
  )
}

export default Login