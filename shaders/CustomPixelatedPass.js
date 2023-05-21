import * as THREE from "three";
import { RenderPixelatedPass } from "./RenderPixelatedPass";
import { Pass } from "three/examples/jsm/postprocessing/Pass";
import { useEffect, useRef, useState } from "react";
import { extend } from "@react-three/fiber";

class CustomPixelatedPass extends Pass {
  constructor(pixelSize, scene, camera) {
    super();

    this.renderPixelatedPass = new RenderPixelatedPass(pixelSize, scene, camera);
  }

  renderPass(renderer, scene, camera, writeBuffer) {
    this.renderPixelatedPass.render(renderer, writeBuffer);
  }
}

extend({ CustomPixelatedPass });

const CustomPixelatedPassWrapper = (props) => {
  const customPixelatedPassRef = useRef();

  useEffect(() => {
    const pass = new CustomPixelatedPass(props.pixelSize);
    customPixelatedPassRef.current = pass;
    return () => {
      customPixelatedPassRef.current = null;
    };
  }, [props.pixelSize]);

  return customPixelatedPassRef.current ? <primitive object={customPixelatedPassRef.current} {...props} /> : null;
};

export default CustomPixelatedPassWrapper;
