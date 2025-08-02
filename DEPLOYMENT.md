# 🚀 Flying Car Game - Vercel Deployment Guide

Complete guide to deploy both frontend and backend on Vercel separately.

## 📁 Project Structure

```
flying-car-game/
├── frontend/                 # React + Vite + Three.js
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend-node/            # Node.js + Express + WebSocket
│   ├── server.js
│   ├── package.json
│   ├── vercel.json
│   └── CONNECTION-MANAGEMENT.md
└── DEPLOYMENT.md
```

## 🌐 Backend Deployment (Node.js)

### 1. Prepare Backend for Vercel

The backend is already configured with:
- ✅ `vercel.json` configuration
- ✅ Express server setup
- ✅ CORS enabled
- ✅ Environment variable support
- ✅ **Advanced connection pool management**
- ✅ **Multi-level cleanup system**
- ✅ **DoS protection & monitoring**

### 2. Deploy Backend

```bash
# Navigate to backend directory
cd backend-node

# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy backend
vercel

# Follow prompts:
# ? Set up and deploy "backend-node"? [Y/n] y
# ? Which scope? your-username
# ? Link to existing project? [y/N] n
# ? What's your project's name? flying-car-backend
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

### 3. Get Backend URL

After deployment, you'll get a URL like:
```
https://flying-car-backend.vercel.app
```

**Important:** Save this URL - you'll need it for frontend configuration!

## 🎮 Frontend Deployment

### 1. Update Backend Configuration

Edit `src/config/backend.js` and replace the production URLs:

```javascript
// In src/config/backend.js
production: {
  httpUrl: 'https://your-actual-backend.vercel.app',
  wsUrl: 'wss://your-actual-backend.vercel.app/ws',
  healthUrl: 'https://your-actual-backend.vercel.app/health'
}
```

### 2. Deploy Frontend

```bash
# Navigate to frontend directory (project root)
cd ..

# Deploy frontend
vercel

# Follow prompts:
# ? Set up and deploy "flying-car-game"? [Y/n] y
# ? Which scope? your-username
# ? Link to existing project? [y/N] n
# ? What's your project's name? flying-car-frontend
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

## ✅ Post-Deployment Checklist

### Backend Verification

1. **Health Check:**
```bash
curl https://your-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123,
  "rooms": 0,
  "connections": {
    "active": 0,
    "max": 1000,
    "usage": 0
  },
  "memory": {
    "used": 25,
    "total": 128
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

2. **Connection Pool Status:**
```bash
curl https://your-backend.vercel.app/
```

Expected response includes:
```json
{
  "status": "Flying Car Game Server Running",
  "features": [
    "Room-based multiplayer",
    "Player state persistence (5min timeout)",
    "WebSocket real-time communication",
    "Collision detection support",
    "Advanced connection pool management",
    "Cross-platform deployment ready"
  ],
  "connectionStats": {
    "active": 0,
    "max": 1000,
    "usage": 0
  }
}
```

3. **WebSocket Test:**
```bash
# Use a WebSocket test tool or browser console
const ws = new WebSocket('wss://your-backend.vercel.app/ws?room=test');
ws.onopen = () => console.log('Connected!');
```

### Frontend Verification

1. **Open your frontend URL:** `https://your-frontend.vercel.app`
2. **Create a room** - Car should appear
3. **Check browser console** - Should show backend connection logs
4. **Test multiplayer** - Open multiple tabs with same room

### Connection Pool Testing

1. **Monitor connection pool:**
```bash
# Watch connection stats in real-time
watch -n 1 'curl -s https://your-backend.vercel.app/health | jq .connections'
```

2. **Load test (optional):**
```javascript
// Test multiple connections in browser console
for (let i = 0; i < 10; i++) {
  new WebSocket('wss://your-backend.vercel.app/ws?room=loadtest');
}
```

## 🔧 Environment Configuration

### Development vs Production

The app automatically detects the environment:

- **Development:** `localhost:5173` → Uses `ws://127.0.0.1:8082`
- **Production:** `your-domain.vercel.app` → Uses `wss://your-backend.vercel.app`

### Custom Domain (Optional)

If you want custom domains:

1. **Backend Domain:**
```bash
vercel domains add api.yourdomain.com --scope your-username
```

2. **Frontend Domain:**
```bash
vercel domains add yourdomain.com --scope your-username
```

3. **Update configuration:**
```javascript
// src/config/backend.js
production: {
  httpUrl: 'https://api.yourdomain.com',
  wsUrl: 'wss://api.yourdomain.com/ws',
  healthUrl: 'https://api.yourdomain.com/health'
}
```

## 🐛 Troubleshooting

### Common Issues

**1. WebSocket Connection Failed**
```
Error: WebSocket connection failed
```

**Solution:**
- Verify backend URL in `src/config/backend.js`
- Check backend deployment status
- Test backend health endpoint

**2. CORS Errors**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Backend already has CORS enabled for all origins
- If still seeing errors, check browser network tab for actual error

**3. Cars Not Appearing**
```
WebSocket connected but no car visible
```

