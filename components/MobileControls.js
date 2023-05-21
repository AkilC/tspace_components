// good but causing problems
import React, { useEffect, useState, useRef } from 'react';
import nipplejs from 'nipplejs';
import { useCallback } from 'react';
import { throttle } from 'lodash';

const MobileJoystick = ({ onJoystickMove }) => {
  const [joystickManager, setJoystickManager] = useState(null);
  const containerRef = useRef(); // Add this line to create a container ref

  useEffect(() => {
    if (containerRef.current) {
      const manager = nipplejs.create({
        zone: containerRef.current,
        mode: 'static',
        position: { left: '42px', top: '56px' },
        size: 100,
        color: 'white',
      });
      setJoystickManager(manager);
    }
  }, [containerRef]);

  useEffect(() => {
    if (joystickManager) {
      const onStart = (evt, data) => {
        console.log('Joystick start');
      };

      const onEnd = (evt, data) => {
        console.log('Joystick end');
        onJoystickMove(null); // Set joystickData to null when the joystick is released
      };

      const onMove = throttle((evt, data) => {
        onJoystickMove(data);
      }, 20);

      joystickManager.on('start', onStart);
      joystickManager.on('end', onEnd);
      joystickManager.on('move', onMove);

      return () => {
        joystickManager.off('start', onStart);
        joystickManager.off('end', onEnd);
        joystickManager.off('move', onMove);
      };
    }
  }, [joystickManager, onJoystickMove]);

  // Return the container div as the component output
  return <div ref={containerRef} className="joystick-container"></div>;
};

export default MobileJoystick;
