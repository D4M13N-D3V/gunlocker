# Gun Locker

A personal inventory and logbook application for tracking firearms, gear, ammunition, and range activities. Built with React and PocketBase.

## Features

- **Firearms Management** - Track firearms with photos, documents, serial numbers, and round counts
- **Ammunition Tracking** - Monitor ammo inventory by caliber with quantity tracking
- **Optics & Accessories** - Track optics and accessories with mounting relationships
- **Gear Management** - Organize gear by category with condition tracking
- **Maintenance Logs** - Log cleaning, repairs, and parts replacements per firearm
- **Range Trip Logging** - Record range sessions with ammo usage tracking
- **Dashboard** - Overview with stats, inventory value, and warranty alerts
- **Full Inventory View** - Search, filter, and export all items to CSV
- **Dark Mode** - System-aware theme with manual toggle

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: PocketBase (embedded SQLite)
- **Styling**: TailwindCSS
- **State**: TanStack Query (React Query)
- **Routing**: React Router v6

## Quick Start

### Using Docker (Recommended)

```bash
# Pull and run from GitHub Container Registry
docker run -d \
  -p 8090:8090 \
  -v gunlocker_data:/pb/pb_data \
  --name gunlocker \
  ghcr.io/d4m13n-d3v/gunlocker:latest

# Or use docker-compose
docker-compose up -d
```

Access the app at http://localhost:8090

### First Time Setup

1. Navigate to http://localhost:8090/_/ to access the PocketBase admin
2. Create a superuser account
3. Go to Settings > Import collections and import `pb_schema.json`
4. Return to http://localhost:8090 and register a user account

### Local Development

```bash
# Install dependencies
npm install

# Download PocketBase
npm run setup

# Start PocketBase (terminal 1)
npm run pocketbase

# Start frontend dev server (terminal 2)
npm run dev
```

Or run both together:
```bash
npm run start
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run setup` | Download PocketBase binary |
| `npm run pocketbase` | Start PocketBase server |
| `npm run start` | Start both PocketBase and frontend |

## Project Structure

```
gunlocker/
├── .github/workflows/    # CI/CD pipelines
├── pocketbase/           # PocketBase binary and data
├── scripts/              # Setup scripts
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── common/       # Reusable components
│   │   ├── firearms/     # Firearm-specific components
│   │   ├── ammunition/   # Ammo components
│   │   ├── gear/         # Gear components
│   │   └── ...
│   ├── hooks/            # React Query hooks
│   ├── lib/              # Utilities (PocketBase client, logger)
│   └── pages/            # Page components
├── Dockerfile            # Container build
├── docker-compose.yml    # Container orchestration
└── pb_schema.json        # PocketBase collection schema
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_POCKETBASE_URL` | PocketBase API URL | Auto-detected |

## Data Storage

All data is stored in the `pb_data` directory (or Docker volume). To backup:

```bash
# Docker
docker cp gunlocker:/pb/pb_data ./backup

# Local
cp -r pocketbase/pb_data ./backup
```

## Collections

- **firearms** - Firearm inventory with photos, documents
- **ammunition** - Ammo stock by caliber/brand
- **gear** - General gear (cases, mags, protection)
- **optics** - Scopes, red dots, etc.
- **accessories** - Lights, grips, suppressors, etc.
- **maintenance_logs** - Per-firearm maintenance history
- **range_trips** - Range session logs
- **range_trip_ammo** - Ammo usage per range trip

## License

MIT
