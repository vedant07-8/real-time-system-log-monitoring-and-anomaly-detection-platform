import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const connectingRef = useRef(false);
  const shouldReconnectRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectTimeout = 30000; // max 30 seconds
  const reconnectTimerRef = useRef(null);
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN || connectingRef.current) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing');
      return;
    }

    connectingRef.current = true;
    setConnecting(true);
    
    // Determine WS URL based on current window location or env var
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      wsUrl = import.meta.env.MODE === 'development' 
        ? `ws://localhost:8000/ws/logs` 
        : `${protocol}//${window.location.host}/ws/logs`;
    }
    
    // Append token
    const url = new URL(wsUrl);
    url.searchParams.append('token', token);
    wsUrl = url.toString();


    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setConnecting(false);
        connectingRef.current = false;
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.reason);
        setConnected(false);
        setConnecting(false);
        connectingRef.current = false;
        ws.current = null;

        if (shouldReconnectRef.current) {
          let delay = Math.pow(2, reconnectAttempts.current) * 1000;
          if (delay > maxReconnectTimeout) delay = maxReconnectTimeout;

          console.log(`Attempting to reconnect in ${delay}ms...`);
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
      };

    } catch (err) {
      console.error('Failed to initialize WebSocket:', err);
      setConnecting(false);
      setError('Failed to initialize connection');
    }
  }, []);

  useEffect(() => {
    if (user) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
      if (ws.current) ws.current.close();
      ws.current = null;
      connectingRef.current = false;
      setConnected(false);
      setConnecting(false);
    }

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
      if (ws.current) ws.current.close();
      ws.current = null;
      connectingRef.current = false;
    };
  }, [connect, user]);

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectAttempts.current = 0;
    shouldReconnectRef.current = Boolean(user);
    if (ws.current) ws.current.close();
    ws.current = null;
    connect();
  }, [connect, user]);

  const disconnected = !connected && !connecting;

  return (
    <WebSocketContext.Provider value={{ connected, connecting, disconnected, lastMessage, error, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
