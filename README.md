# MSFS-Web - Massive Web Flight Simulator

## Project Structure

```
msfs-web/
├── backups/              # Backups for rollback
│   └── backup_YYYYMMDD/  # Dated backups
├── milestones/           # Each version (M0-M6)
│   ├── M0/              # Project setup + Cesium
│   ├── M1/              # World + Aircraft
│   ├── M2/              # Physics Core
│   ├── M3/              # Controls + HUD + Mobile
│   ├── M4/              # Asset Pipeline + LOD
│   ├── M5/              # Performance Tuning
│   └── M6/              # Weather/Traffic (optional)
└── README.md
```

## Current Version: M0

### M0 - Project Setup
- TypeScript project with Vite
- CesiumJS for 3D geospatial rendering
- Module architecture defined

## Deployment

To deploy a milestone:
```bash
cd milestones/M0
npm install
npm run build
# Deploy dist/ to Vercel
```

## Backup & Rollback

Always backup before making changes:
```bash
cp -r . ../backups/backup_YYYYMMDD/
```

To rollback:
```bash
cp -r ../backups/backup_YYYYMMDD/* ./
```
