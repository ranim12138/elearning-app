import { useEffect, useState } from 'react'
import axios from 'axios'

function CourseContentManager({ courseId }) {
  const [contents, setContents] = useState([])
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type: 'document',
    fichier: null
  })

  useEffect(() => {
    if (courseId) fetchContents()
  }, [courseId])

  const fetchContents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contents/course/${courseId}`)
      setContents(res.data)
    } catch (err) {
      console.error('Erreur lors du chargement des contenus:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'fichier') {
      setForm({ ...form, fichier: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (!storedUser || !storedUser._id) {
      alert('Utilisateur non connecté')
      return
    }

    try {
      // Upload fichier
      const formData = new FormData()
      formData.append('file', form.fichier)  // attention: le backend attend 'file' ?

      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Enregistrer contenu avec le champ course obligatoire
      await axios.post('http://localhost:5000/api/contents', {
        titre: form.titre,
        description: form.description,
        type: form.type,
        fichier: uploadRes.data.url,
        course: courseId,       // <--- Ne pas oublier ce champ !
        enseignant: storedUser._id
      })

      setForm({ titre: '', description: '', type: 'document', fichier: null })
      fetchContents()
    } catch (err) {
      console.error('Erreur lors de l’ajout de contenu:', err)
      alert('Une erreur est survenue lors de l’ajout du contenu.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce contenu ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contents/${id}`)
        fetchContents()
      } catch (err) {
        console.error('Erreur suppression contenu:', err)
      }
    }
  }

  return (
    <div className="mt-3 mb-4">
      <h5>Ajouter un contenu</h5>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titre"
          placeholder="Titre"
          className="form-control mb-2"
          value={form.titre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          className="form-control mb-2"
          value={form.description}
          onChange={handleChange}
          required
        />
        <select
          name="type"
          className="form-select mb-2"
          value={form.type}
          onChange={handleChange}
        >
          <option value="document">Document</option>
          <option value="video">Vidéo</option>
        </select>
        <input
          type="file"
          name="fichier"
          className="form-control mb-2"
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary">Ajouter</button>
      </form>

      <h6 className="mt-4">Contenus existants</h6>
      <ul className="list-group">
        {contents.map(c => (
          <li
            key={c._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{c.titre}</strong> ({c.type})<br />
              <small>{c.description}</small>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(c._id)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CourseContentManager
