import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from './Header'
import CourseContentManager from './CourseContentManager'
import QuizManager from './QuizManager'
import EvaluationManager from './EvaluationManager'
import { FaBook, FaEdit, FaTrash, FaUsers, FaPlus, FaTimes, FaFileAlt, FaChartBar, FaUserEdit } from 'react-icons/fa'
import { FaComments } from 'react-icons/fa';
import Forum from './Forum'
import Chat from './Chat';
import EditProfile from './EditProfile';

function EnseignantDashboard() {
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({ titre: '', description: '', niveau: '', categorie: '' })
  const [editCourse, setEditCourse] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('courses')
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    setUser(storedUser)
    if (storedUser) {
      fetchCourses()
    }
  }, [])

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

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses')
      setCourses(res.data)
    } catch (error) {
      console.error('Erreur lors du chargement des cours', error)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/courses', {
        ...form,
        enseignant: user._id
      })
      setForm({ titre: '', description: '', niveau: '', categorie: '' })
      fetchCourses()
      setActiveTab('courses')
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce cours ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`)
        fetchCourses()
      } catch (error) {
        console.error('Erreur lors de la suppression', error)
      }
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:5000/api/courses/${editCourse._id}`, editCourse)
      setEditCourse(null)
      fetchCourses()
    } catch (err) {
      console.error(err)
    }
  }

  const showCourseDetails = async (courseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${courseId}`)
      setSelectedCourseDetails(res.data)
    } catch (err) {
      alert('Erreur lors du chargement des étudiants inscrits')
    }
  }

  const courseStats = {
    totalCourses: courses.filter(c => c.enseignant?._id === user?._id).length,
    activeCourses: courses.filter(c => c.enseignant?._id === user?._id && c.inscrits?.length > 0).length,
    totalStudents: courses.reduce((acc, course) => {
      if (course.enseignant?._id === user?._id) {
        return acc + (course.inscrits?.length || 0)
      }
      return acc
    }, 0)
  }

  return (
    <div className="enseignant-dashboard">
      <Header onEditProfile={() => setShowEditProfile(true)} />
      
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar bg-dark text-white p-3">
            <div className="d-flex flex-column align-items-center mb-4">
              <div className="bg-primary rounded-circle p-3 mb-2">
                <FaBook size={30} />
              </div>
              <h4>Dashboard Enseignant</h4>
            </div>
            
            <ul className="nav flex-column">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <FaChartBar className="me-2" /> Tableau de bord
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('courses')}
                >
                  <FaBook className="me-2" /> Mes cours
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'add' ? 'active' : ''}`}
                  onClick={() => setActiveTab('add')}
                >
                  <FaPlus className="me-2" /> Ajouter un cours
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
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setShowEditProfile(true)}
                >
                  <FaUserEdit className="me-2" /> Modifier profil
                </button>
              </li>
            </ul>
          </div>
          
          {/* Main Content */}
          <div className="col-md-9 col-lg-10 main-content p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                {activeTab === 'dashboard' ? 'Tableau de bord' : 
                 activeTab === 'courses' ? 'Mes cours' : 
                 activeTab === 'add' ? 'Ajouter un cours' : 
                 'Gestion du cours'}
              </h2>
              <div className="d-flex align-items-center">
                <span className="badge bg-primary rounded-pill me-2">Enseignant</span>
                <div className="bg-light p-2 rounded-circle">
                  <FaBook className="text-primary" />
                </div>
              </div>
            </div>

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
            
            {/* Tableau de bord */}
            {activeTab === 'dashboard' && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card bg-primary text-white shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Cours créés</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{courseStats.totalCourses}</h2>
                        <FaBook size={30} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-success text-white shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Cours actifs</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{courseStats.activeCourses}</h2>
                        <FaBook size={30} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-info text-white shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Étudiants inscrits</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{courseStats.totalStudents}</h2>
                        <FaUsers size={30} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Liste des cours */}
            {activeTab === 'courses' && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Liste de mes cours</h5>
                </div>
                <div className="card-body">
                  {courses.filter(course => course.enseignant?._id === user?._id).length === 0 ? (
                    <div className="alert alert-info">Aucun cours créé pour le moment.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Titre</th>
                            <th>Niveau</th>
                            <th>Catégorie</th>
                            <th>Étudiants</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses
                            .filter(course => course.enseignant?._id === user?._id)
                            .map(course => (
                              <tr key={course._id}>
                                <td>{course.titre}</td>
                                <td>{course.niveau}</td>
                                <td>{course.categorie}</td>
                                <td>
                                  <span className="badge bg-primary rounded-pill">
                                    {course.inscrits?.length || 0}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex">
                                    <button 
                                      className="btn btn-sm btn-warning me-2"
                                      onClick={() => setEditCourse(course)}
                                    >
                                      <FaEdit className="me-1" /> Modifier
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-danger me-2"
                                      onClick={() => handleDelete(course._id)}
                                    >
                                      <FaTrash className="me-1" /> Supprimer
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-info me-2"
                                      onClick={() => {
                                        setSelectedCourseId(course._id)
                                        setActiveTab('content')
                                      }}
                                    >
                                      <FaFileAlt className="me-1" /> Contenus
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-secondary"
                                      onClick={() => showCourseDetails(course._id)}
                                    >
                                      <FaUsers className="me-1" /> Étudiants
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Formulaire d'ajout de cours */}
            {activeTab === 'add' && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Ajouter un nouveau cours</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Titre du cours</label>
                      <input 
                        type="text" 
                        name="titre" 
                        className="form-control" 
                        value={form.titre} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea 
                        name="description" 
                        className="form-control" 
                        value={form.description} 
                        onChange={handleChange} 
                        required 
                        rows="3"
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Niveau</label>
                        <input 
                          type="text" 
                          name="niveau" 
                          className="form-control" 
                          value={form.niveau} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Catégorie</label>
                        <input 
                          type="text" 
                          name="categorie" 
                          className="form-control" 
                          value={form.categorie} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button 
                        type="button" 
                        className="btn btn-secondary me-2"
                        onClick={() => setActiveTab('courses')}
                      >
                        <FaTimes className="me-1" /> Annuler
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <FaPlus className="me-1" /> Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Gestion des contenus */}
            {activeTab === 'content' && selectedCourseId && (
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Gestion des contenus du cours</h5>
                    <button 
                      className="btn btn-sm btn-light"
                      onClick={() => setActiveTab('courses')}
                    >
                      <FaTimes className="me-1" /> Retour aux cours
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <CourseContentManager courseId={selectedCourseId} />
                  <QuizManager courseId={selectedCourseId} />
                  <EvaluationManager courseId={selectedCourseId} />
                </div>
              </div>
            )}
            
            {/* Modifier un cours */}
            {editCourse && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <div className="modal-header bg-warning text-dark">
                    <h5 className="modal-title">Modifier le cours</h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setEditCourse(null)}
                    />
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleEditSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Titre</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={editCourse.titre} 
                          onChange={(e) => setEditCourse({ ...editCourse, titre: e.target.value })} 
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea 
                          className="form-control" 
                          value={editCourse.description} 
                          onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })} 
                          rows="3"
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Niveau</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editCourse.niveau} 
                            onChange={(e) => setEditCourse({ ...editCourse, niveau: e.target.value })} 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Catégorie</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editCourse.categorie} 
                            onChange={(e) => setEditCourse({ ...editCourse, categorie: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2"
                          onClick={() => setEditCourse(null)}
                        >
                          <FaTimes className="me-1" /> Annuler
                        </button>
                        <button type="submit" className="btn btn-success">
                          <FaEdit className="me-1" /> Enregistrer
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {/* Étudiants inscrits */}
            {selectedCourseDetails && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">
                      Étudiants inscrits à : {selectedCourseDetails.titre}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close"
                      onClick={() => setSelectedCourseDetails(null)}
                    />
                  </div>
                  <div className="modal-body">
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
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setSelectedCourseDetails(null)}
                    >
                      <FaTimes className="me-1" /> Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modifier le profil */}
      {showEditProfile && (
        <EditProfile 
          user={user} 
          onUpdate={(updatedUser) => {
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setShowEditProfile(false);
          }} 
          onCancel={() => setShowEditProfile(false)}
        />
      )}
      
      <style>{`
        .enseignant-dashboard {
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        
        .enseignant-dashboard .sidebar {
          min-height: calc(100vh - 56px);
          position: sticky;
          top: 56px;
        }
        
        .enseignant-dashboard .nav-link {
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s;
          border-radius: 5px;
          padding: 10px 15px;
          margin-bottom: 5px;
        }
        
        .enseignant-dashboard .nav-link:hover, 
        .enseignant-dashboard .nav-link.active {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .enseignant-dashboard .main-content {
          background-color: #f8f9fc;
        }
        
        .enseignant-dashboard .card {
          border: none;
          border-radius: 10px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .enseignant-dashboard .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .enseignant-dashboard .table-hover tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        
        .enseignant-dashboard .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        
        .enseignant-dashboard .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
        }
      `}</style>
    </div>
  )
}

export default EnseignantDashboard