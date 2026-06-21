import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { WeatherStation } from '@/types';
import { useAppStore } from '@/store';

interface StationMarkerProps {
  station: WeatherStation;
}

function StationMarker({ station }: StationMarkerProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const { realtimeData, activeAlerts, selectStation } = useAppStore();
  const data = realtimeData[station.id];
  const hasAlert = activeAlerts.some((a) => a.stationId === station.id);

  useFrame((state) => {
    if (!sphereRef.current) return;
    const t = state.clock.elapsedTime;
    sphereRef.current.position.y = 3.5 + Math.sin(t * 1.5 + station.position[0]) * 0.25;
    sphereRef.current.rotation.y = t * 0.3;
    sphereRef.current.rotation.x = t * 0.15;
  });

  return (
    <group position={station.position} onClick={(e) => { e.stopPropagation(); selectStation(station.id); }}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 2, 16]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={0.4}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      <mesh ref={sphereRef} position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial
          transmission={0.6}
          roughness={0.1}
          metalness={0.2}
          color={station.color}
          emissive={station.color}
          emissiveIntensity={0.6}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      <Html
        position={[0, 6, 0]}
        center
        style={{ pointerEvents: 'auto' }}
        zIndexRange={[10, 0]}
      >
        <div
          className={
            'bg-space-800/90 backdrop-blur rounded-lg p-2 border min-w-[140px] ' +
            (hasAlert
              ? 'border-alert-500 animate-alert-pulse'
              : 'border-cyber-500/40')
          }
        >
          <div className="font-orbitron font-bold text-white text-xs mb-1 truncate">
            {station.name}
          </div>
          {data && (
            <div className="text-[10px] space-y-0.5 text-white/80">
              <div className="flex justify-between">
                <span>温度</span>
                <span className="text-cyber-400">{data.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span>风速</span>
                <span className="text-cyber-400">{data.windSpeed.toFixed(1)}m/s</span>
              </div>
              <div className="flex justify-between">
                <span>湿度</span>
                <span className="text-cyber-400">{data.humidity}%</span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default StationMarker;
