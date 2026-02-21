# MSFS Web — Orbital Flight

A mobile-friendly browser flight simulator inspired by Microsoft Flight Simulator, built with Three.js.

## Live Features

- Browser-based 3D simulator (Three.js, no backend required)
- Real-time flight dynamics (lift, drag, thrust, gravity, stalls, wind gusts)
- Multiple aircraft profiles (`Trainer`, `Jet`, `Cargo`)
- Multiple airports/locations (`Changi`, `Dubai`, `Anchorage`, `Rio`)
- Mobile touch controls (dual virtual sticks + throttle/flaps sliders)
- Weather system (`Clear`, `Cloudy`, `Storm`, `Windy`) with turbulence + rain + lightning
- Save/Resume progress with `localStorage`
- Quality tiers for device performance (`Low/Medium/High`)

---

## Elon-Mode Iterative Engineering Log

### Iteration 1 — Initial Version
**What was built:**
- Basic aircraft physics + input controls
- Single visual environment with runway
- Aircraft/weather/location selectors
- HUD metrics and menu

**Weaknesses identified:**
1. **Physics too arcade-like** at edge-of-envelope conditions (stall behavior was weak).
2. **Environment lacked depth** (not enough atmospheric variation and weather immersion).
3. **Mobile UX was incomplete** (no robust touch-stick handling and weak camera ergonomics).

### Iteration 2 — Physics & Control Overhaul
**Upgrades:**
- Added AoA-driven lift model and stronger stall degradation
- Added flaps impact on lift/drag, plus better yaw-roll coupling
- Added smoother control interpolation and turbulence force vectors

**Weaknesses identified:**
1. **Visual fidelity still moderate** (needed richer terrain/cloud dynamics).
2. **Weather felt cosmetic** (needed stronger visual + dynamic coupling).
3. **Persistence too shallow** (insufficient scoring/session continuity).

### Iteration 3 — Visual + Weather + Persistence Upgrade
**Upgrades:**
- Procedural terrain relief with runway flattening logic
- Cloud volume points + dynamic rain field + occasional storm lightning
- Save/Resume expanded to include selected config and score state

**Weaknesses identified:**
1. **Device adaptation needed more flexibility** for lower-end phones.
2. **Camera transitions could be sharper** for gameplay feel.
3. **User feedback needed better operational context** (smoothness/fuel/status readability).

### Iteration 4 — Production Refinement (Final)
**Final improvements implemented:**
- Added graphics quality profiles with pixel-ratio and effects scaling
- Tuned camera modes for chase/side/cockpit with smoother interpolation
- Improved HUD with fuel + smoothness + location/aircraft status context
- Polished mobile controls for practical one-handed/two-thumb use
- Strengthened default scene/lighting/fog profile for cinematic visuals

This final version is optimized for **production-ready web deployment** with practical performance controls and immersive flight behavior.

---

## Controls

### Desktop
- **W/S**: pitch
- **A/D**: roll
- **Q/E**: yaw
- **Shift / Ctrl**: throttle up/down
- **[ / ]**: flaps
- **Camera button**: cycle view

### Mobile
- **Left stick**: pitch + roll
- **Right stick**: yaw + fine pitch blend
- **Throttle slider** and **Flaps slider**

---

## Run Locally

```bash
# from repository root
python3 -m http.server 8080
# open http://localhost:8080
```

(Or use any static file server.)

---

## Deploy

### Vercel
This project is static. Deploy directly:

```bash
vercel --prod
```

### GitHub
Repository target:
- https://github.com/jardani1x/msfs-web

---

## Notes

This is a high-fidelity web simulation experience, not a full CFD-grade certified simulator. The architecture is designed for extension: terrain tiles, multiplayer, AI traffic, and instrument systems can be layered in next.
