import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeatherAlert } from '@/types';

interface AlertZoneProps {
  alerts: WeatherAlert[];
}

interface AlertRefs {
  cylinder: THREE.Mesh | null;
  ring: THREE.Mesh | null;
  ground: THREE.Mesh | null;
}

function AlertZone({ alerts }: AlertZoneProps) {
  const refsMap = useRef<Map<string, AlertRefs>>(new Map());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    refsMap.current.forEach((refs) => {
      const pulse = 0.15 + (Math.sin(t * 2.5) * 0.5 + 0.5) * 0.15;
      if (refs.cylinder) {
        const mat = refs.cylinder.material as THREE.MeshStandardMaterial;
        mat.opacity = pulse;
      }
      if (refs.ring) {
        refs.ring.rotation.y += 0.02;
        const ringScale = 1 + Math.sin(t * 2) * 0.08;
        refs.ring.scale.set(ringScale, ringScale, 1);
      }
      if (refs.ground) {
        const mat = refs.ground.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.2 + (Math.sin(t * 2.5) * 0.5 + 0.5) * 0.2;
      }
    });
  });

  if (alerts.length === 0) return null;

  return (
    <group>
      {alerts.map((alert) => {
        const setRef = (key: keyof AlertRefs) => (el: THREE.Mesh | null) => {
          let entry = refsMap.current.get(alert.id);
          if (!entry) {
            entry = { cylinder: null, ring: null, ground: null };
            refsMap.current.set(alert.id, entry);
          }
          entry[key] = el;
        };

        return (
          <group key={alert.id} position={alert.areaPosition}>
            <mesh
              ref={setRef('cylinder')}
              position={[0, 17.5, 0]}
            >
              <cylinderGeometry args={[alert.areaRadius, alert.areaRadius, 35, 48]} />
              <meshStandardMaterial
                color="#FF4757"
                transparent
                opacity={0.18}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            <mesh
              ref={setRef('ring')}
              position={[0, 35, 0]}
              rotation-x={-Math.PI / 2}
            >
              <ringGeometry args={[alert.areaRadius - 0.3, alert.areaRadius, 64]} />
              <meshStandardMaterial
                color="#FF4757"
                emissive="#FF4757"
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            <mesh
              ref={setRef('ground')}
              rotation-x={-Math.PI / 2}
              position={[0, 0.03, 0]}
            >
              <circleGeometry args={[alert.areaRadius, 64]} />
              <meshStandardMaterial
                color="#FF4757"
                transparent
                opacity={0.3}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default AlertZone;
