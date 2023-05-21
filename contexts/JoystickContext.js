import { createContext } from 'react';

export const JoystickContext = createContext({
  joystickData: null,
  onJoystickMove: () => {},
});
