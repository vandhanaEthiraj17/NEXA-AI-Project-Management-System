import React, { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from './AppContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const { user } = useContext(AppContext);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to NEXA AI WebSockets');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from NEXA AI WebSockets');
      setIsConnected(false);
    });

    socketInstance.on('live_notification', (data) => {
      console.log('🔔 Live AI Notification Received:', data);
      setLiveAlerts(prev => [
        { id: Date.now(), ...data, read: false },
        ...prev.slice(0, 19) // Limit to 20 notifications
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const clearAlert = (id) => {
    setLiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setLiveAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, liveAlerts, clearAlert, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
};
