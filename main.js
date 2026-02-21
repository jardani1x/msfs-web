import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';

const SAVE_KEY = 'msfs-web-save-v4';

const AIRCRAFT = {
  trainer: { name: 'Aero Trainer G100', mass: 1150, wingArea: 16.2, thrustMax: 17500, dragBase: 0.025, liftSlope: 5.4, rollRate: 1.45, pitchRate: 1.18, yawRate: 0.84, stallAoa: 0.23, flare: '#55d0ff' },
  jet: { name: 'Nimbus J-42', mass: 6300, wingArea: 38, thrustMax: 86000, dragBase: 0.032, liftSlope: 4.8, rollRate: 1.92, pitchRate: 1.25, yawRate: 1.05, stallAoa: 0.19, flare: '#ffb454' },
  cargo: { name: 'Atlas Cargo 900', mass: 22000, wingArea: 98, thrustMax: 240000, dragBase: 0.041, liftSlope: 4.1, rollRate: 0.8, pitchRate: 0.66, yawRate: 0.62, stallAoa: 0.17, flare: '#9bff9e' }
};

const AIRPORTS = {
  singapore: { name: 'WSSS Changi', ground: 4, runwayHeading: 20, ambient: 0x2d4658, sun: 0xdef2ff, wind: new THREE.Vector3(1, 0, -2), worldColor: 0x1f3140, lat: 1.36, lon: 103.99 },
  dubai: { name: 'OMDB Dubai', ground: 63, runwayHeading: 120, ambient: 0x5e4f37, sun: 0xffeecc, wind: new THREE.Vector3(4, 0, 1), worldColor: 0x6c5531, lat: 25.25, lon: 55.36 },
  alaska: { name: 'PANC Anchorage', ground: 40, runwayHeading: 70, ambient: 0x2f3844, sun: 0xe4f5ff, wind: new THREE.Vector3(-3, 0, 2), worldColor: 0x2a3f2f, lat: 61.17, lon: -149.98 },
  rio: { name: 'SBGL Rio Galeao', ground: 9, runwayHeading: 150, ambient: 0x2f4f58, sun: 0xfff2d9, wind: new THREE.Vector3(2, 0, 4), worldColor: 0x21543b, lat: -22.81, lon: -43.25 }
};

const WEATHER = {
  clear: { name: 'Clear', cloud: 0.2, turbulence: 0.05, rain: 0, vis: 1, gust: 0.2, fog: 0.0009 },
  cloudy: { name: 'Cloudy', cloud: 0.7, turbulence: 0.18, rain: 0.1, vis: 0.85, gust: 0.6, fog: 0.0017 },
  storm: { name: 'Storm', cloud: 1, turbulence: 0.52, rain: 0.95, vis: 0.52, gust: 1.7, fog: 0.0047 },
  windy: { name: 'Windy', cloud: 0.45, turbulence: 0.33, rain: 0.02, vis: 0.92, gust: 2.4, fog: 0.0014 }
};

const QUALITY = {
  low: { terrainSeg: 100, clouds: 45, rain: 300, shadow: false, pixelRatio: 1 },
  medium: { terrainSeg: 150, clouds: 75, rain: 700, shadow: true, pixelRatio: Math.min(1.6, window.devicePixelRatio) },
  high: { terrainSeg: 220, clouds: 125, rain: 1500, shadow: true, pixelRatio: Math.min(2, window.devicePixelRatio) }
};

const dom = {
  canvas: document.querySelector('#sim'),
  menu: document.querySelector('#menu'),
  launchBtn: document.querySelector('#launchBtn'),
  resumeBtn: document.querySelector('#resumeBtn'),
  aircraftSelect: document.querySelector('#aircraftSelect'),
  airportSelect: document.querySelector('#airportSelect'),
  weatherSelect: document.querySelector('#weatherSelect'),
  qualitySelect: document.querySelector('#qualitySelect'),
  spd: document.querySelector('#spd'), alt: document.querySelector('#alt'), hdg: document.querySelector('#hdg'), vs: document.querySelector('#vs'),
  status: document.querySelector('#status'),
  throttleSlider: document.querySelector('#throttleSlider'),
  flapsSlider: document.querySelector('#flapsSlider'),
  leftStick: document.querySelector('#leftStick'),
  rightStick: document.querySelector('#rightStick'),
  cameraBtn: document.querySelector('#cameraBtn')
};

for (const [k, v] of Object.entries(AIRCRAFT)) dom.aircraftSelect.add(new Option(v.name, k));
for (const [k, v] of Object.entries(AIRPORTS)) dom.airportSelect.add(new Option(v.name, k));
for (const [k, v] of Object.entries(WEATHER)) dom.weatherSelect.add(new Option(v.name, k));

