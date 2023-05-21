import { createContext, useContext, useState, useEffect } from 'react';
import { Client } from 'colyseus.js';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const endpoint = process.env.REACT_APP_COLYSEUS_SERVER_URL || 'ws://localhost:3001';
    const newClient = new Client(endpoint);
    setClient(newClient);
  }, []);

  useEffect(() => {
    const joinOrCreateRoom = async () => {
      if (!client) return;
  
      const domain = window.location.hostname;
  
      try {
        const room = await client.joinOrCreate('my_room', { domain });
        setRoom(room);
      } catch (error) {
        console.error(error);
      }
    };
  
    joinOrCreateRoom();
  }, [client]);

  return <SocketContext.Provider value={{ client, room }}>{children}</SocketContext.Provider>;
};
