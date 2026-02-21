const RHO0 = 1.225;

export function airDensity(altitudeMeters) {
  return RHO0 * Math.exp(-Math.max(0, altitudeMeters) / 8500);
}

export function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function windField({ weather, time, altitude }) {
  const base = weather.windKnots * 0.514444;
  const gust = weather.gustStrength * Math.sin(time * 0.2 + altitude * 0.0015);
  const cross = weather.gustStrength * Math.cos(time * 0.17);
  return { x: base + gust, y: cross * 0.15, z: cross };
}