const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x9ab7d8, 0.0016);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 7, 22);

const hemi = new THREE.HemisphereLight(0xb7dcff, 0x2b3129, 0.7);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.35);
sun.position.set(350, 480, 180);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

let terrain, clouds, rain;
const world = new THREE.Group();
scene.add(world);

const aircraftMesh = new THREE.Group();
scene.add(aircraftMesh);
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 8, 12), new THREE.MeshStandardMaterial({ color: 0xd0e6ff, metalness: 0.35, roughness: 0.4 }));
body.rotation.z = Math.PI / 2;
aircraftMesh.add(body);
const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 11), new THREE.MeshStandardMaterial({ color: 0x9db4c9, metalness: 0.25, roughness: 0.5 }));
aircraftMesh.add(wing);
const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 3.2), new THREE.MeshStandardMaterial({ color: 0xa1b8ce }));
tailWing.position.set(-3.1, 0.75, 0);
aircraftMesh.add(tailWing);
const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 1.2), new THREE.MeshStandardMaterial({ color: 0xb9cee1 }));
fin.position.set(-3.3, 1.2, 0);
aircraftMesh.add(fin);

const runway = new THREE.Mesh(new THREE.PlaneGeometry(30, 800), new THREE.MeshStandardMaterial({ color: 0x2c3038, roughness: 0.9, metalness: 0.05 }));
runway.rotation.x = -Math.PI / 2;
runway.receiveShadow = true;
world.add(runway);

const state = {
  running: false,
  cameraMode: 0,
  score: { distanceNm: 0, smoothness: 100 },
  selected: { aircraft: 'trainer', airport: 'singapore', weather: 'clear', quality: 'medium' },
  flight: {
    pos: new THREE.Vector3(0, 8, 320),
    vel: new THREE.Vector3(0, 0, -60),
    euler: new THREE.Euler(0, Math.PI, 0, 'YXZ'),
    throttle: 0.45,
    flaps: 0,
    fuel: 1,
    verticalSpeed: 0
  },
  controls: {
    pitch: 0, roll: 0, yaw: 0,
    throttleDelta: 0, flapsDelta: 0,
  },
  weatherPulse: 0,
};

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup', (e) => keys.delete(e.code));
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

dom.cameraBtn.addEventListener('click', () => state.cameraMode = (state.cameraMode + 1) % 3);

dom.throttleSlider.addEventListener('input', () => state.flight.throttle = Number(dom.throttleSlider.value));
dom.flapsSlider.addEventListener('input', () => state.flight.flaps = Number(dom.flapsSlider.value));

function bindStick(el, onMove) {
  const nub = el.querySelector('.nub');
  let active = false;
  const reset = () => { nub.style.transform = 'translate(-50%, -50%)'; onMove(0, 0); };
  el.addEventListener('pointerdown', (e) => { active = true; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointerup', () => { active = false; reset(); });
  el.addEventListener('pointercancel', () => { active = false; reset(); });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const m = Math.min(1, Math.hypot(dx, dy));
    const a = Math.atan2(dy, dx);
    const x = Math.cos(a) * m, y = Math.sin(a) * m;
    nub.style.transform = `translate(${x * 34 - 50}%, ${y * 34 - 50}%)`;
    onMove(x, y);
  });
}
bindStick(dom.leftStick, (x, y) => { state.controls.roll = x; state.controls.pitch = y; });
bindStick(dom.rightStick, (x, y) => { state.controls.yaw = x; state.controls.pitch = (state.controls.pitch + y) * 0.5; });

function setStatus(msg) { dom.status.textContent = msg; }

