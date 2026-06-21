import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useAppStore } from '@/store';
import CityModel from './CityModel';
import StationMarker from './StationMarker';
import RadarDish from './RadarDish';
import CloudLayer from './CloudLayer';
import RainArea from './RainArea';
import AlertZone from './AlertZone';

export function SceneGroup() {
  const { stations, radars, activeAlerts, forecast, forecastTimeIndex } = useAppStore();

  return (
    <>
      <PerspectiveCamera makeDefault position={[60, 50, 60]} fov={50} />
      <OrbitControls
        enableDamping
        minDistance={20}
        maxDistance={150}
        target={[0, 0, 0]}
        dampingFactor={0.05}
      />
      <Stars count={2000} radius={300} depth={50} factor={3} saturation={0.5} fade speed={0.5} />
      <ambientLight intensity={0.25} />
      <directionalLight color="#8899BB" intensity={0.6} position={[-40, 60, 20]} />
      <hemisphereLight args={['#1a2942', '#0a1628', 0.4]} />
      <CityModel />
      {stations.map((s) => (
        <StationMarker key={s.id} station={s} />
      ))}
      {radars.map((r) => (
        <RadarDish key={r.id} radar={r} />
      ))}
      <CloudLayer />
      {forecast && forecast.slots[forecastTimeIndex] && (
        <RainArea slot={forecast.slots[forecastTimeIndex]} />
      )}
      <AlertZone alerts={activeAlerts} />
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} kernelSize={60} />
        <Vignette eskil={false} offset={0.3} darkness={0.75} />
      </EffectComposer>
    </>
  );
}

export function SceneRoot() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={['#0A1628']} />
      <fog attach="fog" args={['#0A1628', 80, 220]} />
      <SceneGroup />
    </Canvas>
  );
}

export default SceneRoot;
