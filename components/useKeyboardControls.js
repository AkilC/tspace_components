import { useState, useEffect } from 'react';
import { useKeyPress } from './useKeyPress';

export const useKeyboardControls = () => {
  const up = useKeyPress('ArrowUp');
  const down = useKeyPress('ArrowDown');
  const left = useKeyPress('ArrowLeft');
  const right = useKeyPress('ArrowRight');

  return {
    up,
    down,
    left,
    right,
  };
};
