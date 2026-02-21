# MSFS Web (React + Vite + Babylon.js + CesiumJS)

A browser-based Microsoft Flight Simulator inspired experience with:
- Custom 6DOF-style aerodynamic simulation
- Multiple aircraft (Cessna 172, Boeing 737, F/A-18)
- Multiple airport spawn locations
- Babylon.js realtime 3D scene
- CesiumJS globe mini-map
- Mobile touch controls + desktop keyboard controls
- Weather presets with turbulence/rain/fog behavior
- Save progress via localStorage

## Stack
- React + Vite (UI shell)
- Babylon.js (3D world rendering)
- CesiumJS (global map / position context)
- Custom JS physics module (6DOF-inspired update loop)

## Controls
### Desktop
- `W/S` pitch
- `A/D` roll
- `Q/E` yaw
- `Shift/Ctrl` throttle up/down
- `[/]` flaps down/up

### Mobile
- Touch stick (pitch/roll)
- Sliders for throttle, flaps, yaw

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel
```bash
npm i -g vercel
vercel
vercel --prod
```

## GitHub repo target
`https://github.com/jardani1x/msfs-web`

If not yet connected:
```bash
git init
git remote add origin https://github.com/jardani1x/msfs-web.git
git add .
git commit -m "feat: initial msfs-web simulator"
git push -u origin main
```
