// ✅
import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import OtherPlayer from './OtherPlayer';
import Character from './Character';
import { Box } from '@react-three/drei';
import * as cannon from 'cannon-es';

const Multiplayer = () => {
  const { room } = useSocket();
  const [players, setPlayers] = useState({});

  useEffect(() => {
    if (!room) return;

    room.onMessage('playerJoin', (playerData) => {
        console.log('Player join:', playerData);
        setPlayers((players) => ({ ...players, [playerData.id]: playerData }));
      });

    room.onMessage('playerUpdate', (playerData) => {
      /* console.log('Player update:', playerData); */
      /* if (Object.keys(players).length === 2) {console.log('Player update:', playerData);} // When the third player joins */
      setPlayers((players) => ({ ...players, [playerData.id]: playerData }));
    });

    room.onMessage('playerLeave', (playerId) => {
      setPlayers((players) => {
        console.log('Player leave:', playerId);
        const newPlayers = { ...players };
        delete newPlayers[playerId];
        return newPlayers;
      });
    });

  }, [room]);

  return (
    <>
        {Object.entries(players)
        .filter(([, playerData]) => playerData.position !== undefined && playerData.rotation !== undefined)
        .map(([id, playerData]) => {
            /* console.log(`Rendering player ${id} at position:`, playerData.position); */
            const receivedRotationAngle = playerData.rotation;
            const remoteCharacterQuaternion = new cannon.Quaternion();
            remoteCharacterQuaternion.setFromAxisAngle(new cannon.Vec3(0, 1, 0), receivedRotationAngle);

            const interpolatedPosition = [
                playerData.position.x * 0.98,
                playerData.position.y * 0.98,
                playerData.position.z * 0.98,
            ];
            /* console.log("Current players:", players); */
            return (
                <OtherPlayer
                  key={id}
                  position={interpolatedPosition}
                  quaternion={remoteCharacterQuaternion}
                  animation={playerData.animation}
                />
              );
        })}
    </>
  );
};

export default Multiplayer;
