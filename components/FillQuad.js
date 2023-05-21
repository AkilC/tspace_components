import React, { useEffect, useRef, forwardRef } from "react";
import { EqualStencilFunc } from "three";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;

  uniform sampler2D map;

  void main() {
    vec3 col = texture2D(map, vUv).xyz;
    gl_FragColor = vec4(pow(col, vec3(1.75)) * 2.5, 1.0);
  }
`;

const uniforms = {
  map: { type: "t", value: null }
};

export const FillQuad = forwardRef(({ map, maskId }, ref) => {
  const materialRef = useRef();

  useEffect(() => {
    materialRef.current.uniforms.map.value = map;
  }, [map]);

  const materialProperties = {
    uniforms,
    vertexShader,
    fragmentShader,
    depthWrite: false,
    depthTest: false,
    stencilWrite: true,
    stencilFunc: EqualStencilFunc,
    stencilRef: maskId,
    stencilFuncMask: 0xFF,
    stencilWriteMask: 0xFF,
  };

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={materialRef} attach="material" {...materialProperties} />
    </mesh>
  );
});
