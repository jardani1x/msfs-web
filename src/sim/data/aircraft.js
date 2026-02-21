export const aircraftCatalog = {
  c172: {
    id: 'c172',
    name: 'Cessna 172',
    mass: 1111,
    wingArea: 16.2,
    maxThrust: 4200,
    maxFuel: 212,
    controlAuthority: { pitch: 1.1, roll: 1.0, yaw: 0.8 },
    dragCoefficient: 0.032,
    liftSlope: 5.6,
    stallAoA: 0.28,
    inertia: { x: 1450, y: 2100, z: 2850 }
  },
  b737: {
    id: 'b737',
    name: 'Boeing 737',
    mass: 41413,
    wingArea: 124.6,
    maxThrust: 242000,
    maxFuel: 26000,
    controlAuthority: { pitch: 0.55, roll: 0.5, yaw: 0.45 },
    dragCoefficient: 0.022,
    liftSlope: 5.1,
    stallAoA: 0.24,
    inertia: { x: 150000, y: 230000, z: 350000 }
  },
  fa18: {
    id: 'fa18',
    name: 'F/A-18',
    mass: 16800,
    wingArea: 37.2,
    maxThrust: 157000,
    maxFuel: 4900,
    controlAuthority: { pitch: 1.5, roll: 1.55, yaw: 1.2 },
    dragCoefficient: 0.028,
    liftSlope: 6.4,
    stallAoA: 0.36,
    inertia: { x: 29000, y: 43000, z: 62000 }
  }
};
