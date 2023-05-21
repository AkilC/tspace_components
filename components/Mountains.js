import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Mountains = () => {
  const terrainRef = React.useRef();

  const displacementMap = new THREE.TextureLoader().load(process.env.PUBLIC_URL + '/assets/heightmapDarkMiddle.png');

  return (
    <mesh
      ref={terrainRef}
      position={[0, -1, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeBufferGeometry attach="geometry" args={[800, 800, 256, 256]} />
      <meshStandardMaterial
        attach="material"
        displacementMap={displacementMap}
        displacementScale={50}
      />
    </mesh>
  );
};

export default Mountains;