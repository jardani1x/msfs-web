import { useRef } from 'react';

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function MobileControls({ controlsRef }) {
  const touchStart = useRef(null);

  const onStick = (e) => {
    const t = e.touches[0];
    if (!touchStart.current) touchStart.current = { x: t.clientX, y: t.clientY };
    const dx = clamp((t.clientX - touchStart.current.x) / 120, -1, 1);
    const dy = clamp((t.clientY - touchStart.current.y) / 120, -1, 1);
    controlsRef.current.roll = dx;
    controlsRef.current.pitch = dy;
  };

  const reset = () => {
    touchStart.current = null;
    controlsRef.current.roll = 0;
    controlsRef.current.pitch = 0;
  };

  return (
    <div className="mobile-controls">
      <div className="touch-pad" onTouchStart={onStick} onTouchMove={onStick} onTouchEnd={reset}>Stick</div>
      <div className="sliders glass">
        <label>
          Throttle
          <input type="range" min="0" max="1" step="0.01" defaultValue="0.15" onChange={(e) => (controlsRef.current.throttle = Number(e.target.value))} />
        </label>
        <label>
          Flaps
          <input type="range" min="0" max="1" step="0.1" defaultValue="0" onChange={(e) => (controlsRef.current.flaps = Number(e.target.value))} />
        </label>
        <label>
          Yaw
          <input type="range" min="-1" max="1" step="0.01" defaultValue="0" onChange={(e) => (controlsRef.current.yaw = Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}