function saveProgress() {
  const data = {
    selected: state.selected,
    flight: {
      pos: state.flight.pos.toArray(), vel: state.flight.vel.toArray(),
      euler: [state.flight.euler.x, state.flight.euler.y, state.flight.euler.z],
      throttle: state.flight.throttle, flaps: state.flight.flaps, fuel: state.flight.fuel,
    },
    score: state.score,
    t: Date.now()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

function buildWorld() {
  while (world.children.length > 1) world.remove(world.children[1]);
  if (terrain) terrain.geometry.dispose();
  if (clouds) clouds.geometry.dispose();
  if (rain) rain.geometry.dispose();

  const q = QUALITY[state.selected.quality];
  renderer.setPixelRatio(q.pixelRatio);
  renderer.shadowMap.enabled = q.shadow;

  const ap = AIRPORTS[state.selected.airport];
  const we = WEATHER[state.selected.weather];
  scene.fog.color.set(ap.ambient);
  scene.fog.density = we.fog;
  hemi.groundColor.setHex(ap.worldColor);
  sun.color.setHex(ap.sun);

  runway.material.color.setHex(0x2d3238);
  runway.rotation.z = THREE.MathUtils.degToRad(ap.runwayHeading);

  const terrainGeo = new THREE.PlaneGeometry(6000, 6000, q.terrainSeg, q.terrainSeg);
  terrainGeo.rotateX(-Math.PI / 2);
  const arr = terrainGeo.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    const x = arr[i], z = arr[i + 2];
    const d = Math.hypot(x, z) / 6000;
    const hills = (Math.sin(x * 0.004) + Math.cos(z * 0.006) + Math.sin((x + z) * 0.003)) * 25;
    const flattenRunway = Math.exp(-(Math.abs(z) / 260) ** 2) * Math.exp(-(Math.abs(x) / 90) ** 2) * 70;
    arr[i + 1] = ap.ground + hills * (1 - d) - flattenRunway;
  }
  terrainGeo.computeVertexNormals();
  terrain = new THREE.Mesh(terrainGeo, new THREE.MeshStandardMaterial({ color: ap.worldColor, roughness: 0.94, metalness: 0.04 }));
  terrain.receiveShadow = true;
  world.add(terrain);

  const cloudGeo = new THREE.BufferGeometry();
  const cloudPos = [];
  for (let i = 0; i < q.clouds; i++) {
    cloudPos.push((Math.random() - 0.5) * 5000, 220 + Math.random() * 1000, (Math.random() - 0.5) * 5000);
  }
  cloudGeo.setAttribute('position', new THREE.Float32BufferAttribute(cloudPos, 3));
  clouds = new THREE.Points(cloudGeo, new THREE.PointsMaterial({ color: 0xf2f7ff, size: 95, transparent: true, opacity: 0.15 + we.cloud * 0.38, depthWrite: false }));
  world.add(clouds);

  const rainGeo = new THREE.BufferGeometry();
  const rainPos = [];
  for (let i = 0; i < q.rain; i++) {
    rainPos.push((Math.random() - 0.5) * 2400, Math.random() * 1200, (Math.random() - 0.5) * 2400);
  }
  rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(rainPos, 3));
  rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x9cc9ff, size: 3, transparent: true, opacity: we.rain * 0.7 }));
  world.add(rain);

  for (let i = 0; i < 120; i++) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffdc96 : 0x79c4ff }));
    const side = i % 2 ? -20 : 20;
    light.position.set(side, ap.ground + 0.5, -380 + i * 6.4);
    light.rotation.y = runway.rotation.z;
    world.add(light);
  }
}

function resetFlight(fromSave = null) {
  const ap = AIRPORTS[state.selected.airport];
  if (fromSave) {
    state.selected = fromSave.selected ?? state.selected;
    state.flight.pos.fromArray(fromSave.flight.pos);
    state.flight.vel.fromArray(fromSave.flight.vel);
    state.flight.euler.set(...fromSave.flight.euler);
    state.flight.throttle = fromSave.flight.throttle;
    state.flight.flaps = fromSave.flight.flaps;
    state.flight.fuel = fromSave.flight.fuel;
    state.score = fromSave.score ?? state.score;
  } else {
    state.flight.pos.set(0, ap.ground + 6.8, 320);
    state.flight.vel.set(0, 0, -52);
    state.flight.euler.set(0, Math.PI + THREE.MathUtils.degToRad(ap.runwayHeading), 0);
    state.flight.throttle = 0.45;
    state.flight.flaps = 0;
    state.flight.fuel = 1;
    state.score = { distanceNm: 0, smoothness: 100 };
  }
  dom.throttleSlider.value = String(state.flight.throttle);
  dom.flapsSlider.value = String(state.flight.flaps);
  buildWorld();
}

