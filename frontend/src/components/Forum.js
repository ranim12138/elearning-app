import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaThumbsUp, FaThumbsDown, FaFilter, FaEdit, FaComments } from 'react-icons/fa';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newPost, setNewPost] = useState({ 
    titre: '', 
    contenu: '',
    categorie: 'général'
  });
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [categories] = useState([
    'général', 'questions', 'discussions', 'aide', 'projets'
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState('toutes');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, selectedCourse]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forum');
      setPosts(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des posts:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
    }
  };

  const filterPosts = () => {
    let result = [...posts];
    
    if (selectedCategory !== 'toutes') {
      result = result.filter(post => post.categorie === selectedCategory);
    }
    
    if (selectedCourse) {
      result = result.filter(post => post.cours?._id === selectedCourse);
    }
    
    setFilteredPosts(result);
  };

  const handleCreatePost = async () => {
    try {
      await axios.post('http://localhost:5000/api/forum', {
        titre: newPost.titre,
        contenu: newPost.contenu,
        auteurId: user._id,
        courseId: selectedCourse,
        categorie: newPost.categorie
      });
      
      setNewPost({ titre: '', contenu: '', categorie: 'général' });
      setIsCreatingPost(false);
      fetchPosts();
    } catch (err) {
      console.error('Erreur lors de la création du post:', err);
    }
  };

  const handleReply = async (postId, content) => {
    if (!content.trim()) return;
    
    try {
      await axios.post(`http://localhost:5000/api/forum/${postId}/repondre`, {
        contenu: content,
        auteurId: user._id
      });
      fetchPosts();
    } catch (err) {
      console.error('Erreur lors de la réponse:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Supprimer ce post ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/forum/${postId}`);
        fetchPosts();
      } catch (err) {
        console.error('Erreur suppression post:', err);
      }
    }
  };

  const handleReaction = async (postId, action, reponseId = null) => {
    const userId = user._id;
    
    try {
      if (reponseId) {
        await axios.post(`http://localhost:5000/api/forum/${postId}/reponse/${reponseId}/reaction`, {
          userId,
          action
        });
      } else {
        await axios.post(`http://localhost:5000/api/forum/${postId}/reaction`, {
          userId,
          action
        });
      }
      fetchPosts();
    } catch (err) {
      console.error('Erreur réaction:', err);
    }
  };

  const isLiked = (item, userId) => {
    return item.likes && item.likes.some(id => id.toString() === userId);
  };

  const isDisliked = (item, userId) => {
    return item.dislikes && item.dislikes.some(id => id.toString() === userId);
  };

  const togglePostView = (postId) => {
    if (activePost === postId) {
      setActivePost(null);
    } else {
      setActivePost(postId);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaComments className="me-2 text-primary" />
          Forum de discussion
        </h2>
        <button 
          className="btn btn-primary d-md-none"
          onClick={() => setIsCreatingPost(!isCreatingPost)}
        >
          <FaPlus className="me-1" /> {isCreatingPost ? 'Annuler' : 'Nouveau post'}
        </button>
      </div>
      
      <div className="row">
        {/* Filtres et création de post - Colonne gauche */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 d-flex align-items-center">
                <FaFilter className="me-2 text-muted" /> Filtres
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Catégorie</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="toutes">Toutes les catégories</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-bold">Cours</label>
                <select
                  className="form-select"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Tous les cours</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.titre}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-primary w-100 d-none d-md-block"
                onClick={() => setIsCreatingPost(!isCreatingPost)}
              >
                <FaPlus className="me-1" /> {isCreatingPost ? 'Annuler' : 'Créer un post'}
              </button>
            </div>
          </div>
          
          {/* Création de post - visible uniquement quand activé */}
          {isCreatingPost && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Nouveau post</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Titre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPost.titre}
                    onChange={(e) => setNewPost({...newPost, titre: e.target.value})}
                    placeholder="Titre de votre post"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Catégorie</label>
                  <select
                    className="form-select"
                    value={newPost.categorie}
                    onChange={(e) => setNewPost({...newPost, categorie: e.target.value})}
                  >
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Contenu</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={newPost.contenu}
                    onChange={(e) => setNewPost({...newPost, contenu: e.target.value})}
                    placeholder="Décrivez votre question ou sujet de discussion..."
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Cours concerné</label>
                  <select
                    className="form-select"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.titre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  className="btn btn-success w-100"
                  onClick={handleCreatePost}
                  disabled={!selectedCourse || !newPost.titre.trim()}
                >
                  <FaPlus className="me-1" /> Publier
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Liste des posts - Colonne droite */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              {selectedCategory === 'toutes' 
                ? 'Tous les posts' 
                : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              <span className="badge bg-primary ms-2">{filteredPosts.length}</span>
            </h4>
            
            <div className="d-none d-md-block">
              <span className="badge bg-light text-dark border">
                {selectedCourse 
                  ? courses.find(c => c._id === selectedCourse)?.titre || 'Tous les cours'
                  : 'Tous les cours'}
              </span>
            </div>
          </div>
          
          {filteredPosts.length === 0 ? (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="display-1 text-muted mb-3">📭</div>
                <h4>Aucun post trouvé</h4>
                <p className="text-muted">
                  {selectedCategory === 'toutes' 
                    ? 'Soyez le premier à créer un post !' 
                    : `Aucun post dans la catégorie "${selectedCategory}"`}
                </p>
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => setIsCreatingPost(true)}
                >
                  <FaPlus className="me-1" /> Créer un post
                </button>
              </div>
            </div>
          ) : (
            <div className="posts-container">
              {filteredPosts.map(post => (
                <div key={post._id} className="card shadow-sm mb-4 border-0">
                  <div 
                    className="card-header bg-white d-flex justify-content-between align-items-center cursor-pointer"
                    onClick={() => togglePostView(post._id)}
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center">
                        <span className="badge bg-info me-2 mb-1">
                          {post.categorie.charAt(0).toUpperCase() + post.categorie.slice(1)}
                        </span>
                        <h5 className="mb-0 d-inline-block">{post.titre}</h5>
                      </div>
                      
                      <div className="d-flex flex-wrap text-muted small mt-1">
                        <span className="me-3">
                          <FaEdit className="me-1" />
                          {post.auteur?.name} ({post.auteur?.role})
                        </span>
                        <span>
                          {new Date(post.date).toLocaleDateString()} | 
                          Cours: {post.cours?.titre || 'Général'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="d-flex ms-2">
                      <div className="d-flex align-items-center me-2">
                        <button 
                          className={`btn btn-sm ${isLiked(post, user._id) ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(post._id, 'like');
                          }}
                        >
                          <FaThumbsUp />
                        </button>
                        <span className="ms-1 reaction-count">{post.likes?.length || 0}</span>
                      </div>
                      
                      <div className="d-flex align-items-center me-2">
                        <button 
                          className={`btn btn-sm ${isDisliked(post, user._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(post._id, 'dislike');
                          }}
                        >
                          <FaThumbsDown />
                        </button>
                        <span className="ms-1 reaction-count">{post.dislikes?.length || 0}</span>
                      </div>
                      
                      {(user.role === 'admin' || user._id === post.auteur?._id) && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post._id);
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {(activePost === post._id) && (
                    <>
                      <div className="card-body border-top">
                        <div className="post-content mb-3">
                          {post.contenu.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                        
                        <div className="mt-4">
                          <h6 className="d-flex align-items-center">
                            <span className="me-2">Réponses</span>
                            <span className="badge bg-secondary">{post.reponses?.length || 0}</span>
                          </h6>
                          
                          <div className="reponses-container mt-3">
                            {post.reponses?.map((reponse, index) => (
                              <div key={index} className="card mb-3 bg-light">
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <p className="mb-1">{reponse.contenu}</p>
                                      <small className="text-muted">
                                        {reponse.auteur?.name} ({reponse.auteur?.role}) - 
                                        {new Date(reponse.date).toLocaleDateString()}
                                      </small>
                                    </div>
                                    
                                    <div className="d-flex">
                                      <div className="d-flex align-items-center me-2">
                                        <button 
                                          className={`btn btn-sm ${isLiked(reponse, user._id) ? 'btn-success' : 'btn-outline-success'}`}
                                          onClick={() => handleReaction(post._id, 'like', reponse._id)}
                                        >
                                          <FaThumbsUp size={12} />
                                        </button>
                                        <span className="ms-1 reaction-count">{reponse.likes?.length || 0}</span>
                                      </div>
                                      
                                      <div className="d-flex align-items-center">
                                        <button 
                                          className={`btn btn-sm ${isDisliked(reponse, user._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                                          onClick={() => handleReaction(post._id, 'dislike', reponse._id)}
                                        >
                                          <FaThumbsDown size={12} />
                                        </button>
                                        <span className="ms-1 reaction-count">{reponse.dislikes?.length || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <div className="mt-3">
                              <textarea
                                className="form-control mb-2"
                                placeholder="Écrivez votre réponse..."
                                rows="3"
                              ></textarea>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  const textarea = e.target.previousElementSibling;
                                  handleReply(post._id, textarea.value);
                                  textarea.value = '';
                                }}
                              >
                                Publier la réponse
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        
        .posts-container {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .post-content p:last-child {
          margin-bottom: 0;
        }
        
        .reponses-container {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 10px;
        }
        
        .reaction-count {
          min-width: 25px;
          text-align: center;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .card-header > div:first-child {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Forum;