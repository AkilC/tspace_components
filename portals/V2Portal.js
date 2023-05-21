//Before
import React, { useEffect, useContext, useRef } from 'react';
import { useThree, useFrame, useLoader } from '@react-three/fiber';
import { Vec3, Box } from 'cannon-es';
import * as cannon from 'cannon-es';
import { WorldContext } from '../contexts/WorldContext';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FillQuad } from '../components/FillQuad';
import * as THREE from 'three';
import {
  Scene,
  WebGLRenderTarget,
  TextureLoader,
  EquirectangularReflectionMapping,
  AlwaysStencilFunc,
  ReplaceStencilOp,
  DoubleSide,
  LinearEncoding,
} from 'three';

const createRippleMaterial = () => {
  const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    
    uniform float time;
    uniform float opacity;
    uniform sampler2D imageTexture;
    
    // Simplex noise function
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    float combinedNoise(vec2 uv) {
      float noise1 = snoise((uv + vec2(1.0, 1.0)) * vec2(15.0, 15.0) + vec2(time * 0.03, time * 0.05));
      float noise2 = snoise((uv + vec2(-1.0, 1.0)) * vec2(25.0, 25.0) + vec2(time * -0.02, time * 0.08));
      float noise3 = snoise((uv + vec2(1.0, -1.0)) * vec2(35.0, 35.0) + vec2(time * 0.01, time * -0.03));
      float combined = (noise1 + noise2 + noise3) / 5.0;
      return combined;
    }
    
    void main() {
      float noiseValue = combinedNoise(vUv * vec2(1.0, 0.5) + vec2(time * 0.02, time * 0.03));
      float wave = sin(vUv.x * 25.0 + time * 5.0) * 0.05;
      float intensity = smoothstep(0.1 + wave, 0.4 + wave, noiseValue);
      
      // Add white glow
      float distanceFromCenter = length(vUv - vec2(0.5, 0.5));
      float glowIntensity = 0.5 + 0.5 * sin(time * 2.0) * smoothstep(0.4, 0.6, distanceFromCenter);
      
      // Load and sample the image texture
      vec2 scaledUv = vUv * 3.5;
      vec2 centeredUv = (scaledUv - vec2(1.75)) * vec2(1.0, 1.0) + vec2(0.5);
      vec4 imageColor = texture2D(imageTexture, centeredUv);
      
      // Blend the image with the noise and glow effects
      gl_FragColor = vec4(vec3(0.4, 0.3, 1.0) * intensity + vec3(1.0) * glowIntensity, opacity) * (1.0 - imageColor.a) + imageColor * imageColor.a;
    }
  `;
  const textureLoader = new THREE.TextureLoader();
  const imageTexture = textureLoader.load(process.env.PUBLIC_URL + '/assets/V2Logo-02.png');

  const uniforms = {
    time: { type: "f", value: 0 },
    opacity: { value: 0.2 },
    imageTexture: { type: "t", value: imageTexture }
  };

  const materialProperties = {
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    opacity: 0.1,
    side: DoubleSide,
  };

  return new THREE.ShaderMaterial(materialProperties);
};

const usePortalModel = (position, rotation, size, scene, rippleMaterial) => {
  const portalModel = useLoader(GLTFLoader, process.env.PUBLIC_URL + '/assets/Portal.gltf');
  const portalMaskModel = useLoader(GLTFLoader, process.env.PUBLIC_URL + '/assets/PortalMask.gltf');

  useEffect(() => {
    if (!portalModel || !portalMaskModel) return;
  
    // Clone the models before adding them to the scene
    const clonedPortalModel = portalModel.scene.clone();
    const clonedPortalMaskModel = portalMaskModel.scene.clone();
  
    const portalMesh = clonedPortalModel.children[0];
    clonedPortalModel.traverse((child) => {
      if (child.material) {
        child.material.envMapIntensity = 3.5;
        portalMesh.scale.set(...size);
        portalMesh.position.set(...position);
        portalMesh.rotation.set(...rotation);
      }
    });
  
    const maskMesh = clonedPortalMaskModel.children[0];

    if (maskMesh && maskMesh.material) {
      maskMesh.material.transparent = false;
      maskMesh.material.side = DoubleSide;
      maskMesh.material.stencilFunc = AlwaysStencilFunc;
      maskMesh.material.color.set("black");
      maskMesh.material.stencilWrite = true;
      maskMesh.material.stencilRef = 1;
      maskMesh.material.stencilZPass = ReplaceStencilOp;
      maskMesh.scale.set(...size);
      maskMesh.position.set(...position);
      maskMesh.rotation.set(...rotation);
    }

    rippleMaterial.current = createRippleMaterial();
    const circleRadius = 0.57;
    const rippleMesh = new THREE.Mesh(new THREE.CircleGeometry(circleRadius, 32), rippleMaterial.current);
    rippleMesh.position.set(...position);

    // Calculate the offsets based on the size of the mask
    const yOffset = 0.65 * size[1];
    const zOffset = 0.03 * size[2];

    rippleMesh.position.y += yOffset;
    rippleMesh.position.z += zOffset;
    rippleMesh.scale.set(...size);
    rippleMesh.rotation.set(...rotation);
    rippleMesh.frustumCulled = false;

    // Create a duplicate and flip it
    const flippedRippleMesh = rippleMesh.clone();
    flippedRippleMesh.rotation.set(0, Math.PI, Math.PI*2);
    flippedRippleMesh.position.z -= .28;
    flippedRippleMesh.frustumCulled = false;
    
    scene.add(rippleMesh);
    scene.add(flippedRippleMesh);
    scene.add(clonedPortalModel);
    scene.add(clonedPortalMaskModel);
  
    return () => {
      scene.remove(clonedPortalModel);
      scene.remove(clonedPortalMaskModel);
      scene.remove(rippleMesh);
      scene.remove(flippedRippleMesh);
    };
  }, [portalModel, portalMaskModel, scene, position, rotation, size]);    

  return { portalModel, portalMaskModel };
};

const backgroundScene = new Scene();
const backgroundCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
backgroundScene.background = new TextureLoader().load(
  process.env.PUBLIC_URL + '/assets/galaxy.jpg',
  (texture) => {
    texture.encoding = LinearEncoding;
    texture.mapping = EquirectangularReflectionMapping;
  }
);

const portalRenderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
  stencilBuffer: false,
});

window.addEventListener('resize', () => {
  portalRenderTarget.setSize(window.innerWidth, window.innerHeight);
});

const V2Portal = ({
  characterRef,
  destination,
  position,
  rotation = [0, 0, 0],
  size,
  onCharacterEnter,
  history,
}) => {
  const { scene } = useThree();
  const { world } = useContext(WorldContext);
  const rippleMaterial = useRef();

  const portalBody = new cannon.Body({
    mass: 0,
    position: new Vec3(...position),
    shape: new Box(new Vec3(0.05, 0.05, 0.05)),
  });
  

  const { portalModel, portalMaskModel } = usePortalModel(position, rotation, size, scene, rippleMaterial)

  const updateFillQuadTransform = (fillQuadMesh) => {
    if (!fillQuadMesh) return;
  
    const cameraPosition = new THREE.Vector3();
    const cameraQuaternion = new THREE.Quaternion();
    const cameraScale = new THREE.Vector3();
  
    backgroundCamera.updateMatrixWorld();
    backgroundCamera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale);
  
    const distanceFromCamera = 5; // Adjust this value as needed
    const cameraDirection = new THREE.Vector3();
    backgroundCamera.getWorldDirection(cameraDirection);
    const fillQuadPosition = cameraPosition.clone().add(cameraDirection.multiplyScalar(distanceFromCamera));
  

    fillQuadMesh.position.copy(fillQuadPosition);
    fillQuadMesh.quaternion.copy(cameraQuaternion);
    fillQuadMesh.scale.set(1, 1, 1);
  };
  
  
  const fillQuadMeshRef = useRef();
    
  
  useEffect(() => {
    if (!world) return;

    portalBody.isPortal = true;
    portalBody.destination = destination;
    portalBody.onCharacterEnter = onCharacterEnter;
    world.addBody(portalBody);

    return () => {
      world.removeBody(portalBody);
    };
  }, [destination, world, position, rotation, onCharacterEnter]);

  useFrame((state) => {
    // Render the background scene to the render target
    /* state.gl.setRenderTarget(portalRenderTarget);

    updateFillQuadTransform(fillQuadMeshRef.current);

    backgroundCamera.position.copy(state.camera.position);
    backgroundCamera.rotation.copy(state.camera.rotation);
    state.gl.render(backgroundScene, backgroundCamera);

    state.gl.setRenderTarget(null); */

    if (rippleMaterial.current) {
      rippleMaterial.current.uniforms.time.value = state.clock.getElapsedTime();
    }

    if (!characterRef || !characterRef.current || !characterRef.current.body) {
      return;
    }
    if (characterRef.current && world) {
      const characterBody = characterRef.current.body;
      const characterPosition = characterBody.position;
      const portalPosition = portalBody.position;

      const distance = characterPosition.distanceTo(portalPosition);
      const proximityThreshold = 1;

      if (distance < proximityThreshold) {
        onCharacterEnter(destination);
      }
    }
  });

  if (!portalModel || !portalMaskModel) {
    return null;
  }

  return (
    <>
      {/* <group position={[0, 0, -5]}>
        <FillQuad map={portalRenderTarget.texture} maskId={1} ref={fillQuadMeshRef} />
      </group> */}
    </>
  );
};

export default V2Portal;