function handleInput(dt) {
  const c = state.controls;
  const keyPitch = (keys.has('KeyW') ? -1 : 0) + (keys.has('KeyS') ? 1 : 0);
  const keyRoll = (keys.has('KeyD') ? 1 : 0) + (keys.has('KeyA') ? -1 : 0);
  const keyYaw = (keys.has('KeyE') ? 1 : 0) + (keys.has('KeyQ') ? -1 : 0);

  c.pitch = THREE.MathUtils.lerp(c.pitch, THREE.MathUtils.clamp(c.pitch + keyPitch * 0.8, -1, 1), 0.22);
  c.roll = THREE.MathUtils.lerp(c.roll, THREE.MathUtils.clamp(c.roll + keyRoll * 0.8, -1, 1), 0.22);
  c.yaw = THREE.MathUtils.lerp(c.yaw, THREE.MathUtils.clamp(c.yaw + keyYaw * 0.8, -1, 1), 0.2);

  if (keys.has('ShiftLeft') || keys.has('ShiftRight')) state.flight.throttle = Math.min(1, state.flight.throttle + dt * 0.28);
  if (keys.has('ControlLeft') || keys.has('ControlRight')) state.flight.throttle = Math.max(0, state.flight.throttle - dt * 0.28);
  if (keys.has('BracketRight')) state.flight.flaps = Math.min(1, state.flight.flaps + dt * 0.45);
  if (keys.has('BracketLeft')) state.flight.flaps = Math.max(0, state.flight.flaps - dt * 0.45);

  dom.throttleSlider.value = String(state.flight.throttle);
  dom.flapsSlider.value = String(state.flight.flaps);
}

function updateFlight(dt, t) {
  const ac = AIRCRAFT[state.selected.aircraft];
  const ap = AIRPORTS[state.selected.airport];
  const we = WEATHER[state.selected.weather];

  const f = state.flight;
  const spd = f.vel.length();
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(f.euler).normalize();
  const up = new THREE.Vector3(0, 1, 0).applyEuler(f.euler).normalize();

  const aoa = THREE.MathUtils.clamp(forward.y * -0.8 + state.controls.pitch * 0.2, -0.35, 0.4);
  const rho = 1.225 * Math.exp(-f.pos.y / 9000);
  const liftCoeff = ac.liftSlope * aoa * (1 + f.flaps * 0.45) * (Math.abs(aoa) > ac.stallAoa ? 0.35 : 1);
  const dragCoeff = ac.dragBase + aoa * aoa * 0.72 + f.flaps * 0.095;

  const q = 0.5 * rho * spd * spd;
  const lift = up.clone().multiplyScalar(q * ac.wingArea * liftCoeff);
  const drag = f.vel.clone().normalize().multiplyScalar(-q * ac.wingArea * dragCoeff);
  const thrust = forward.clone().multiplyScalar(ac.thrustMax * f.throttle * f.fuel);
  const gravity = new THREE.Vector3(0, -9.81 * ac.mass, 0);

  state.weatherPulse += dt;
  const gustVec = ap.wind.clone().multiplyScalar(we.gust * (0.5 + 0.5 * Math.sin(state.weatherPulse * 0.7)));
  gustVec.x += Math.sin(t * 0.0017) * we.turbulence * 7;
  gustVec.y += Math.sin(t * 0.0023) * we.turbulence * 2.1;
  gustVec.z += Math.cos(t * 0.0015) * we.turbulence * 8;

  const netForce = lift.add(drag).add(thrust).add(gravity).add(gustVec.multiplyScalar(ac.mass));
  const accel = netForce.multiplyScalar(1 / ac.mass);
  f.vel.addScaledVector(accel, dt);
  f.pos.addScaledVector(f.vel, dt);

  const smoothPenalty = Math.min(12, Math.abs(accel.length() - 9.81) * 0.016);
  state.score.smoothness = Math.max(0, state.score.smoothness - smoothPenalty * dt + 0.4 * dt);
  state.score.distanceNm += spd * dt / 1852;

  f.euler.x += (-state.controls.pitch * ac.pitchRate + (spd > 45 ? 0 : 0.015)) * dt;
  f.euler.z += (-state.controls.roll * ac.rollRate - gustVec.x * 0.0002) * dt;
  f.euler.y += (-state.controls.yaw * ac.yawRate - f.euler.z * 0.24) * dt;
  f.euler.x = THREE.MathUtils.clamp(f.euler.x, -Math.PI * 0.45, Math.PI * 0.45);

  f.verticalSpeed = f.vel.y * 196.85;
  f.fuel = Math.max(0, f.fuel - dt * (0.0011 + f.throttle * 0.0027));

  const terrainH = sampleTerrainHeight(f.pos.x, f.pos.z) + 2.4;
  if (f.pos.y <= terrainH) {
    const crashVel = Math.abs(f.vel.y) + Math.abs(f.euler.z) * 40;
    f.pos.y = terrainH;
    if (crashVel > 18) {
      setStatus('Hard impact. Systems reset.');
      resetFlight();
    } else {
      f.vel.y = 0;
      f.vel.multiplyScalar(0.98);
      setStatus('Touchdown. Keep it stable.');
    }
  }

  aircraftMesh.position.copy(f.pos);
  aircraftMesh.rotation.copy(f.euler);

  updateWeatherVisuals(dt, we, t);
  updateCamera(dt);

  dom.spd.textContent = String(Math.max(0, Math.round(spd * 1.94384))).padStart(3, '0');
  dom.alt.textContent = String(Math.max(0, Math.round((f.pos.y - ap.ground) * 3.28084))).padStart(4, '0');
  const heading = (THREE.MathUtils.radToDeg(f.euler.y) % 360 + 360) % 360;
  dom.hdg.textContent = String(Math.round(heading)).padStart(3, '0');
  dom.vs.textContent = Math.round(f.verticalSpeed).toString();
  setStatus(`${AIRCRAFT[state.selected.aircraft].name} • ${AIRPORTS[state.selected.airport].name} • Fuel ${Math.round(f.fuel * 100)}% • Smooth ${Math.round(state.score.smoothness)}%`);

  if (Math.floor(t / 4000) !== Math.floor((t - dt * 1000) / 4000)) saveProgress();
}

