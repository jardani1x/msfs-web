import { useEffect } from 'react';
import { BabylonFlightScene } from './rendering/BabylonFlightScene';
import { CesiumMiniMap } from './rendering/CesiumMiniMap';
import { ControlPanel } from './components/ControlPanel';
import { HUD } from './components/HUD';
import { MobileControls } from './components/MobileControls';
import { useFlightSim } from './sim/core/useFlightSim';

export default function App() {
  const sim = useFlightSim();

  useEffect(() => {
    const handleDown = (e) => {
      const c = sim.controlsRef.current;
      if (e.key === 'w') c.pitch = -1;
      if (e.key === 's') c.pitch = 1;
      if (e.key === 'a') c.roll = -1;
      if (e.key === 'd') c.roll = 1;
      if (e.key === 'q') c.yaw = -1;
      if (e.key === 'e') c.yaw = 1;
      if (e.key === 'Shift') c.throttle = Math.min(1, c.throttle + 0.05);
      if (e.key === 'Control') c.throttle = Math.max(0, c.throttle - 0.05);
      if (e.key === '[') c.flaps = Math.max(0, c.flaps - 0.1);
      if (e.key === ']') c.flaps = Math.min(1, c.flaps + 0.1);
    };
    const handleUp = (e) => {
      const c = sim.controlsRef.current;
      if (['w', 's'].includes(e.key)) c.pitch = 0;
      if (['a', 'd'].includes(e.key)) c.roll = 0;
      if (['q', 'e'].includes(e.key)) c.yaw = 0;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, [sim.controlsRef]);

  return (
    <div className="app">
      <BabylonFlightScene state={sim.state} aircraft={sim.selectedAircraft} weather={sim.selectedWeather} />
      <ControlPanel {...sim} />
      <HUD state={sim.state} aircraft={sim.selectedAircraft} weather={sim.selectedWeather} />
      <CesiumMiniMap state={sim.state} />
      <MobileControls controlsRef={sim.controlsRef} />
    </div>
  );
}
