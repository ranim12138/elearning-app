import { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import Header from './Header'
import { FaEye, FaEdit, FaTrash, FaSave, FaTimes, FaUserPlus, FaGraduationCap, FaComments } from 'react-icons/fa'
import Forum from './Forum'
import Chat from './Chat';

function AdminDashboard() {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant'
  })

  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users', 'courses', 'messages'
  const [selectedUser, setSelectedUser] = useState(null)
// Ajoutez ce useEffect dans chaque dashboard
useEffect(() => {
  const handleBackButton = (e) => {
    e.preventDefault();
    window.history.forward();
  };

  window.history.pushState(null, null, window.location.pathname);
  window.addEventListener('popstate', handleBackButton);

  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, []);


  useEffect(() => {
    fetchUsers()
    fetchCourses()
  }, [])

  const fetchUsers = () => {
    axios.get('http://localhost:5000/api/auth/users')
      .then(res => setUsers(res.data))
      .catch(err => console.log(err))
  }

  const fetchCourses = () => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.log(err))
  }

  const handleAddChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value })
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/auth/register', newUser)
      setNewUser({ name: '', email: '', password: '', role: 'etudiant' })
      fetchUsers()
    } catch (err) {
      console.log(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tu es sûre de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/users/${id}`)
        setUsers(users.filter(user => user._id !== id))
      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${editUser._id}`, editUser)
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      console.log(err)
    }
  }

  const showCourseDetails = async (courseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`)
      setSelectedCourseDetails(res.data)
    } catch (err) {
      alert('Erreur lors du chargement des détails du cours')
    }
  }

  return (
    <div className="admin-dashboard">
      <Header />
      
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar bg-dark text-white p-3">
            <div className="d-flex flex-column align-items-center mb-4">
              <FaGraduationCap size={40} className="mb-2" />
              <h4>Admin Dashboard</h4>
            </div>
            
            <ul className="nav flex-column">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <FaUserPlus className="me-2" /> Gestion Utilisateurs
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('courses')}
                >
                  <FaGraduationCap className="me-2" /> Cours & Formations
                </button>
              </li>
<li className="nav-item">
  <button 
    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'forum' ? 'active' : ''}`}
    onClick={() => setActiveTab('forum')}
  >
    <FaComments className="me-2" /> Forum
  </button>
</li>
<li className="nav-item">
  <button 
    className={`nav-link btn btn-link text-start w-100 ${activeTab === 'chat' ? 'active' : ''}`}
    onClick={() => setActiveTab('chat')}
  >
    <FaComments className="me-2" /> Messagerie
  </button>
