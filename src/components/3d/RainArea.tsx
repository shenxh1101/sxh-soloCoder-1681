import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ForecastSlot } from '@/types';
import { useAppStore } from '@/store';

interface RainAreaProps {
  slot: ForecastSlot;
}

function RainArea({ slot }: RainAreaProps) {
  const { activeAlerts } = useAppStore();
  const rainCylinderRef = useRef<THREE.Mesh>(null);
  const rainTopRef = useRef<THREE.Mesh>(null);

  const alertRainAreas = useMemo(() => {
    return activeAlerts
      .filter((a) => a.type === 'both' || a.type === 'wind' || a.type === 'visibility')
      .map((a) => ({
        x: a.areaPosition[0],
        z: a.areaPosition[2],
        radius: a.areaRadius,
      }));
  }, [activeAlerts]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.12 + (Math.sin(t * 2) * 0.5 + 0.5) * 0.1;
    const scalePulse = 1 + Math.sin(t * 1.5) * 0.05;

    if (rainCylinderRef.current) {
      const mat = rainCylinderRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = pulse;
      rainCylinderRef.current.scale.setScalar(scalePulse);
    }
    if (rainTopRef.current) {
      const mat = rainTopRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.2 + (Math.sin(t * 2) * 0.5 + 0.5) * 0.1;
      rainTopRef.current.scale.setScalar(scalePulse);
    }
  });

  if (!slot.rainArea) {
    return (
      <group>
        {alertRainAreas.map((area, i) => (
          <mesh
            key={`alert-rain-${i}`}
            position={[area.x, 15, area.z]}
          >
            <cylinderGeometry args={[area.radius, area.radius, 30, 32]} />
            <meshStandardMaterial
              color="#FF4757"
              transparent
              opacity={0.12}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group>
      <mesh
        ref={rainCylinderRef}
        position={[slot.rainArea.x, 15, slot.rainArea.z]}
      >
        <cylinderGeometry args={[slot.rainArea.radius, slot.rainArea.radius, 30, 48]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.15}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        ref={rainTopRef}
        position={[slot.rainArea.x, 30, slot.rainArea.z]}
        rotation-x={-Math.PI / 2}
      >
        <circleGeometry args={[slot.rainArea.radius, 48]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.25}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {alertRainAreas.map((area, i) => (
        <mesh
          key={`alert-rain-${i}`}
          position={[area.x, 15, area.z]}
        >
          <cylinderGeometry args={[area.radius, area.radius, 30, 32]} />
          <meshStandardMaterial
            color="#FF4757"
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export default RainArea;
