import React from 'react'

function Header({ onEditProfile }) {
  const user = JSON.parse(localStorage.getItem('user'))

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center">
      <div>Bonjour <strong>{user.name}</strong> </div>
      <div>
        <button className="btn btn-outline-primary btn-sm me-2" onClick={onEditProfile}>
          Modifier profil
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default Header