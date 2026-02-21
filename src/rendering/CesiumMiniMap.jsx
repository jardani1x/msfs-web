import { useEffect, useRef } from 'react';
import {
  Cartesian3,
  EllipsoidTerrainProvider,
  HeadingPitchRoll,
  Ion,
  Math as CesiumMath,
  OpenStreetMapImageryProvider,
  Transforms,
  Viewer
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const MAP_AIRCRAFT_GLB =
  'https://raw.githubusercontent.com/BabylonJS/Assets/master/meshes/aerobatic_plane.glb';

export function CesiumMiniMap({ state }) {
  const ref = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || viewerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN;
    if (token) Ion.defaultAccessToken = token;

    const viewer = new Viewer(ref.current, {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      sceneModePicker: false,
      terrainProvider: new EllipsoidTerrainProvider(),
      imageryProvider: new OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })
    });

    viewer.scene.globe.enableLighting = true;

    viewer.entities.add({
      id: 'aircraft',
      model: {
        uri: MAP_AIRCRAFT_GLB,
        minimumPixelSize: 36,
        maximumScale: 200
      },
      position: Cartesian3.fromDegrees(0, 0, 0)
    });

    viewerRef.current = viewer;
    return () => viewer.destroy();
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const pos = Cartesian3.fromDegrees(state.lon, state.lat, Math.max(0, state.alt));
    const entity = viewer.entities.getById('aircraft');
    entity.position = pos;
    entity.orientation = Transforms.headingPitchRollQuaternion(
      pos,
      new HeadingPitchRoll(state.orientation.yaw, state.orientation.pitch, state.orientation.roll)
    );

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(state.lon, state.lat, Math.max(1500, state.alt + 2200)),
      orientation: {
        heading: state.orientation.yaw,
        pitch: CesiumMath.toRadians(-55),
        roll: 0
      },
      duration: 0
    });
  }, [state]);

  return <div className="mini-map" ref={ref} />;
}
