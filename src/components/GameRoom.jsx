import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import FlyingCar from '../FlyingCar';

const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showRoomInfo, setShowRoomInfo] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [connectionStatus, setConnectionStatus] = useState({ isConnected: false, isReconnecting: false });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = async () => {
      if (!audioEnabled) {
        setAudioEnabled(true);
        console.log('🔊 Audio enabled');
      }
    };

    const handleFirstInteraction = () => {
      enableAudio();
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, [audioEnabled]);

  // Update audio enabled state from connection status
  useEffect(() => {
    if (connectionStatus.playerId) {
      setPlayerId(connectionStatus.playerId);
    }
  }, [connectionStatus]);

  const copyRoomLink = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(() => {
      alert('Room link copied to clipboard!');
    });
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Volume will be passed to FlyingCar component
  };

  const shareRoom = (platform) => {
    const roomLink = window.location.href;
    const text = `Join me in Flying Car Multiplayer! Room ID: ${roomId}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + roomLink)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(roomLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(roomLink)}`, '_blank');
        break;
      case 'discord':
        copyRoomLink();
        alert('Link copied! Paste it in your Discord chat.');
        break;
      default:
        copyRoomLink();
    }
  };

  const generateQRCode = () => {
    const roomLink = window.location.href;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(roomLink)}`;
  };

  const getConnectionStatus = () => {
    if (connectionStatus.isReconnecting) {
      return { text: 'Reconnecting...', color: '#ffa500', pulse: true };
    } else if (connectionStatus.isConnected) {
      return { text: `Room: ${roomId}`, color: '#4ade80', pulse: true };
    } else {
      return { text: 'Connecting...', color: '#ff6b6b', pulse: true };
    }
  };

  const status = getConnectionStatus();

  const uiOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    pointerEvents: 'none'
  };

  const roomInfoStyle = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '15px',
    borderRadius: '15px',
    pointerEvents: 'auto',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const controlsInfoStyle = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '15px',
    borderRadius: '15px',
    pointerEvents: 'auto',
    backdropFilter: 'blur(10px)',
    maxWidth: '250px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const connectionStatusStyle = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'auto',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '140px'
  };

  const buttonStyle = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    margin: '2px'
  };

  const primaryBtnStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
    color: 'white'
  };

  const secondaryBtnStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white'
  };

  const leaveBtnStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
    color: 'white'
  };

  const volumeBtnStyle = {
    ...buttonStyle,
    background: 'linear-gradient(45deg, #ffa726, #ff9800)',
    color: 'white',
    fontSize: '16px',
    padding: '6px 10px'
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  };

  const modalContentStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '90%',
    color: 'white',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  };

  const shareButtonStyle = {
    ...buttonStyle,
    margin: '5px',
    minWidth: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const statusIndicatorStyle = {
    width: '10px',
    height: '10px',
    background: status.color,
    borderRadius: '50%',
    animation: status.pulse ? 'pulse 2s infinite' : 'none'
  };

  const volumeControlStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    marginTop: '5px'
  };

  const sliderStyle = {
    width: '80px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.3)',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div className="game-container">
      {/* Audio Status Indicator */}
      {!audioEnabled && playerId && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <h3>🔊 Enable Sound</h3>
          <p>Press any key or click to enable car sounds!</p>
          <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
            • Engine sounds when moving<br/>
            • Thruster effects when flying<br/>
            • Connection sounds for multiplayer
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div style={uiOverlayStyle}>
        <div style={roomInfoStyle}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>🚗 Flying Car Multiplayer</h3>
          <div>
            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Room ID:</strong> {roomId}</p>
            {connectionStatus.isReconnecting && (
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#ffa500' }}>
                🔄 Restoring your previous session...
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
              <button 
                onClick={() => setShowInviteModal(true)} 
                style={primaryBtnStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                👥 Invite Friends
              </button>
              <button 
                onClick={copyRoomLink} 
                style={secondaryBtnStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📋 Copy Link
              </button>
              <button 
                onClick={leaveRoom} 
                style={leaveBtnStyle}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚪 Leave Room
              </button>
            </div>
          </div>
        </div>
        
        <div style={controlsInfoStyle}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffd700' }}>Controls</h4>
          <div>
            <p style={{ margin: '3px 0', fontSize: '11px' }}><strong>Move:</strong> Arrow Keys or WASD</p>
            <p style={{ margin: '3px 0', fontSize: '11px' }}><strong>Fly Up:</strong> Space</p>
            <p style={{ margin: '3px 0', fontSize: '11px' }}><strong>Fly Down:</strong> Shift</p>
            <p style={{ margin: '3px 0', fontSize: '11px' }}><strong>Turn:</strong> Left/Right Arrows</p>
          </div>
        </div>
        
        <div style={connectionStatusStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={statusIndicatorStyle}></div>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{status.text}</span>
          </div>
          
          {/* Volume Control */}
          <div style={volumeControlStyle}>
            <button 
              onClick={() => setShowVolumeControl(!showVolumeControl)}
              style={volumeBtnStyle}
              title="Sound Volume"
            >
              🔊
            </button>
            {showVolumeControl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={sliderStyle}
                />
                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={modalStyle} onClick={() => setShowInviteModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowInviteModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
            
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>🎮 Invite Friends to Play!</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ margin: '10px 0' }}>Room ID: <strong>{roomId}</strong></p>
              <img 
                src={generateQRCode()} 
                alt="QR Code" 
                style={{ 
                  border: '3px solid white', 
                  borderRadius: '10px',
                  background: 'white',
                  padding: '10px'
                }}
              />
              <p style={{ fontSize: '12px', margin: '10px 0', opacity: 0.8 }}>
                Scan QR code or share the link below
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => shareRoom('whatsapp')} 
                style={{...shareButtonStyle, background: '#25D366'}}
              >
                📱 WhatsApp
              </button>
              <button 
                onClick={() => shareRoom('telegram')} 
                style={{...shareButtonStyle, background: '#0088cc'}}
              >
                ✈️ Telegram
              </button>
              <button 
                onClick={() => shareRoom('discord')} 
                style={{...shareButtonStyle, background: '#5865F2'}}
              >
                🎮 Discord
              </button>
              <button 
                onClick={() => shareRoom('twitter')} 
                style={{...shareButtonStyle, background: '#1DA1F2'}}
              >
                🐦 Twitter
              </button>
            </div>

            <div style={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              padding: '10px', 
              borderRadius: '10px',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              <strong>Room Link:</strong><br/>
              {window.location.href}
            </div>
          </div>
        </div>
      )}

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 8, 15], fov: 75 }}
        shadows
        className="game-canvas"
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1} 
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
      
        {/* Environment */}
        <Environment preset="sunset" />
        <Stars radius={300} depth={60} count={1000} factor={7} />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#2a5d31" />
        </mesh>
        
        {/* Flying Car Game with Room ID and Volume */}
        <FlyingCar 
          roomId={roomId} 
          volume={volume}
          audioEnabled={audioEnabled}
          onConnectionStatusChange={setConnectionStatus}
        />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#87CEEB', 50, 300]} />
      </Canvas>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          height: 4px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffa726;
          cursor: pointer;
          border: 2px solid white;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffa726;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default GameRoom; 