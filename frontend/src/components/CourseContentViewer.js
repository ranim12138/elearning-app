import { useEffect, useState } from 'react'
import axios from 'axios'

function CourseContentViewer({ courseId }) {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (courseId) {
      fetchContents()
    }
  }, [courseId])

  const fetchContents = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`http://localhost:5000/api/contents/course/${courseId}`)
      setContents(res.data)
      setError(null)
    } catch (error) {
      console.error('Erreur lors du chargement des contenus :', error)
      setError('Impossible de charger les contenus')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour déterminer le type de contenu basé sur l'extension
  const getContentType = (filename) => {
    if (!filename) return 'unknown'
    
    const ext = filename.split('.').pop().toLowerCase()
    if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(ext)) {
      return 'video'
    } else if (['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'].includes(ext)) {
      return 'document'
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
      return 'image'
    }
    return 'unknown'
  }

  // Fonction pour obtenir l'icône appropriée
  const getFileIcon = (filename) => {
    const type = getContentType(filename)
    switch (type) {
      case 'video': return '🎬'
      case 'document': return '📄'
      case 'image': return '🖼️'
      default: return '📁'
    }
  }

  if (loading) {
    return <div className="mt-3">Chargement des contenus...</div>
  }

  if (error) {
    return <div className="mt-3 alert alert-warning">{error}</div>
  }

  return (
    <div className="mt-4">
      <h5>Contenus du cours</h5>
      {contents.length === 0 ? (
        <p>Aucun contenu disponible.</p>
      ) : (
        <div className="list-group">
          {contents.map(c => {
            const fileType = getContentType(c.fichier)
            return (
              <div key={c._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{c.titre}</strong> 
                    <span className="badge bg-secondary ms-2">{c.type || fileType}</span>
                    <br />
                    {c.description && <small className="text-muted">{c.description}</small>}
                  </div>
                  <span>{getFileIcon(c.fichier)}</span>
                </div>
                
                {fileType === 'document' && (
                  <a
                    href={`http://localhost:5000${c.fichier}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm mt-2"
                  >
                    📄 Télécharger le document
                  </a>
                )}
                
                {fileType === 'video' && (
                  <div className="mt-2">
                    <video 
                      width="100%" 
                      controls 
                      className="rounded"
                      preload="metadata"
                    >
                      <source src={`http://localhost:5000${c.fichier}`} type="video/mp4" />
                      <source src={`http://localhost:5000${c.fichier}`} type="video/webm" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                )}
                
                {fileType === 'image' && (
                  <div className="mt-2">
                    <img 
                      src={`http://localhost:5000${c.fichier}`} 
                      alt={c.titre}
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
                
                {fileType === 'unknown' && (
                  <a
                    href={`http://localhost:5000${c.fichier}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-secondary btn-sm mt-2"
                  >
                    📁 Ouvrir le fichier
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CourseContentViewer