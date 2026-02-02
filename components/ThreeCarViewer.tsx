
import React, { useEffect, useRef } from 'react';

declare const THREE: any;

interface ThreeCarViewerProps {
  color?: string;
}

const ThreeCarViewer: React.FC<ThreeCarViewerProps> = ({ color = '#ffffff' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof THREE === 'undefined') return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Placeholder Car (Simple Box with Wheel cylinders for now)
    const carGroup = new THREE.Group();
    
    // Body
    const bodyGeom = new THREE.BoxGeometry(3, 0.8, 1.5);
    const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    carGroup.add(body);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(1.5, 0.6, 1.2);
    const cabin = new THREE.Mesh(cabinGeom, bodyMat);
    cabin.position.y = 0.7;
    cabin.position.x = -0.2;
    carGroup.add(cabin);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    const wheelPos = [
      [1, -0.4, 0.7], [1, -0.4, -0.7],
      [-1, -0.4, 0.7], [-1, -0.4, -0.7]
    ];

    wheelPos.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      carGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [color]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

export default ThreeCarViewer;
