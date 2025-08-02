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
    httpUrl: 'https://your-backend.vercel.app',
    wsUrl: 'wss://your-backend.vercel.app/ws',
    healthUrl: 'https://your-backend.vercel.app/health'
  }
};

// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('127.0.0.1') ||
                     window.location.port === '5173' ||
                     window.location.port === '5174' ||
                     window.location.port === '3000';

// Export current configuration
const currentConfig = isDevelopment ? BackendConfig.development : BackendConfig.production;

export const BACKEND_CONFIG = {
  ...currentConfig,
  
  // Helper function to get WebSocket URL with room
  getWebSocketUrl: (roomId) => {
    return `${currentConfig.wsUrl}?room=${roomId}`;
  },
  
  // Environment info
  environment: isDevelopment ? 'development' : 'production',
  isDevelopment,
  isProduction: !isDevelopment
};

// Log current configuration (for debugging)
console.log('🔧 Backend Configuration:', {
  environment: BACKEND_CONFIG.environment,
  httpUrl: BACKEND_CONFIG.httpUrl,
  wsUrl: BACKEND_CONFIG.wsUrl
});

export default BACKEND_CONFIG; 