export function HUD({ state, aircraft, weather }) {
  return (
    <div className="hud glass">
      <div><strong>{aircraft.name}</strong> · {weather.name}</div>
      <div>IAS: {state.airspeed.toFixed(0)} kt</div>
      <div>ALT: {state.alt.toFixed(0)} m</div>
      <div>VS: {state.verticalSpeed.toFixed(0)} fpm</div>
      <div>G: {state.gForce.toFixed(2)}</div>
      <div>Fuel: {state.fuel.toFixed(0)}</div>
      <div>Score: {state.score.toFixed(0)}</div>
      {state.crashed ? <div className="warn">Aircraft Crashed</div> : null}
    </div>
  );
}
