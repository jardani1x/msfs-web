import { useEffect, useMemo, useRef, useState } from 'react';
import { aircraftCatalog } from '../data/aircraft';
import { airports } from '../data/airports';
import { weatherPresets } from '../data/weather';
import { createInitialState, stepSixDof } from '../physics/sixDof';
import { loadProgress, saveProgress } from '../../state/persistence';

export function useFlightSim() {
  const [aircraftId, setAircraftId] = useState('c172');
  const [airportId, setAirportId] = useState('wsss');
  const [weatherId, setWeatherId] = useState('clear');
  const [running, setRunning] = useState(true);
  const [state, setState] = useState(() => createInitialState(airports[0], aircraftCatalog.c172));

  const controlsRef = useRef({ pitch: 0, roll: 0, yaw: 0, throttle: 0.15, flaps: 0 });
  const timeRef = useRef(0);

  const selectedAircraft = useMemo(() => aircraftCatalog[aircraftId], [aircraftId]);
  const selectedAirport = useMemo(() => airports.find((a) => a.id === airportId) ?? airports[0], [airportId]);
  const selectedWeather = useMemo(() => weatherPresets[weatherId], [weatherId]);

  useEffect(() => {
    const save = loadProgress();
    if (save?.aircraftId && aircraftCatalog[save.aircraftId]) setAircraftId(save.aircraftId);
    if (save?.airportId) setAirportId(save.airportId);
    if (save?.weatherId) setWeatherId(save.weatherId);
    if (save?.state) setState(save.state);
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(1 / 25, (now - last) / 1000);
      last = now;
      timeRef.current += dt;
      setState((prev) => stepSixDof(prev, controlsRef.current, selectedAircraft, selectedWeather, dt, timeRef.current));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, selectedAircraft, selectedWeather]);

  useEffect(() => {
    const id = setInterval(() => {
      saveProgress({ aircraftId, airportId, weatherId, state });
    }, 2000);
    return () => clearInterval(id);
  }, [aircraftId, airportId, weatherId, state]);

  const resetAtAirport = () => {
    setState(createInitialState(selectedAirport, selectedAircraft));
    controlsRef.current = { pitch: 0, roll: 0, yaw: 0, throttle: 0.15, flaps: 0 };
  };

  useEffect(() => { resetAtAirport(); }, [aircraftId, airportId]);

  return {
    state,
    running,
    setRunning,
    controlsRef,
    selectedAircraft,
    selectedAirport,
    selectedWeather,
    aircraftId,
    setAircraftId,
    airportId,
    setAirportId,
    weatherId,
    setWeatherId,
    airports,
    aircraftCatalog,
    weatherPresets,
    resetAtAirport
  };
}
