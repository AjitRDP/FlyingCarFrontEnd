// Backend configuration for Flying Car Game

const BackendConfig = {
  // Development (local Node.js server)
  development: {
    httpUrl: 'https://flyingcarbackend.onrender.com',
    wsUrl: 'wss://flyingcarbackend.onrender.com/ws',
    healthUrl: 'https://flyingcarbackend.onrender.com/health'
  },
  
  // Production (Vercel deployment)
  production: {
     httpUrl: 'https://flyingcarbackend.onrender.com',
    wsUrl: 'wss://flyingcarbackend.onrender.com/ws',
    healthUrl: 'https://flyingcarbackend.onrender.com/health'
  }
};


// Export current configuration
const currentConfig = BackendConfig.development;

export const BACKEND_CONFIG = {
  ...currentConfig,
  
  // Helper function to get WebSocket URL with room
  getWebSocketUrl: (roomId) => {
    return `${currentConfig.wsUrl}?room=${roomId}`;
  },

};


export default BACKEND_CONFIG; 