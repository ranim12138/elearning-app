import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from './Header'
import CourseContentViewer from './CourseContentViewer'
import QuizPasser from './QuizPasser'
import EvaluationPasser from './EvaluationPasser'
import { FaBook, FaGraduationCap, FaSearch, FaUserGraduate, FaChartLine, FaFileAlt, FaUserEdit } from 'react-icons/fa'
import { FaComments } from 'react-icons/fa';
import Forum from './Forum'
import Chat from './Chat';
import EditProfile from './EditProfile';

function EtudiantDashboard() {
  const [user, setUser] = useState(null)
  const [allCourses, setAllCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [activeTab, setActiveTab] = useState('all-courses')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (storedUser) {
      setUser(storedUser)
      fetchAllCourses()
      fetchMyCourses(storedUser._id)
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

  const fetchAllCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses')
      setAllCourses(res.data)
    } catch (error) {
      console.error('Erreur lors du chargement des cours', error)
    }
  }

  const fetchMyCourses = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/mescours/${userId}`)
      setMyCourses(res.data)
    } catch (error) {
      console.error('Erreur lors du chargement de mes cours', error)
    }
  }

  const handleInscription = async (courseId) => {
    try {
      await axios.post(`http://localhost:5000/api/courses/${courseId}/inscrire`, {
        userId: user._id
      })
      fetchMyCourses(user._id)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l’inscription')
    }
  }

  const isInscrit = (courseId) => {
    return myCourses.some(c => c._id === courseId)
  }

  const studentStats = {
    totalCourses: myCourses.length,
    activeCourses: myCourses.filter(c => c.inscrits?.length > 0).length,
    upcomingActivities: 3
  }

  const filteredCourses = activeTab === 'all-courses' 
    ? allCourses.filter(course => 
        course.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : myCourses.filter(course => 
        course.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categorie.toLowerCase().includes(searchTerm.toLowerCase())
      )

  return (
    <div className="etudiant-dashboard">
      <Header onEditProfile={() => setShowEditProfile(true)} />
      
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 sidebar bg-dark text-white p-3">
            <div className="d-flex flex-column align-items-center mb-4">
              <div className="bg-success rounded-circle p-3 mb-2">
                <FaUserGraduate size={30} />
              </div>
              <h4>Dashboard Étudiant</h4>
            </div>
            
            <ul className="nav flex-column">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <FaChartLine className="me-2" /> Tableau de bord
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'all-courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all-courses')}
                >
                  <FaSearch className="me-2" /> Cours disponibles
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start w-100 ${activeTab === 'my-courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my-courses')}
                >
                  <FaBook className="me-2" /> Mes cours
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
                 activeTab === 'all-courses' ? 'Cours disponibles' : 
                 activeTab === 'my-courses' ? 'Mes cours' : 
                 'Détails du cours'}
              </h2>
              <div className="d-flex align-items-center">
                <span className="badge bg-success rounded-pill me-2">Étudiant</span>
                <div className="bg-light p-2 rounded-circle">
                  <FaUserGraduate className="text-success" />
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
                      <h5 className="card-title">Cours suivis</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{studentStats.totalCourses}</h2>
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
                        <h2 className="mb-0">{studentStats.activeCourses}</h2>
                        <FaBook size={30} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-info text-white shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Activités à venir</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{studentStats.upcomingActivities}</h2>
                        <FaFileAlt size={30} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Mes cours récents</h5>
                    </div>
                    <div className="card-body">
                      {myCourses.length === 0 ? (
                        <div className="alert alert-info">
                          Vous n'êtes inscrit à aucun cours pour le moment.
                        </div>
                      ) : (
                        <div className="row">
                          {myCourses.slice(0, 3).map(course => (
                            <div key={course._id} className="col-md-4 mb-3">
                              <div 
                                className="card h-100 course-card"
                                onClick={() => {
                                  setSelectedCourseId(course._id)
                                  setActiveTab('course-details')
                                }}
                              >
                                <div className="card-body">
                                  <h5 className="card-title">{course.titre}</h5>
                                  <p className="card-text text-muted">{course.categorie}</p>
                                  <div className="d-flex justify-content-between">
                                    <span className="badge bg-primary">{course.niveau}</span>
                                    <span className="text-muted">
                                      {course.inscrits?.length || 0} étudiants
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-center mt-3">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => setActiveTab('my-courses')}
                        >
                          Voir tous mes cours
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Cours disponibles */}
            {activeTab === 'all-courses' && (
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Tous les cours disponibles</h5>
                    <div className="d-flex" style={{ width: '300px' }}>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rechercher un cours..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {filteredCourses.length === 0 ? (
                    <div className="alert alert-info text-center">
                      Aucun cours disponible pour le moment.
                    </div>
                  ) : (
                    <div className="row">
                      {filteredCourses.map(course => (
                        <div key={course._id} className="col-md-6 mb-4">
                          <div className="card h-100 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <h5 className="card-title">{course.titre}</h5>
                                <span className="badge bg-info">{course.categorie}</span>
                              </div>
                              <p className="card-text text-muted">{course.description}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge bg-primary">{course.niveau}</span>
                                <span className="text-muted">
                                  {course.inscrits?.length || 0} étudiants inscrits
                                </span>
                              </div>
                            </div>
                            <div className="card-footer bg-transparent border-top-0">
                              {isInscrit(course._id) ? (
                                <button
                                  className="btn btn-success w-100"
                                  onClick={() => {
                                    setSelectedCourseId(course._id)
                                    setActiveTab('course-details')
                                  }}
                                >
                                  Accéder au cours
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-primary w-100"
                                  onClick={() => handleInscription(course._id)}
                                >
                                  S'inscrire
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mes cours */}
            {activeTab === 'my-courses' && (
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Mes cours</h5>
                    <div className="d-flex" style={{ width: '300px' }}>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rechercher dans mes cours..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {filteredCourses.length === 0 ? (
                    <div className="alert alert-info text-center">
                      Vous n'êtes inscrit à aucun cours pour le moment.
                    </div>
                  ) : (
                    <div className="row">
                      {filteredCourses.map(course => (
                        <div key={course._id} className="col-md-4 mb-4">
                          <div 
                            className="card h-100 shadow-sm course-card"
                            onClick={() => {
                              setSelectedCourseId(course._id)
                              setActiveTab('course-details')
                            }}
                          >
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <h5 className="card-title">{course.titre}</h5>
                                <span className="badge bg-info">{course.categorie}</span>
                              </div>
                              <p className="card-text text-muted">{course.description.substring(0, 80)}...</p>
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <span className="badge bg-primary">{course.niveau}</span>
                                <span className="text-muted">
                                  {course.inscrits?.length || 0} étudiants
                                </span>
                              </div>
                            </div>
                            <div className="card-footer bg-transparent border-top-0 text-center">
                              <span className="badge bg-success">Inscrit</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Détails du cours */}
            {activeTab === 'course-details' && selectedCourseId && (
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Détails du cours</h5>
                    <button 
                      className="btn btn-sm btn-light"
                      onClick={() => setActiveTab('my-courses')}
                    >
                      Retour à mes cours
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <CourseContentViewer courseId={selectedCourseId} />
                  <div className="mt-4">
                    <EvaluationPasser courseId={selectedCourseId} etudiantId={user?._id} />
                  </div>
                  <div className="mt-4">
                    <QuizPasser courseId={selectedCourseId} etudiantId={user?._id} />
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
      
      <style jsx>{`
        .etudiant-dashboard {
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
        
        .course-card {
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .course-card:hover {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          border: 1px solid #0d6efd;
        }
        
        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default EtudiantDashboard