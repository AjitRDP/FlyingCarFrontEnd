import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [playerColor, setPlayerColor] = useState('#ff4444');
  const [playerName, setPlayerName] = useState('');
  const [otherPlayers, setOtherPlayers] = useState({});
  const messageQueue = useRef([]);
  const connectionRef = useRef(null);
  const isConnectingRef = useRef(false);
  const cleanupExecutedRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  // Store callbacks in refs to avoid recreation
  const messageHandlers = useRef({});

  // Extract room ID from URL for logging and localStorage key
  const roomId = url.includes('room=') ? new URLSearchParams(url.split('?')[1]).get('room') : 'default';
  const playerStorageKey = `flyingCar_player_${roomId}`;

  // Get stored player ID for this room
  const getStoredPlayerId = () => {
    try {
      const stored = localStorage.getItem(playerStorageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored player data:', error);
      return null;
    }
  };

  // Store player data for this room
  const storePlayerData = (playerData) => {
    try {
      localStorage.setItem(playerStorageKey, JSON.stringify(playerData));
    } catch (error) {
      console.error('Error storing player data:', error);
    }
  };

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlers.current[type] = handler;
  }, []);

  const removeMessageHandler = useCallback((type) => {
    delete messageHandlers.current[type];
  }, []);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    } else {
      // Queue message if not connected
      messageQueue.current.push(message);
    }
  }, [socket]);

  const sendPositionUpdate = useCallback((position, rotation) => {
    sendMessage({
      type: 'updatePosition',
      data: {
        position,
        rotation
      }
    });
  }, [sendMessage]);

  useEffect(() => {
    connectionAttemptRef.current += 1;
    const currentAttempt = connectionAttemptRef.current;
    
    console.log(`🔄 WebSocket useEffect triggered for room: ${roomId} (attempt ${currentAttempt})`);
    
    // Prevent duplicate connections - only create one connection per URL
    if (isConnectingRef.current || connectionRef.current) {
      console.log('⚠️ Connection already exists or in progress, skipping...', {
        room: roomId,
        attempt: currentAttempt,
        isConnecting: isConnectingRef.current,
        hasConnection: !!connectionRef.current,
        cleanupExecuted: cleanupExecutedRef.current
      });
      return;
    }

    console.log(`🚀 Creating new WebSocket connection to room: ${roomId} (attempt ${currentAttempt})`);
    console.log(`📡 WebSocket URL: ${url}`);
    isConnectingRef.current = true;
    cleanupExecutedRef.current = false;
    
    const ws = new WebSocket(url);
    connectionRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ Connected to WebSocket server - Room: ${roomId} (attempt ${currentAttempt})`);
      setIsConnected(true);
      setSocket(ws);
      isConnectingRef.current = false;
      
      // Check for stored player data and send reconnection request
      const storedPlayerData = getStoredPlayerId();
      if (storedPlayerData && storedPlayerData.id) {
        console.log(`🔄 Attempting to reconnect as player: ${storedPlayerData.id}`);
        setIsReconnecting(true);
        
        // Send reconnect message with a delay to ensure backend is ready
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'reconnect',
              data: {
                previousPlayerId: storedPlayerData.id,
                previousName: storedPlayerData.name
              }
            }));
            
            // Set timeout to stop reconnection attempt if no response
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('⚠️ Reconnection timeout, continuing as new player');
              setIsReconnecting(false);
            }, 3000);
          }
        }, 100);
      }
      
      // Send queued messages
      messageQueue.current.forEach(message => {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('❌ Error sending queued message:', error);
        }
      });
      messageQueue.current = [];
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'init':
            console.log(`🎮 Received init message for room ${roomId}:`, message.data.yourId);
            setPlayerId(message.data.yourId);
            setPlayerColor(message.data.yourColor);
            setPlayerName(message.data.yourName);
            setIsReconnecting(false);
            
            // Clear reconnect timeout
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
            
            // Store player data for future reconnections
            storePlayerData({
              id: message.data.yourId,
              name: message.data.yourName,
              color: message.data.yourColor,
              room: roomId
            });
            
            // Initialize other players - safely handle null/undefined allPlayers
            const players = {};
            if (message.data.allPlayers && Array.isArray(message.data.allPlayers)) {
              message.data.allPlayers.forEach(player => {
                players[player.id] = player;
              });
            }
            setOtherPlayers(players);
            break;

          case 'reconnected':
            console.log(`🔄 Successfully reconnected to room ${roomId}:`, message.data.yourId);
            setPlayerId(message.data.yourId);
            setPlayerColor(message.data.yourColor);
            setPlayerName(message.data.yourName);
            setIsReconnecting(false);
            
            // Clear reconnect timeout
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
            
            // Update stored data with any changes
            storePlayerData({
              id: message.data.yourId,
              name: message.data.yourName,
              color: message.data.yourColor,
              room: roomId
            });
            
            // Initialize other players
            const reconnectPlayers = {};
            if (message.data.allPlayers && Array.isArray(message.data.allPlayers)) {
              message.data.allPlayers.forEach(player => {
                reconnectPlayers[player.id] = player;
              });
            }
            setOtherPlayers(reconnectPlayers);
            
            // Call custom handler if registered
            if (messageHandlers.current['reconnected']) {
              messageHandlers.current['reconnected'](message);
            }
            break;

          case 'newPlayer':
            console.log(`👋 New player joined room ${roomId}:`, message.data.id);
            setOtherPlayers(prev => ({
              ...prev,
              [message.data.id]: message.data
            }));
            break;

          case 'playerUpdate':
            setOtherPlayers(prev => ({
              ...prev,
              [message.playerId]: {
                ...prev[message.playerId],
                position: message.data.position,
                rotation: message.data.rotation
              }
            }));
            break;

          case 'playerDisconnected':
            console.log(`👋 Player left room ${roomId}:`, message.data.id);
            setOtherPlayers(prev => {
              const updated = { ...prev };
              delete updated[message.data.id];
              return updated;
            });
            break;

          default:
            // Handle custom message types
            if (messageHandlers.current[message.type]) {
              messageHandlers.current[message.type](message);
            } else {
              console.log('Unknown message type:', message.type, message);
            }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log(`🚪 WebSocket connection closed for room ${roomId}:`, event.code, event.reason);
      setIsConnected(false);
      setSocket(null);
      connectionRef.current = null;
      isConnectingRef.current = false;
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocket error for room ${roomId}:`, error);
      setIsConnected(false);
      setSocket(null);
      connectionRef.current = null;
      isConnectingRef.current = false;
    };

    // Cleanup function
    return () => {
      if (!cleanupExecutedRef.current) {
        console.log(`🧹 Cleaning up WebSocket connection for room: ${roomId} (attempt ${currentAttempt})`);
        cleanupExecutedRef.current = true;
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        if (connectionRef.current && connectionRef.current.readyState !== WebSocket.CLOSED) {
          connectionRef.current.close();
        }
        
        connectionRef.current = null;
        isConnectingRef.current = false;
        setIsConnected(false);
        setSocket(null);
      }
    };
  }, [url]);

  return {
    socket,
    isConnected,
    isReconnecting,
    playerId,
    playerColor,
    playerName,
    otherPlayers,
    sendMessage,
    sendPositionUpdate,
    addMessageHandler,
    removeMessageHandler
  };
};

export default useWebSocket; 