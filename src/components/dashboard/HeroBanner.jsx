import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function HeroBanner({ occupancyRate = 0, activeSites = 0, availableRooms = 0, availableBuildings = 0 }) {
  const globeRef = useRef(null);

  useEffect(() => {
    if (!globeRef.current) return;
    const container = globeRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe wireframe
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const wireframe = new THREE.WireframeGeometry(sphereGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.15 });
    const globe = new THREE.LineSegments(wireframe, lineMat);
    scene.add(globe);

    // Points on globe
    const pointCount = 80;
    const dotGeo = new THREE.BufferGeometry();
    const dotPos = new Float32Array(pointCount * 3);
    const dotColors = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointCount);
      const theta = Math.sqrt(pointCount * Math.PI) * phi;
      const r = 1.02;
      dotPos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      dotPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      dotPos[i * 3 + 2] = r * Math.cos(phi);
      const green = i / pointCount > 0.5 ? 1 : 0;
      dotColors[i * 3] = green ? 0.06 : 0.96;
      dotColors[i * 3 + 1] = green ? 0.72 : 0.24;
      dotColors[i * 3 + 2] = green ? 0.53 : 0.37;
    }
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    dotGeo.setAttribute('color', new THREE.BufferAttribute(dotColors, 3));
    const dotMat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.9 });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // Ambient rings
    const ringGeo = new THREE.TorusGeometry(1.3, 0.005, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.003, 8, 100),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.1 })
    );
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    scene.add(ring2);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.003;
      dots.rotation.y += 0.003;
      ring.rotation.z += 0.002;
      ring2.rotation.z -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const stats = [
    { label: 'Occupancy', value: `${occupancyRate}%`, color: 'from-cyan-400 to-blue-500' },
    { label: 'Active Sites', value: activeSites, color: 'from-violet-400 to-purple-500' },
    { label: 'Available Rooms', value: availableRooms, color: 'from-emerald-400 to-green-500' },
    { label: 'Buildings', value: availableBuildings, color: 'from-amber-400 to-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative glass-card overflow-hidden mb-8"
    >
      <div className="relative flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
        <div className="flex-1 z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-4xl font-bold text-white mb-3"
            style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}
          >
            Welcome to Koume RoomFlow
          </motion.h1>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            Complete dormitory management — track rooms, occupants, and reservations in real time.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="glass-card px-4 py-3 flex items-center gap-3"
              >
                <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${s.color}`} />
                <div>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div ref={globeRef} className="w-64 h-64 lg:w-80 lg:h-80 flex-shrink-0" />
      </div>
    </motion.div>
  );
}