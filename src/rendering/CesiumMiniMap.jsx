import { useEffect, useRef } from 'react';
import { Cartesian3, Color, Math as CesiumMath, Viewer } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

export function CesiumMiniMap({ state }) {
  const ref = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!ref.current || viewerRef.current) return;
    const viewer = new Viewer(ref.current, {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      sceneModePicker: false
    });
    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere.hueShift = -0.1;

    viewer.entities.add({
      id: 'aircraft',
      point: { pixelSize: 10, color: Color.CYAN },
      position: Cartesian3.fromDegrees(0, 0, 0)
    });

    viewerRef.current = viewer;
    return () => viewer.destroy();
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const pos = Cartesian3.fromDegrees(state.lon, state.lat, state.alt);
    const entity = viewer.entities.getById('aircraft');
    entity.position = pos;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(state.lon, state.lat, 12000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-70),
        roll: 0
      },
      duration: 0
    });
  }, [state.lat, state.lon, state.alt]);

  return <div className="mini-map" ref={ref} />;
}
