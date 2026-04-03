import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import logo from '../assets/certus-3d.png';

const AnimatedLogo3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const geometry = new THREE.PlaneGeometry(3, 2);
    const texture = new THREE.TextureLoader().load(logo);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, []);

  return (
    <div style={{ width: '300px', height: '200px', margin: '0 auto' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default AnimatedLogo3D;
