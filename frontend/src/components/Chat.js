import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FaPaperPlane, FaUsers, FaComment, FaExclamationTriangle, FaEllipsisV, FaSearch, FaUserCircle } from 'react-icons/fa';

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user')) || { name: "Utilisateur", _id: "1", role: "user" };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token non trouvé. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      setError(null);
      console.log('Connecté au serveur de chat');
    });
    
    newSocket.on('user-list', (userIds) => {
      console.log('Liste des IDs utilisateurs reçue:', userIds);
      fetchUsers(userIds);
    });
    
    newSocket.on('private-message', (message) => {
      console.log('Nouveau message reçu:', message);
      setMessages(prev => [...prev, message]);
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Erreur de connexion:', err.message);
      setError('Erreur de connexion au serveur de chat. Veuillez rafraîchir la page.');
    });
    
    newSocket.on('error', (err) => {
      console.error('Erreur Socket.IO:', err);
      setError('Erreur de communication avec le serveur.');
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async (activeIds) => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      
      if (!res.data || !Array.isArray(res.data)) {
        throw new Error('Réponse invalide du serveur');
      }
      
      const filteredUsers = res.data
        .filter(u => u && u._id && u._id !== user?._id)
        .map(u => ({
          ...u,
          isOnline: activeIds.includes(u._id)
        }));
      
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs.');
      setLoading(false);
    }
  };

  const fetchMessages = async (receiverId) => {
    if (!user?._id || !receiverId) return;
    
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${user._id}/${receiverId}`);
      
      if (res.data && Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
      setError('Erreur lors du chargement des messages.');
    }
  };

  const handleSelectUser = (selected) => {
    if (!selected || !selected._id) return;
    
    setSelectedUser(selected);
    fetchMessages(selected._id);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socket) return;
    
    const messageData = {
      receiver: selectedUser._id,
      content: newMessage
    };
    
    try {
      socket.emit('private-message', messageData);
      
      // Ajouter localement pour un affichage immédiat
      setMessages(prev => [...prev, {
        _id: Date.now(), // ID temporaire
        sender: user._id,
        receiver: selectedUser._id,
        content: newMessage,
        createdAt: new Date(),
        isTemporary: true
      }]);
      
      setNewMessage('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="error-alert">
        <FaExclamationTriangle className="icon" />
        <div className="message">{error}</div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="avatar">
              <FaUserCircle />
            </div>
            <div>
              <div className="username">{user.name}</div>
              <div className="user-status">En ligne</div>
            </div>
          </div>
          <div className="sidebar-actions">
            <button className="icon-btn">
              <FaEllipsisV />
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-input">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher des contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="user-list">
          <div className="user-list-header">
            <FaUsers className="icon" />
            <h3>Contacts</h3>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Chargement des contacts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="users-container">
              {filteredUsers.map(u => (
                <div 
                  key={u._id} 
                  className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                  onClick={() => handleSelectUser(u)}
                >
                  <div className="user-avatar">
                    <div className={`status-indicator ${u.isOnline ? 'online' : 'offline'}`} />
                    <FaUserCircle />
                  </div>
                  
                  <div className="user-info">
                    <div className="user-name">{u.name}</div>
                    <div className={`user-status ${u.isOnline ? 'online' : 'offline'}`}>
                      {u.isOnline ? 'En ligne' : 'Hors ligne'}
                    </div>
                  </div>
                  
                  <div className={`role-badge ${
                    u.role === 'admin' ? 'admin' : 
                    u.role === 'enseignant' ? 'teacher' : 'user'
                  }`}>
                    {u.role.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-container">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-partner-info">
                <div className="avatar">
                  <div className={`status-indicator ${users.find(u => u._id === selectedUser._id)?.isOnline ? 'online' : 'offline'}`} />
                  <FaUserCircle />
                </div>
                <div>
                  <div className="username">{selectedUser.name}</div>
                  <div className={`user-status ${users.find(u => u._id === selectedUser._id)?.isOnline ? 'online' : 'offline'}`}>
                    {users.find(u => u._id === selectedUser._id)?.isOnline ? 'En ligne' : 'Hors ligne'}
                  </div>
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="icon-btn">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <FaComment className="icon" />
                  <h3>Pas de messages</h3>
                  <p>Envoyez votre premier message pour commencer la conversation</p>
                </div>
              ) : (
                <div className="messages">
                  {messages.map((msg, index) => (
                    <div 
                      key={msg._id || index} 
                      className={`message ${msg.sender === user?._id ? 'sent' : 'received'} ${msg.isTemporary ? 'temporary' : ''}`}
                    >
                      <div className="message-content">{msg.content}</div>
                      <div className="message-time">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Envoi en cours...'}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="message-input-container">
              {!users.find(u => u._id === selectedUser._id)?.isOnline && (
                <div className="offline-warning">
                  <FaExclamationTriangle className="icon" />
                  <span>L'utilisateur est hors ligne. Il recevra votre message à sa prochaine connexion.</span>
                </div>
              )}
              
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="select-user-prompt">
            <FaComment className="icon" />
            <h2>Bienvenue dans la messagerie</h2>
            <p>Sélectionnez un contact pour commencer à discuter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;