**Solution:**
- Check browser console for JavaScript errors
- Verify room ID in URL matches backend logs
- Check backend logs for player creation

**4. Connection Pool Issues**
```
Server overloaded / Connection rejected
```

**Solution:**
- Check connection pool status: `curl /health`
- Current limit: 1000 concurrent connections
- Monitor usage percentage in health endpoint
- Contact support if consistently hitting limits

**5. Vercel Function Timeout**
```
Function execution timed out
```

**Solution:**
- Vercel free tier has 10s timeout for functions
- WebSocket connections should work within limits
- Consider upgrading to Pro for longer timeouts

### Debug Commands

**Check backend logs:**
```bash
vercel logs https://your-backend.vercel.app
```

**Check connection pool status:**
```bash
curl https://your-backend.vercel.app/health | jq '.connections'
```

**Check frontend deployment:**
```bash
vercel inspect https://your-frontend.vercel.app
```

**Test WebSocket locally:**
```bash
cd backend-node
npm start

# In another terminal
cd ..
npm run dev
```

## 📈 Performance Tips

### Backend Optimization

1. **Connection Pool Management:**
   - **1000 concurrent connections** supported
   - **Multi-level cleanup** prevents overload
   - **Real-time monitoring** with automatic alerts
   - **Emergency protection** at 90% capacity

2. **Cold Start Reduction:**
   - Vercel functions have cold starts
   - First connection may take 2-3 seconds
   - Subsequent connections are faster

3. **Memory Management:**
   - Cleanup routine runs every minute
   - Disconnected players removed after 5 minutes
   - Empty rooms removed after 2 minutes
   - **Aggressive cleanup** under stress (70%+ load)
   - **Emergency cleanup** at critical levels (90%+ load)

### Frontend Optimization

1. **Bundle Size:**
   - Three.js is large - ensure tree shaking works
   - Consider code splitting for different routes

2. **Connection Handling:**
   - Automatic reconnection on disconnect
   - Player state persistence across refreshes

## 🔒 Security Considerations

### Production Settings

1. **CORS Configuration:**
```javascript
// For production, consider restricting origins:
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}));
```

2. **Connection Limits & DoS Protection:**
```javascript
// Built-in protection (already configured):
const ConnectionMonitor = {
  maxConnections: 1000, // Configurable limit
  // Automatic rejection at 95% capacity
  // Stale connection cleanup (30s inactivity)
  // Emergency cleanup procedures
};
```

3. **Rate Limiting (Optional):**
```javascript
// Add rate limiting for extra protection:
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

4. **Environment Variables:**
```bash
# Set production environment variables
vercel env add NODE_ENV production
vercel env add MAX_CONNECTIONS 500  # Optional: lower limit for free tier
```

## 🚀 Deployment Commands Summary

```bash
# Backend deployment
cd backend-node
vercel --prod

# Frontend deployment  
cd ..
vercel --prod

# Check deployments
vercel ls

# Monitor health
curl https://your-backend.vercel.app/health
```

## 📊 Monitoring & Alerts

### Connection Pool Monitoring

```bash
# Real-time connection monitoring
curl https://your-backend.vercel.app/health | jq '.connections'

# Expected output:
# {
#   "active": 45,
#   "max": 1000, 
#   "usage": 4
# }
```

### Health Status Indicators

| Status | Connection Usage | Action |
|--------|-----------------|---------|
| 🟢 `healthy` | 0-89% | Normal operation |
| 🟡 `stressed` | 90-94% | Monitor closely |
| 🔴 `overloaded` | 95%+ | Rejecting connections |

### Log Monitoring

Watch for these log patterns:
```
📊 Connection Monitor: 45/1000 (4%)        # Normal
⚠️ Connection pool at 85% capacity          # Warning
🧹 Aggressive cleanup: 5 players removed    # Stress response
🚨 CRITICAL: Connection pool at 92%         # Emergency
```

## 📞 Support

### Logs and Monitoring

- **Backend logs:** `vercel logs <backend-url>`
- **Frontend logs:** Browser DevTools Console
- **Health monitoring:** `GET /health` endpoint
- **Connection stats:** `GET /` endpoint

### Connection Pool Issues

If you experience connection issues:

1. **Check current status:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

2. **Monitor connection pool:**
   ```bash
   watch curl -s https://your-backend.vercel.app/health
   ```

3. **Review cleanup logs:**
   ```bash
   vercel logs https://your-backend.vercel.app --limit 50
   ```

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [WebSocket on Vercel](https://vercel.com/guides/deploying-websockets)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Connection Management Guide](backend-node/CONNECTION-MANAGEMENT.md)

---

🎉 **Your Flying Car Game is now ready for the world with bulletproof connection management!** 

**Features:**
- 🚗 **Multiplayer flying car action**
- 🔒 **Connection pool protection** (1000 concurrent users)
- 🧹 **Automatic cleanup** & memory management
- 📊 **Real-time monitoring** & health checks
- 🛡️ **DoS protection** & emergency procedures
- ⚡ **Vercel optimized** for global deployment

Share your room links and enjoy seamless multiplayer gaming! 🌟 