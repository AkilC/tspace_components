import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

const Loading = ({ onLoadComplete }) => {
  const { progress } = useProgress();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setLoadingComplete(true);
      }, 2000); // Introduce a 2-second delay

      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    if (loadingComplete) {
      const fadeOutTimer = setTimeout(() => {
        setOpacity(0);
      }, 100);

      const onCompleteTimer = setTimeout(() => {
        onLoadComplete();
      }, 1000); // Adjust the duration of the fade-out effect

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(onCompleteTimer);
      };
    }
  }, [loadingComplete, onLoadComplete]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        position: 'absolute',
        backgroundColor: '#161314',
        color: 'white',
        opacity: opacity, // Set the opacity
        transition: 'opacity 0.9s ease', // Add a transition for the opacity
        zIndex: '100'
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/assets/TSpace.gif`}
        alt="Loading GIF"
        width="350" // Set the width of the image
        height="350" // Set the height of the image
      />
      <div
        style={{
          width: '20vw',
          height: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '5px',
          marginTop: '-32px',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'white',
            borderRadius: 'inherit',
          }}
        ></div>
      </div>
      <p>{Math.round(progress)} %</p>
    </div>
  );
};

export default Loading;
