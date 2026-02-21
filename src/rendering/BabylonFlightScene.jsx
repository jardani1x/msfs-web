import { useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  ParticleSystem,
  Scene,
  SceneLoader,
  StandardMaterial,
  Texture,
  TransformNode,
  Vector3,
  VertexBuffer
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

const AIRCRAFT_MODELS = {
  c172: {
    url: 'https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/aerobatic_plane.glb',
    targetLength: 9,
    color: new Color3(0.93, 0.95, 0.99)
  },
  b737: {
    url: 'https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/highPolyPlane.glb',
    targetLength: 39,
    color: new Color3(0.88, 0.9, 0.95)
  },
  fa18: {
    url: 'https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/Demos/optimized/acrobaticPlane_variants.glb',
    targetLength: 17,
    color: new Color3(0.7, 0.72, 0.76)
  }
};

function createFallbackAircraft(scene, color) {
  const root = new TransformNode('fallback-aircraft', scene);
  const fuselage = MeshBuilder.CreateCylinder('fuselage', { height: 10, diameterTop: 0.6, diameterBottom: 1.2, tessellation: 16 }, scene);
  fuselage.rotation.z = Math.PI / 2;
  fuselage.parent = root;

  const nose = MeshBuilder.CreateSphere('nose', { diameter: 1, segments: 16 }, scene);
  nose.parent = root;
  nose.position.x = 5.2;

  const wing = MeshBuilder.CreateBox('wing', { width: 3.2, height: 0.2, depth: 12 }, scene);
  wing.parent = root;

  const tailWing = MeshBuilder.CreateBox('tail-wing', { width: 1.5, height: 0.15, depth: 4.5 }, scene);
  tailWing.parent = root;
  tailWing.position.x = -4;

  const fin = MeshBuilder.CreateBox('tail-fin', { width: 1.8, height: 2.2, depth: 0.2 }, scene);
  fin.parent = root;
  fin.position.x = -4.1;
  fin.position.y = 1.2;

  const mat = new StandardMaterial('fallback-aircraft-mat', scene);
  mat.diffuseColor = color;
  [fuselage, nose, wing, tailWing, fin].forEach((m) => {
    m.material = mat;
    m.isPickable = false;
  });

  return root;
}

function buildTerrain(scene) {
  const ground = MeshBuilder.CreateGround('terrain', { width: 8000, height: 8000, subdivisions: 220 }, scene);
  const positions = ground.getVerticesData(VertexBuffer.PositionKind);
  if (positions) {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      const hills = Math.sin(x * 0.0035) * 9 + Math.cos(z * 0.0024) * 7 + Math.sin((x + z) * 0.0018) * 12;
      const ridge = Math.sin((x - z) * 0.001) * 18;
      let y = hills + ridge;
      if (Math.abs(x) < 90 && Math.abs(z) < 1600) y = 0;
      if (Math.abs(x) < 180 && Math.abs(z) < 260) y = 0;
      positions[i + 1] = y;
    }
    ground.updateVerticesData(VertexBuffer.PositionKind, positions);
  }

  const groundMat = new StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new Color3(0.16, 0.25, 0.16);
  groundMat.specularColor = new Color3(0.03, 0.04, 0.03);
  ground.material = groundMat;

  const runway = MeshBuilder.CreateGround('runway', { width: 75, height: 3000, subdivisions: 1 }, scene);
  runway.position.y = 0.05;
  const runwayMat = new StandardMaterial('runwayMat', scene);
  runwayMat.diffuseColor = new Color3(0.13, 0.13, 0.14);
  runway.material = runwayMat;
}

