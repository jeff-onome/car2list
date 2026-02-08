
import React, { useEffect, useRef, useState } from 'react';

declare const THREE: any;

interface Hotspot {
  position: [number, number, number];
  title: string;
  description: string;
  id: string;
}

interface ThreeCarViewerProps {
  color?: string;
  hotspots?: Hotspot[];
}

const ThreeCarViewer: React.FC<ThreeCarViewerProps> = ({ color = '#ffffff', hotspots = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  // Refs for Three.js objects to update them without re-mounting
  const carMaterialRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef<any>(null);
  const hotspotMeshesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current || typeof THREE === 'undefined') return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    // Raycaster for hotspots
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycasterRef.current = raycaster;
    mouseRef.current = mouse;

    // Car Group
    const carGroup = new THREE.Group();
    
    // Premium Material
    const carMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.2,
    });
    carMaterialRef.current = carMaterial;

    // Body
    const bodyGeom = new THREE.BoxGeometry(3.2, 0.6, 1.6);
    const body = new THREE.Mesh(bodyGeom, carMaterial);
    body.position.y = 0.5;
    carGroup.add(body);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(1.6, 0.5, 1.3);
    const cabin = new THREE.Mesh(cabinGeom, carMaterial);
    cabin.position.y = 1.0;
    cabin.position.x = -0.3;
    carGroup.add(cabin);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.8 });
    
    const wheelPos = [
      [1.1, 0.4, 0.75], [1.1, 0.4, -0.75],
      [-1.1, 0.4, 0.75], [-1.1, 0.4, -0.75]
    ];

    wheelPos.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      carGroup.add(wheel);
    });

    // Create Hotspot Meshes
    const hotspotGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const hotspotMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.6 
    });

    hotspots.forEach(h => {
      const mesh = new THREE.Mesh(hotspotGeom, hotspotMat.clone());
      mesh.position.set(...h.position);
      mesh.userData = h;
      scene.add(mesh);
      hotspotMeshesRef.current.push(mesh);
    });

    scene.add(carGroup);

    // Animation Loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frame += 0.01;
      
      // Gentle auto-rotation
      carGroup.rotation.y += 0.003;

      // Pulse hotspots
      hotspotMeshesRef.current.forEach(mesh => {
        const scale = 1 + Math.sin(frame * 4) * 0.15;
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.y = carGroup.rotation.y; // Sync position logic if attached to group, but here they are static in scene for simplicity
      });

      renderer.render(scene, camera);
    };

    animate();

    // Event Handlers
    const onMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hotspotMeshesRef.current);

      if (intersects.length > 0) {
        const h = intersects[0].object.userData as Hotspot;
        setActiveHotspot(h);
        setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        intersects[0].object.material.opacity = 1.0;
        document.body.style.cursor = 'pointer';
      } else {
        setActiveHotspot(null);
        hotspotMeshesRef.current.forEach(m => m.material.opacity = 0.6);
        document.body.style.cursor = 'default';
      }
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    containerRef.current.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousemove', onMouseMove);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync Color prop to material
  useEffect(() => {
    if (carMaterialRef.current && typeof THREE !== 'undefined') {
      carMaterialRef.current.color.set(color);
    }
  }, [color]);

  return (
    <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden">
      {/* Tooltip Overlay */}
      {activeHotspot && (
        <div 
          className="absolute z-50 pointer-events-none transition-all duration-200"
          style={{ 
            left: tooltipPos.x + 15, 
            top: tooltipPos.y - 40,
          }}
        >
          <div className="glass px-4 py-3 rounded-2xl border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[180px]">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-b border-white/10 pb-1 mb-1">{activeHotspot.title}</h4>
             <p className="text-[9px] text-zinc-400 uppercase leading-relaxed">{activeHotspot.description}</p>
          </div>
        </div>
      )}
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Activities Fully Functional</span>
         </div>
      </div>
    </div>
  );
};

export default ThreeCarViewer;
