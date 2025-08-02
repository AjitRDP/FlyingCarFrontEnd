import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const generateRoomId = () => {
    // Generate a unique room ID using crypto.randomUUID if available, or fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().slice(0, 8);
    } else {
      // Fallback for older browsers
      return Math.random().toString(36).substring(2, 10);
    }
  };

  const createRoom = () => {
    const roomId = generateRoomId();
    navigate(`/room/${roomId}`);
  };

  const joinRoom = () => {
    const roomId = prompt('Enter Room ID:');
    if (roomId && roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  const landingPageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  };

  const landingContentStyle = {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '3rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    maxWidth: '500px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    background: 'linear-gradient(45deg, #ffd700, #ff6b6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const controlsPreviewStyle = {
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '1rem',
    borderRadius: '10px',
    marginTop: '1rem'
  };

  const roomActionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const buttonBaseStyle = {
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'white'
  };

  const createBtnStyle = {
    ...buttonBaseStyle,
    background: 'linear-gradient(45deg, #ff6b6b, #ffd700)'
  };

  const joinBtnStyle = {
    ...buttonBaseStyle,
    background: 'linear-gradient(45deg, #4ecdc4, #667eea)'
  };

  return (
    <div style={landingPageStyle}>
      <div style={landingContentStyle}>
        <h1 style={titleStyle}>🚗 Flying Car Multiplayer</h1>
        <div style={{ marginBottom: '2rem' }}>
          <p>Experience the thrill of flying cars in a multiplayer environment!</p>
          <div style={controlsPreviewStyle}>
            <h3 style={{ marginBottom: '0.5rem', color: '#ffd700' }}>Controls:</h3>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Movement:</strong> Arrow Keys or WASD</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Fly Up:</strong> Space</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Fly Down:</strong> Shift</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}><strong>Turn:</strong> Left/Right Arrows</p>
          </div>
        </div>
        
        <div style={roomActionsStyle}>
          <button 
            style={createBtnStyle}
            onClick={createRoom}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Create New Room
          </button>
          <button 
            style={joinBtnStyle}
            onClick={joinRoom}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔗 Join Existing Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 