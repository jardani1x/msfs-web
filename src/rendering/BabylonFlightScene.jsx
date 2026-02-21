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
  StandardMaterial,
  Texture,
  Vector3
} from '@babylonjs/core';

export function BabylonFlightScene({ state, aircraft, weather }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const aircraftRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.02, 0.03, 0.05, 1);

    const camera = new ArcRotateCamera('cam', 0, 1.2, 120, new Vector3(0, 10, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 35;
    camera.upperRadiusLimit = 200;

    new HemisphericLight('sun', new Vector3(0.4, 1, 0.1), scene).intensity = 1.1;

    const ground = MeshBuilder.CreateGround('ground', { width: 5000, height: 5000, subdivisions: 40 }, scene);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.09, 0.12, 0.1);
    ground.material = groundMat;

    const runway = MeshBuilder.CreateGround('runway', { width: 80, height: 1500 }, scene);
    runway.position.y = 0.03;
    const runwayMat = new StandardMaterial('runwayMat', scene);
    runwayMat.diffuseColor = new Color3(0.15, 0.15, 0.17);
    runway.material = runwayMat;

    const body = MeshBuilder.CreateBox('plane', { width: 3, height: 1.2, depth: 9 }, scene);
    const wing = MeshBuilder.CreateBox('wing', { width: 16, height: 0.25, depth: 1.2 }, scene);
    wing.parent = body;
    wing.position.y = 0.1;
    const mat = new StandardMaterial('aircraftMat', scene);
    mat.diffuseColor = new Color3(0.6, 0.65, 0.7);
    body.material = mat;
    wing.material = mat;

    const rain = new ParticleSystem('rain', 3000, scene);
    rain.particleTexture = new Texture('https://playground.babylonjs.com/textures/flare.png', scene);
    rain.emitter = new Vector3(0, 80, 0);
    rain.minEmitBox = new Vector3(-300, -5, -300);
    rain.maxEmitBox = new Vector3(300, 5, 300);
    rain.direction1 = new Vector3(0, -1, 0);
    rain.direction2 = new Vector3(0.1, -1, 0.1);
    rain.minLifeTime = 0.2;
    rain.maxLifeTime = 0.6;
    rain.emitRate = 0;
    rain.minSize = 0.03;
    rain.maxSize = 0.09;
    rain.color1 = new Color4(0.6, 0.7, 1, 0.5);
    rain.color2 = new Color4(0.6, 0.7, 1, 0.3);
    rain.start();

    sceneRef.current = { scene, engine, camera, rain };
    aircraftRef.current = body;

    engine.runRenderLoop(() => scene.render());
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    const ref = aircraftRef.current;
    const sc = sceneRef.current;
    if (!ref || !sc) return;

    ref.position.x += ((state.lon % 1) * 900 - ref.position.x) * 0.08;
    ref.position.z += ((state.lat % 1) * 900 - ref.position.z) * 0.08;
    ref.position.y += (Math.max(1, state.alt * 0.2) - ref.position.y) * 0.08;

    ref.rotation.x = state.orientation.pitch;
    ref.rotation.y = -state.orientation.yaw;
    ref.rotation.z = state.orientation.roll;

    sc.camera.target = ref.position;
    sc.scene.fogDensity = weather.fog;
    sc.rain.emitRate = Math.floor(2000 * weather.rain);
  }, [state, weather, aircraft]);

  return <canvas ref={canvasRef} className="sim-canvas" />;
}
