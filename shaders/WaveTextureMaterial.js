import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import noise from './noise.glsl';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  ${noise}
  varying vec2 vUv;
  uniform float time;
  uniform float scale;
  uniform float distortion;
  uniform float detail;
  uniform float detailScale;
  uniform float roughness;
  uniform float phaseOffset;

  float wave(vec3 position) {
    float waveType = sin(position.x + phaseOffset) * 0.5 + 0.5;
    return waveType;
  }

  void main() {
    vec3 pos = vec3(vUv * scale, time / 120.0);
    float noiseValue = cnoise(pos * detailScale);
    pos += distortion * noiseValue * vec3(1.0, 1.0, roughness);
    float waveValue = wave(pos);
    vec3 blackColor = vec3(0.4);
    vec3 greyColor = vec3(0.6);
    gl_FragColor = vec4(mix(blackColor, greyColor, waveValue), 1.0);
  }
`;

class WaveTextureMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 1 },
        scale: { value: 3 },
        distortion: { value: 8 },
        detail: { value: 4 },
        detailScale: { value: 20 },
        roughness: { value: 1 },
        phaseOffset: { value: 4 },
      },
    });
  }
}

extend({ WaveTextureMaterial });
