import { airDensity, smoothstep, windField } from './atmosphere';

const g = 9.81;

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function eulerToForward(roll, pitch, yaw) {
  const cp = Math.cos(pitch);
  return {
    x: Math.sin(yaw) * cp,
    y: Math.sin(pitch),
    z: Math.cos(yaw) * cp
  };
}

export function createInitialState(airport, aircraft) {
  return {
    lat: airport.lat,
    lon: airport.lon,
    alt: airport.elevation + 2,
    velocity: { x: 0, y: 0, z: 0 },
    angularVelocity: { x: 0, y: 0, z: 0 },
    orientation: { roll: 0, pitch: 0, yaw: (airport.heading * Math.PI) / 180 },
    throttle: 0.15,
    flaps: 0,
    fuel: aircraft.maxFuel,
    engineOn: true,
    loadFactor: 1,
    airspeed: 0,
    verticalSpeed: 0,
    gForce: 1,
    crashed: false,
    score: 0
  };
}

export function stepSixDof(state, controls, aircraft, weather, dt, simTime) {
  if (state.crashed) return state;

  const s = structuredClone(state);
  const ctrl = {
    pitch: clamp(controls.pitch, -1, 1),
    roll: clamp(controls.roll, -1, 1),
    yaw: clamp(controls.yaw, -1, 1),
    throttle: clamp(controls.throttle, 0, 1),
    flaps: clamp(controls.flaps, 0, 1)
  };

  s.throttle += (ctrl.throttle - s.throttle) * Math.min(1, dt * 2.5);
  s.flaps += (ctrl.flaps - s.flaps) * Math.min(1, dt * 2);

  const rho = airDensity(s.alt);
  const wind = windField({ weather, time: simTime, altitude: s.alt });
  const relV = {
    x: s.velocity.x - wind.x,
    y: s.velocity.y - wind.y,
    z: s.velocity.z - wind.z
  };

  const speed = Math.max(0.1, Math.hypot(relV.x, relV.y, relV.z));
  const alpha = Math.atan2(relV.y, Math.max(0.1, relV.z));
  const q = 0.5 * rho * speed * speed;
  const flapLift = s.flaps * 0.6;
  const clRaw = aircraft.liftSlope * (alpha + flapLift);
  const stallFade = 1 - smoothstep(aircraft.stallAoA, aircraft.stallAoA + 0.2, Math.abs(alpha));
  const cl = clRaw * (0.25 + 0.75 * stallFade);
  const cd = aircraft.dragCoefficient + (cl * cl) / (Math.PI * 8.5) + s.flaps * 0.08;

  const lift = q * aircraft.wingArea * cl;
  const drag = q * aircraft.wingArea * cd;
  const thrust = aircraft.maxThrust * s.throttle * (s.engineOn ? 1 : 0);

  const fwd = eulerToForward(s.orientation.roll, s.orientation.pitch, s.orientation.yaw);
  const longitudinalAccel = (thrust - drag) / aircraft.mass;
  const pitchLiftGain = Math.cos(s.orientation.roll) * Math.max(0.35, Math.cos(s.orientation.pitch));
  const accel = {
    x: fwd.x * longitudinalAccel,
    y: (lift / aircraft.mass) * pitchLiftGain - g,
    z: fwd.z * longitudinalAccel
  };

  s.velocity.x += accel.x * dt;
  s.velocity.y += accel.y * dt;
  s.velocity.z += accel.z * dt;

  const aeroDamping = clamp(1 - dt * (0.08 + s.flaps * 0.12), 0.82, 1);
  s.velocity.x *= aeroDamping;
  s.velocity.z *= aeroDamping;

  const rollRate = ctrl.roll * aircraft.controlAuthority.roll * 0.9;
  const pitchRate = ctrl.pitch * aircraft.controlAuthority.pitch * 0.65;
  const yawRate = ctrl.yaw * aircraft.controlAuthority.yaw * 0.5 + ctrl.roll * 0.12;

  s.angularVelocity.x += (rollRate - s.angularVelocity.x) * dt * 3;
  s.angularVelocity.y += (pitchRate - s.angularVelocity.y) * dt * 3;
  s.angularVelocity.z += (yawRate - s.angularVelocity.z) * dt * 2;

  s.orientation.roll += s.angularVelocity.x * dt;
  s.orientation.pitch = clamp(s.orientation.pitch + s.angularVelocity.y * dt, -1.2, 1.2);
  s.orientation.yaw += s.angularVelocity.z * dt;

  s.alt += s.velocity.y * dt;
  const northMps = s.velocity.z;
  const eastMps = s.velocity.x;
  s.lat += (northMps * dt) / 111_320;
  s.lon += (eastMps * dt) / (111_320 * Math.cos((s.lat * Math.PI) / 180));

  const fuelFlow = (0.08 + s.throttle * 0.95) * (aircraft.maxThrust / 100000);
  s.fuel = Math.max(0, s.fuel - fuelFlow * dt);
  if (s.fuel <= 0) s.engineOn = false;

  s.airspeed = speed * 1.94384;
  s.verticalSpeed = s.velocity.y * 196.85;
  s.loadFactor = (lift / (aircraft.mass * g)) || 1;
  s.gForce = Math.max(0, Math.abs(1 + accel.y / g));

  s.score += (s.airspeed > 60 ? 1 : 0) * dt + (s.alt > 30 ? 1 : 0) * dt;

  if (s.alt < 0.2 && Math.abs(s.velocity.y) > 4.5) s.crashed = true;
  if (s.alt < 0) {
    s.alt = 0;
    s.velocity.y = 0;

    const groundFriction = clamp(1 - dt * 1.9, 0, 1);
    s.velocity.x *= groundFriction;
    s.velocity.z *= groundFriction;
    s.orientation.roll *= clamp(1 - dt * 2.5, 0, 1);
    s.orientation.pitch *= clamp(1 - dt * 2.5, 0, 1);
  }

  return s;
}
