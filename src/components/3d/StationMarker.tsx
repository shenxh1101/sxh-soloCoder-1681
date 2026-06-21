import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { WeatherStation } from '@/types';
import { useAppStore } from '@/store';
import { formatWindDirection } from '@/utils/formatters';
import { ALERT_THRESHOLDS } from '@/utils/constants';

interface StationMarkerProps {
  station: WeatherStation;
}

function StationMarker({ station }: StationMarkerProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const { realtimeData, activeAlerts, selectStation } = useAppStore();
  const data = realtimeData[station.id];
  const hasAlert = activeAlerts.some((a) => a.stationId === station.id);
  const isWindAlert = data && data.windSpeed > ALERT_THRESHOLDS.WIND_LEVEL_6;
  const isVisibilityAlert = data && data.visibility < ALERT_THRESHOLDS.VISIBILITY_LOW;

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
            'bg-space-800/95 backdrop-blur-md rounded-xl p-3 border min-w-[200px] shadow-2xl ' +
            (hasAlert
              ? 'border-alert-500/80 shadow-alert-500/20 animate-alert-pulse'
              : 'border-cyber-500/40 shadow-cyber-500/10')
          }
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <div
              className={'w-2 h-2 rounded-full flex-shrink-0 ' + (hasAlert ? 'bg-alert-500 animate-pulse' : '')}
              style={{ backgroundColor: hasAlert ? undefined : station.color, boxShadow: hasAlert ? '0 0 8px #FF4757' : `0 0 6px ${station.color}80` }}
            />
            <div className="font-orbitron font-bold text-white text-xs truncate flex-1">
              {station.name}
            </div>
            {hasAlert && (
              <span className="text-[9px] font-orbitron text-alert-400 bg-alert-500/15 px-1.5 py-0.5 rounded">
                预警
              </span>
            )}
          </div>
          {data && (
            <div className="text-[10px] space-y-1 text-white/80 grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">温度</span>
                <span className="font-orbitron text-orange-400">{data.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">湿度</span>
                <span className="font-orbitron text-cyan-400">{data.humidity}%</span>
              </div>
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">气压</span>
                <span className="font-orbitron text-purple-400">{data.pressure.toFixed(1)}hPa</span>
              </div>
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">风速</span>
                <span className={'font-orbitron ' + (isWindAlert ? 'text-alert-400 font-bold animate-pulse' : 'text-green-400')}>
                  {data.windSpeed.toFixed(1)}m/s
                </span>
              </div>
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">风向</span>
                <span className="font-orbitron text-blue-300">{formatWindDirection(data.windDirection).split(' ')[0]}</span>
              </div>
              <div className="flex justify-between items-center col-span-1">
                <span className="text-white/50">能见度</span>
                <span className={'font-orbitron ' + (isVisibilityAlert ? 'text-alert-400 font-bold animate-pulse' : 'text-yellow-400')}>
                  {data.visibility >= 1000 ? `${(data.visibility / 1000).toFixed(1)}km` : `${data.visibility}m`}
                </span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export default StationMarker;
