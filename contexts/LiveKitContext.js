// LiveKitContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import {
  Room, createLocalAudioTrack, VideoPresets, RoomEvent
} from 'livekit-client';

const LiveKitContext = createContext();

export const useLiveKit = () => {
  return useContext(LiveKitContext);
};

export const LiveKitProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectToLiveKit = async () => {

      const participantName = generateUniqueParticipantName();
      const token = await fetchLiveKitToken(participantName);
      const liveKitURL = 'wss://tworlds-wriqgndu.livekit.cloud'; // Replace with your LiveKit server URL
  
      try {
        const roomInstance = new Room({
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });
        await roomInstance.connect(liveKitURL, token);

        roomInstance
          .on(RoomEvent.ParticipantConnected, (participant) => {
            console.log(`Participant connected: ${participant.identity}`);
          })
          .on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log(`Participant disconnected: ${participant.identity}`);
          })
          .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === 'audio') {
              handleAudioTrack(track, participant);
            }
          })
          .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
            console.log('Active speakers:', speakers.map(s => s.identity));
          });

        // Publish the local participant's audio track
        const localAudioTrack = await createLocalAudioTrack();
        await roomInstance.localParticipant.publishTrack(localAudioTrack);
        setRoom(roomInstance);
  
      } catch (error) {
        console.error('Error connecting to LiveKit:', error);
      }
    };
  
    connectToLiveKit();
  }, []);
  
  function generateUniqueParticipantName() {
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 1000);
    return `participant-${timestamp}-${randomNumber}`;
  }

  function handleAudioTrack(track, participant) {
    const audioElement = document.createElement('audio');
    audioElement.srcObject = track.mediaStream;
    audioElement.autoplay = true;
    audioElement.play();
  
    console.log(`Audio track received and playing for participant: ${participant.identity}`);
  }
  
  async function fetchLiveKitToken(participantName) {
    try {
      const response = await fetch(`http://localhost:3002/livekit-token?participantName=${participantName}`);
      if (!response.ok) {
        throw new Error(`Error fetching LiveKit token: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log(data);
      return data.token;
    } catch (error) {
      console.error(`Error in fetchLiveKitToken: ${error.message}`);
      throw error;
    }
  }

  return (
    <LiveKitContext.Provider value={{ room, error }}>{children}</LiveKitContext.Provider>
  );
};
