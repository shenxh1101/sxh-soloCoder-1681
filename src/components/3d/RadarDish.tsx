import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { RadarStation } from '@/types';

interface RadarDishProps {
  radar: RadarStation;
}

function RadarDish({ radar }: RadarDishProps) {
  const rotatingRef = useRef<THREE.Group>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (rotatingRef.current) {
      rotatingRef.current.rotation.y += delta * (radar.rotationSpeed || 0.5);
    }
    if (scanRingRef.current) {
      scanRingRef.current.rotation.y -= delta * 1.2;
    }
  });

  return (
    <group position={radar.position}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[1, 1.2, 4, 16]} />
        <meshStandardMaterial color="#2a3a5a" metalness={0.5} roughness={0.6} />
      </mesh>

      <group ref={rotatingRef} position={[0, 4, 0]}>
        <mesh position={[0, 3.5, 0]} rotation-z={-0.3} castShadow>
          <boxGeometry args={[0.2, 5, 0.2]} />
          <meshStandardMaterial color="#3a4a6a" metalness={0.6} roughness={0.4} />
        </mesh>

        <mesh position={[0, 6, 1.5]} rotation-x={-0.3} castShadow>
          <torusGeometry args={[2.5, 0.15, 16, 64, Math.PI]} />
          <meshStandardMaterial
            color="#7B68EE"
            emissive="#7B68EE"
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <mesh ref={scanRingRef} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[3.5, 4, 64]} />
        <meshBasicMaterial
          color="#7B68EE"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Html position={[0, 8, 0]} center style={{ pointerEvents: 'none' }}>
        <div className="bg-space-800/80 backdrop-blur px-2 py-1 rounded border border-radar-500/40">
          <span className="font-orbitron text-radar-400 text-[10px] whitespace-nowrap">
            {radar.name}
          </span>
        </div>
      </Html>
    </group>
  );
}

export default RadarDish;
