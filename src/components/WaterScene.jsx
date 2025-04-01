"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WaterScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(3072, 1280);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Set up scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1536, 1536, 640, -640, 0.1, 1000);
    camera.position.z = 10;

    // Geometry and shaders
    const geometry = new THREE.PlaneGeometry(3072, 1280, 256, 256);
    const uniforms = {
      uTime: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        float perlin(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = rand(i);
          float b = rand(i + vec2(1.0, 0.0));
          float c = rand(i + vec2(0.0, 1.0));
          float d = rand(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) +
                 (c - a) * u.y * (1.0 - u.x) +
                 (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv * 10.0;

          float wave = 0.0;
          wave += perlin(uv + uTime * 0.1) * 0.4;
          wave += perlin(uv * 1.5 + uTime * 0.2) * 0.3;
          wave += perlin(uv * 2.5 - uTime * 0.15) * 0.2;

          float brightness = smoothstep(0.2, 0.8, wave);
          vec3 baseColor = mix(vec3(0.0, 0.2, 0.6), vec3(0.4, 0.7, 1.0), brightness);
          float crest = smoothstep(0.85, 1.0, brightness);
          vec3 finalColor = mix(baseColor, vec3(1.0), crest);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        width: "3072px",
        height: "1280px",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );
}
