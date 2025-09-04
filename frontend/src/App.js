import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EnseignantDashboard from './components/EnseignantDashboard';
import EtudiantDashboard from './components/EtudiantDashboard';
import Forum from './components/Forum';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  useEffect(() => {
    // Script Tawk.to
    var Tawk_API = Tawk_API || {};
    var Tawk_LoadStart = new Date();
    (function () {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/67c0cfcdeb8eb2190ceecf81/1il4inepe';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();
  }, []);

  return (
    <Router>
      <div className="container mt-3">
        <Routes>
       <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/enseignant" 
            element={
              <ProtectedRoute requiredRole="enseignant">
                <EnseignantDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/etudiant" 
            element={
              <ProtectedRoute requiredRole="etudiant">
                <EtudiantDashboard />
              </ProtectedRoute>
            } 
          />
          // Ajouter cette nouvelle route
<Route path="/forum" element={<Forum />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