function sampleTerrainHeight(x, z) {
  const ap = AIRPORTS[state.selected.airport];
  const d = Math.hypot(x, z) / 6000;
  const hills = (Math.sin(x * 0.004) + Math.cos(z * 0.006) + Math.sin((x + z) * 0.003)) * 25;
  const flattenRunway = Math.exp(-(Math.abs(z) / 260) ** 2) * Math.exp(-(Math.abs(x) / 90) ** 2) * 70;
  return ap.ground + hills * (1 - d) - flattenRunway;
}

function updateWeatherVisuals(dt, we, t) {
  if (clouds) {
    clouds.rotation.y += dt * 0.003;
    clouds.material.opacity = THREE.MathUtils.lerp(clouds.material.opacity, 0.12 + we.cloud * 0.42, 0.05);
  }
  if (rain) {
    const arr = rain.geometry.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] -= dt * (120 + 260 * we.rain);
      if (arr[i] < state.flight.pos.y - 20) arr[i] = state.flight.pos.y + 900 + Math.random() * 250;
    }
    rain.geometry.attributes.position.needsUpdate = true;
    rain.position.copy(state.flight.pos);
  }
  if (state.selected.weather === 'storm' && Math.random() < 0.015) {
    sun.intensity = 2.4;
    setTimeout(() => sun.intensity = 1.3, 80);
  }
  renderer.setClearColor(new THREE.Color().setHSL(0.58, 0.42, 0.16 + 0.06 * Math.sin(t * 0.00005) * (1 - we.cloud * 0.5)));
}

function updateCamera(dt) {
  const pos = state.flight.pos;
  const e = state.flight.euler;
  if (state.cameraMode === 0) {
    const back = new THREE.Vector3(0, 3, 16).applyEuler(e);
    camera.position.lerp(pos.clone().add(back), 0.08);
    camera.lookAt(pos.clone().add(new THREE.Vector3(0, 1.5, 0)));
  } else if (state.cameraMode === 1) {
    const side = new THREE.Vector3(-18, 8, 0).applyEuler(e);
    camera.position.lerp(pos.clone().add(side), 0.09);
    camera.lookAt(pos);
  } else {
    const cockpit = pos.clone().add(new THREE.Vector3(1.5, 1.3, 0).applyEuler(e));
    camera.position.lerp(cockpit, 0.15);
    camera.lookAt(cockpit.clone().add(new THREE.Vector3(0, 0.2, -18).applyEuler(e)));
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (state.running) {
    handleInput(dt);
    updateFlight(dt, now);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function applyMenuSelection() {
  state.selected.aircraft = dom.aircraftSelect.value;
  state.selected.airport = dom.airportSelect.value;
  state.selected.weather = dom.weatherSelect.value;
  state.selected.quality = dom.qualitySelect.value;
}

dom.launchBtn.addEventListener('click', () => {
  applyMenuSelection();
  resetFlight();
  dom.menu.style.display = 'none';
  state.running = true;
  saveProgress();
});

dom.resumeBtn.addEventListener('click', () => {
  const save = loadProgress();
  if (!save) {
    setStatus('No saved session found. Launch a new flight.');
    return;
  }
  state.selected = { ...state.selected, ...save.selected };
  dom.aircraftSelect.value = state.selected.aircraft;
  dom.airportSelect.value = state.selected.airport;
  dom.weatherSelect.value = state.selected.weather;
  dom.qualitySelect.value = state.selected.quality || 'medium';
  resetFlight(save);
  dom.menu.style.display = 'none';
  state.running = true;
});

setStatus('Engineering the impossible. Configure and launch.');