</li>

             
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="col-md-9 col-lg-10 main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                {activeTab === 'users' ? 'Gestion des utilisateurs' : 
                 activeTab === 'courses' ? 'Gestion des cours' : 
                 'Messagerie'}
              </h2>
              <div className="bg-primary text-white p-2 rounded">
                <span className="fw-bold">Admin</span>
              </div>
            </div>
            
         
            
            {/* Gestion des cours */}
{activeTab === 'forum' && (
  <div className="card shadow-sm">
    <div className="card-body">
      <Forum />
    </div>
  </div>
)}
{activeTab === 'chat' && (
  <div className="card shadow-sm">
    <div className="card-header bg-info text-white">
      <h5 className="mb-0">Messagerie instantanée</h5>
    </div>
    <div className="card-body">
      <Chat />
    </div>
  </div>
)}
            {activeTab === 'courses' && (
              <>
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Liste des cours</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Titre</th>
                            <th>Niveau</th>
                            <th>Catégorie</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.length === 0 ? (
                            <tr><td colSpan="4" className="text-center">Aucun cours disponible</td></tr>
                          ) : (
                            courses.map(course => (
                              <tr key={course._id}>
                                <td>{course.titre}</td>
                                <td>{course.niveau}</td>
                                <td>{course.categorie}</td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-info me-2"
                                    onClick={() => showCourseDetails(course._id)}
                                  >
                                    <FaEye className="me-1" /> Voir étudiants
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {selectedCourseDetails && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-header bg-info text-white">
                      <h5 className="mb-0">
                        Étudiants inscrits à : {selectedCourseDetails.titre}
                      </h5>
                    </div>
                    <div className="card-body">
                      <ul className="list-group">
                        {selectedCourseDetails.inscrits.length === 0 ? (
                          <li className="list-group-item">Aucun étudiant inscrit</li>
                        ) : (
                          selectedCourseDetails.inscrits.map(etud => (
                            <li key={etud._id} className="list-group-item d-flex justify-content-between align-items-center">
                              <div>
                                <span className="fw-bold">{etud.name}</span> ({etud.email})
                              </div>
                              <span className="badge bg-primary rounded-pill">
                                {etud.role}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                      <div className="mt-3 text-end">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setSelectedCourseDetails(null)}
                        >
                          <FaTimes className="me-1" /> Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Gestion des utilisateurs */}
            {activeTab === 'users' && (
              <>
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Liste des utilisateurs</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr><td colSpan="4" className="text-center">Aucun utilisateur trouvé</td></tr>
                          ) : (
                            users.map(user => (
                              <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                  <span className={`badge ${
                                    user.role === 'admin' ? 'bg-danger' : 
                                    user.role === 'enseignant' ? 'bg-warning text-dark' : 'bg-success'
                                  } rounded-pill`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => setEditUser(user)}
                                  >
                                    <FaEdit className="me-1" /> Modifier
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(user._id)}
                                  >
                                    <FaTrash className="me-1" /> Supprimer
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {editUser && (
                  <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                      <h5 className="mb-0">Modifier l'utilisateur</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handleEditSubmit}>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Nom</label>
                            <input 
                              type="text" 
                              name="name" 
                              className="form-control" 
                              value={editUser.name} 
                              onChange={handleEditChange} 
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              name="email" 
                              className="form-control" 
                              value={editUser.email} 
                              onChange={handleEditChange} 
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Rôle</label>
                          <select 
                            name="role" 
                            className="form-select" 
                            value={editUser.role} 
                            onChange={handleEditChange}
                          >
                            <option value="admin">Admin</option>
                            <option value="enseignant">Enseignant</option>
                            <option value="etudiant">Étudiant</option>
                          </select>
                        </div>
                        <div className="d-flex justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-secondary me-2"
                            onClick={() => setEditUser(null)}
                          >
                            <FaTimes className="me-1" /> Annuler
                          </button>
                          <button type="submit" className="btn btn-success">
                            <FaSave className="me-1" /> Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="card shadow-sm">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">Ajouter un nouvel utilisateur</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleAddSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Nom complet</label>
                          <input 
                            type="text" 
                            name="name" 
                            className="form-control" 
                            value={newUser.name} 
                            onChange={handleAddChange} 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <input 
                            type="email" 
                            name="email" 
                            className="form-control" 
                            value={newUser.email} 
                            onChange={handleAddChange} 
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Mot de passe</label>
                          <input 
                            type="password" 
                            name="password" 
                            className="form-control" 
                            value={newUser.password} 
                            onChange={handleAddChange} 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Confirmer mot de passe</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={newUser.confirmPassword}
                            onChange={handleAddChange}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Rôle</label>
                        <select 
                          name="role" 
                          className="form-select" 
                          value={newUser.role} 
                          onChange={handleAddChange}
                        >
                          <option value="etudiant">Étudiant</option>
                          <option value="enseignant">Enseignant</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary">
                          <FaUserPlus className="me-1" /> Ajouter utilisateur
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        
        .sidebar {
          min-height: calc(100vh - 56px);
          position: sticky;
          top: 56px;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s;
          border-radius: 5px;
          padding: 10px 15px;
          margin-bottom: 5px;
        }
        
        .nav-link:hover, .nav-link.active {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .main-content {
          background-color: #f8f9fc;
        }
        
        .card {
          border: none;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        /* Messagerie */
        .messaging-container {
          display: flex;
          height: calc(100vh - 200px);
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .user-list-container {
          width: 300px;
          border-right: 1px solid #ddd;
          overflow-y: auto;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .select-user-prompt {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #777;
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard