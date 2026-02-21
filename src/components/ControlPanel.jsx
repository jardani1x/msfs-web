export function ControlPanel({
  aircraftId,
  setAircraftId,
  airportId,
  setAirportId,
  weatherId,
  setWeatherId,
  aircraftCatalog,
  airports,
  weatherPresets,
  running,
  setRunning,
  resetAtAirport
}) {
  return (
    <div className="panel glass">
      <h2>MSFS Web</h2>
      <label>
        Aircraft
        <select value={aircraftId} onChange={(e) => setAircraftId(e.target.value)}>
          {Object.values(aircraftCatalog).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <label>
        Airport
        <select value={airportId} onChange={(e) => setAirportId(e.target.value)}>
          {airports.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </label>
      <label>
        Weather
        <select value={weatherId} onChange={(e) => setWeatherId(e.target.value)}>
          {Object.values(weatherPresets).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </label>
      <div className="row">
        <button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Resume'}</button>
        <button onClick={resetAtAirport}>Reset</button>
      </div>
    </div>
  );
}