export function BabylonFlightScene({ state, aircraft, weather }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const aircraftRef = useRef(null);
  const aircraftVisualRef = useRef(null);
  const originRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.44, 0.62, 0.9, 1);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogColor = new Color3(0.73, 0.81, 0.93);
    scene.fogDensity = 0.0005;

    const camera = new ArcRotateCamera('cam', 0, 1.05, 130, new Vector3(0, 12, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 200;

    new HemisphericLight('sun', new Vector3(0.4, 1, 0.1), scene).intensity = 1.15;
    buildTerrain(scene);

    const aircraftNode = new TransformNode('aircraftRoot', scene);

    const rain = new ParticleSystem('rain', 3000, scene);
    rain.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png', scene);
    rain.emitter = new Vector3(0, 90, 0);
    rain.minEmitBox = new Vector3(-300, -5, -300);
    rain.maxEmitBox = new Vector3(300, 5, 300);
    rain.direction1 = new Vector3(0, -1, 0);
    rain.direction2 = new Vector3(0.2, -1, 0.2);
    rain.minLifeTime = 0.2;
    rain.maxLifeTime = 0.7;
    rain.emitRate = 0;
    rain.minSize = 0.03;
    rain.maxSize = 0.08;
    rain.color1 = new Color4(0.6, 0.7, 1, 0.55);
    rain.color2 = new Color4(0.6, 0.7, 1, 0.3);
    rain.start();

    sceneRef.current = { scene, engine, camera, rain };
    aircraftRef.current = aircraftNode;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current?.scene;
    const root = aircraftRef.current;
    if (!scene || !root || !aircraft?.id) return;

    let disposed = false;
    const cfg = AIRCRAFT_MODELS[aircraft.id] ?? AIRCRAFT_MODELS.c172;

    if (aircraftVisualRef.current) {
      aircraftVisualRef.current.dispose(false, true);
      aircraftVisualRef.current = null;
    }

    const load = async () => {
      try {
        const result = await SceneLoader.ImportMeshAsync('', '', cfg.url, scene);
        if (disposed) {
          result.meshes.forEach((m) => m.dispose());
          return;
        }

        const visualRoot = new TransformNode(`visual-${aircraft.id}`, scene);
        result.meshes.forEach((mesh) => { mesh.parent = visualRoot; });
        visualRoot.parent = root;

        const bb = visualRoot.getHierarchyBoundingVectors(true);
        const size = bb.max.subtract(bb.min);
        const longest = Math.max(size.x, size.y, size.z, 0.01);
        const scale = cfg.targetLength / longest;
        visualRoot.scaling = new Vector3(scale, scale, scale);

        const after = visualRoot.getHierarchyBoundingVectors(true);
        const center = after.min.add(after.max).scale(0.5);
        visualRoot.position = visualRoot.position.subtract(center).add(new Vector3(0, 2, 0));

        aircraftVisualRef.current = visualRoot;
      } catch {
        const fallback = createFallbackAircraft(scene, cfg.color);
        fallback.parent = root;
        aircraftVisualRef.current = fallback;
      }
    };

    load();
    return () => {
      disposed = true;
    };
  }, [aircraft?.id]);

  useEffect(() => {
    const ref = aircraftRef.current;
    const sc = sceneRef.current;
    if (!ref || !sc) return;

    if (!originRef.current) originRef.current = { lat: state.lat, lon: state.lon };
    const { lat, lon } = originRef.current;
    const metersPerLon = 111_320 * Math.cos((lat * Math.PI) / 180);

    const targetX = (state.lon - lon) * metersPerLon;
    const targetZ = (state.lat - lat) * 111_320;
    const targetY = Math.max(1.8, state.alt * 0.35);

    ref.position.x += (targetX - ref.position.x) * 0.08;
    ref.position.z += (targetZ - ref.position.z) * 0.08;
    ref.position.y += (targetY - ref.position.y) * 0.08;

    ref.rotation.x = state.orientation.pitch;
    ref.rotation.y = -state.orientation.yaw;
    ref.rotation.z = state.orientation.roll;

    const yaw = -state.orientation.yaw;
    const chaseOffset = new Vector3(-Math.sin(yaw) * 52, 19, -Math.cos(yaw) * 52);
    const targetCamPos = ref.position.add(chaseOffset);
    sc.camera.position = Vector3.Lerp(sc.camera.position, targetCamPos, 0.08);
    sc.camera.setTarget(ref.position.add(new Vector3(0, 3.5, 0)));

    sc.rain.emitter = ref.position.add(new Vector3(0, 75, 0));
    sc.scene.fogDensity = 0.0005 + weather.fog * 0.008;
    sc.rain.emitRate = Math.floor(2600 * weather.rain);
  }, [state, weather]);

  return <canvas ref={canvasRef} className="sim-canvas" />;
}
