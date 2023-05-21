// Joystick
import { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from './useKeyboardControls';
import * as THREE from 'three';
import * as cannon from 'cannon-es';
import MobileJoystick from './MobileControls';
/* import { vec3 } from 'gl-matrix'; */

export const useCharacterControls = (characterRef, onUpdate, joystickData) => {
  const [cameraAngle, setCameraAngle] = useState(0);
  const [animation, setAnimation] = useState('idle');
  const { up, down, left, right } = useKeyboardControls();
  const [characterPosition, setCharacterPosition] = useState(new THREE.Vector3());
  const [characterRotationAngle, setCharacterRotationAngle] = useState(0); // Add this line back
  /* const cameraAngleOffset = Math.PI; */
  const [lastDesiredRotationAngle, setLastDesiredRotationAngle] = useState(0);


  useEffect(() => {
    if (!characterRef.current) return;

    const characterBody = new cannon.Body({
      mass: 1,
      position: new cannon.Vec3().copy(characterRef.current.position),
      shape: new cannon.Box(new cannon.Vec3(0.5, 1, 0.5)),
      material: new cannon.Material({ friction: 0.5, restitution: 0 }),
    });
    characterRef.current.body = characterBody;
  }, [characterRef]);

  useFrame(() => {
    if (!characterRef.current) return;
  
    const movementSpeed = 0.05;
    const rotationSpeed = 0.015;
    const character = characterRef.current;
  
    if (up || down || joystickData) {
      if (animation !== 'walk') setAnimation('walk');
    } else {
      if (animation !== 'idle') setAnimation('idle');
    }
  
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(character.body.quaternion);

    // Add joystick movement handling
    if (joystickData) {
      const joystickAngle = joystickData.angle;
      setLastDesiredRotationAngle(joystickAngle - Math.PI / 2 + cameraAngle); // Add this line
      const moveDirection = new THREE.Vector3(
        -Math.cos(joystickAngle + cameraAngle),
        0,
        Math.sin(joystickAngle + cameraAngle)
      );
      const moveDirectionCannon = new cannon.Vec3().copy(moveDirection).scale(joystickData.force * movementSpeed);
      character.body.position.vadd(moveDirectionCannon, character.body.position);

      // Set character rotation
      setCharacterRotationAngle(joystickAngle);
    }
  
    if (up) {
      character.body.position.x -= forward.x * movementSpeed;
      character.body.position.z -= forward.z * movementSpeed;
    }
  
    if (down) {
      character.body.position.x -= forward.x * movementSpeed;
      character.body.position.z -= forward.z * movementSpeed;
    }
  
    if (left) {
      setCameraAngle((prevAngle) => prevAngle + rotationSpeed);
    }
  
    if (right) {
      setCameraAngle((prevAngle) => prevAngle - rotationSpeed);
    }
  
    const desiredRotationAngle = up
      ? cameraAngle
      : down
      ? cameraAngle + Math.PI
      : joystickData
      ? cameraAngle + joystickData.angle - Math.PI / 2
      : lastDesiredRotationAngle;
  
    if (up || down) {
      setLastDesiredRotationAngle(desiredRotationAngle);
    }
  
    character.body.quaternion.setFromAxisAngle(new cannon.Vec3(0, 1, 0), desiredRotationAngle);
  
    onUpdate && onUpdate({
      position: character.position,
      rotation: desiredRotationAngle,
      animation,
    });
  
    setCharacterPosition(character.position.clone());
  });
  

  return { cameraAngle, setCameraAngle, animation, characterPosition };
};
