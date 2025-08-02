# 🚗✈️ Multiplayer Flying Car Game

A real-time multiplayer flying car game built with React, Three.js, and Go WebSocket backend.

## 🎮 Features

- **Multiplayer Support**: Multiple players can join and fly cars together in real-time
- **3D Graphics**: Beautiful 3D environment with Three.js and React Three Fiber
- **Real-time Communication**: WebSocket-based networking for instant position updates
- **Smooth Interpolation**: Other players' movements are smoothly interpolated for fluid experience
- **Player Differentiation**: Each player has a unique color and name tag
- **Dynamic Camera**: Camera follows the local player's car
- **Physics-based Movement**: Realistic flying controls with velocity and drag

## 🛠️ Technologies Used

### Frontend
- **React** - UI framework
- **@react-three/fiber** - React Three.js renderer
- **@react-three/drei** - Useful helpers and abstractions
- **Three.js** - 3D graphics library
- **WebSocket API** - Real-time communication
- **Vite** - Build tool and dev server

### Backend
- **Go** - Server language
- **Gorilla WebSocket** - WebSocket implementation
- **net/http** - HTTP server

## 📁 Project Structure

```
flying-car-game/
├── backend/                 # Go WebSocket server
│   ├── main.go             # Main server file
│   ├── go.mod              # Go module definition
│   ├── run.bat             # Windows run script
│   └── run.sh              # Unix run script
├── src/                     # React frontend
│   ├── components/         # React components
│   │   ├── CarModel.jsx    # 3D car model component
│   │   ├── PlayerNameTag.jsx # Player name display
│   │   └── CameraController.jsx # Camera follow logic
│   ├── hooks/              # Custom React hooks
│   │   └── useWebSocket.js # WebSocket connection hook
│   ├── App.jsx             # Main app component
│   ├── FlyingCar.jsx       # Game logic component
│   ├── App.css             # Game styling
│   └── main.jsx            # React entry point
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Go** (v1.21 or higher)
- **Git**

### Installation & Running

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flying-car-game
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Start the Backend Server

**On Windows:**
```bash
cd backend
.\run.bat
```

**On macOS/Linux:**
```bash
cd backend
chmod +x run.sh
./run.sh
```

**Manual Start:**
```bash
cd backend
go mod tidy
go run main.go
```

The backend server will start on `ws://localhost:8080/ws`

#### 4. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 5. Play the Game!

- Open multiple browser tabs/windows to `http://localhost:5173` to simulate multiple players
- Each tab represents a different player
- Use the controls to fly around and see other players in real-time!

## 🎮 Game Controls

| Control | Action |
|---------|--------|
| **Arrow Keys** or **WASD** | Move forward/backward/left/right |
| **Space** | Fly up |
| **Shift** | Fly down |
| **Left/Right Arrows** | Turn the car |

## 🌐 Multiplayer Features

### Real-time Updates
- Position and rotation updates are sent every 33ms (30 FPS)
- Smooth interpolation for remote players
- Automatic player disconnect handling

### Player Management
- Unique player IDs and colors
- Player name tags floating above cars
- Dynamic player list management

### Network Protocol

The game uses JSON messages over WebSocket:

```json
// Position Update (Client → Server)
{
  "type": "updatePosition",
  "data": {
    "position": {"x": 0, "y": 1, "z": 0},
    "rotation": {"x": 0, "y": 0, "z": 0}
  }
}

// Player Update (Server → Clients)
{
  "type": "playerUpdate",
  "playerId": "player-abc123",
  "data": {
    "position": {"x": 0, "y": 1, "z": 0},
    "rotation": {"x": 0, "y": 0, "z": 0}
  }
}
```

## 🎨 Customization

### Adding New Car Models

Replace the `CarModel.jsx` component with a GLTF loader:

```jsx
import { useGLTF } from '@react-three/drei';

const CarModel = ({ position, rotation, color }) => {
  const { scene } = useGLTF('/path/to/your/car.glb');
  
  return (
    <primitive 
      object={scene.clone()} 
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    />
  );
};
```

### Modifying Physics

Edit the physics constants in `FlyingCar.jsx`:

```jsx
const speed = 8;        // Movement speed
const flySpeed = 5;     // Vertical movement speed
const rotationSpeed = 2; // Turning speed
const drag = 0.95;      // Velocity damping
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to WebSocket server"
- **Solution**: Make sure the backend is running on port 8080
- Check if Go is installed: `go version`
- Check if the backend started without errors

**Problem**: "Module not found: gorilla/websocket"
- **Solution**: Run `go mod tidy` in the backend directory

### Frontend Issues

**Problem**: "Cannot resolve './components/...'"
- **Solution**: Make sure all component files are created in the correct directories

**Problem**: "WebSocket connection failed"
- **Solution**: Ensure the backend server is running before starting the frontend

### Performance Issues

- **High CPU usage**: Reduce the update frequency in `FlyingCar.jsx`
- **Lag**: Check network connection and server performance
- **Frame drops**: Lower the shadow quality in `App.jsx`

## 🚀 Production Deployment

### Backend Deployment

```bash
# Build for production
cd backend
go build -o flying-car-server main.go

# Run the binary
./flying-car-server
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve the dist folder with any static file server
```

### Environment Variables

For production, set these environment variables:

```bash
# Backend
export PORT=8080
export CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (in .env file)
VITE_WEBSOCKET_URL=wss://your-backend-domain.com/ws
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- [ ] Add collision detection
- [ ] Implement power-ups and items
- [ ] Add different car models and customization
- [ ] Include sound effects and music
- [ ] Add racing tracks and objectives
- [ ] Implement player authentication
- [ ] Add spectator mode
- [ ] Include replay system
