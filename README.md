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

The Docker image comes pre-configured with the app name and database schema. On first run, it automatically:
- Creates an admin account
- Imports all collection schemas
- Configures app settings

```bash
# Pull and run from GitHub Container Registry
docker run -d \
  -p 8090:8090 \
  -v gunlocker_data:/pb/pb_data \
  -e PB_ADMIN_EMAIL=admin@example.com \
  -e PB_ADMIN_PASSWORD=your_secure_password \
  --name gunlocker \
  ghcr.io/d4m13n-d3v/gunlocker:latest

# Or use docker-compose (edit docker-compose.yml first to set credentials)
docker-compose up -d
```

Access the app at http://localhost:8090

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PB_ADMIN_EMAIL` | Admin email (first run only) | `admin@gunlocker.local` |
| `PB_ADMIN_PASSWORD` | Admin password (first run only) | `changeme123` |
| `VITE_POCKETBASE_URL` | PocketBase API URL | Auto-detected |

### First Time Setup

1. Access the app at http://localhost:8090
2. Click "Register" to create a user account
3. Start adding your inventory!

**Admin Panel**: Access http://localhost:8090/_/ with your admin credentials to manage collections, users, and settings.

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

For local development, you'll need to manually import the schema:
1. Navigate to http://localhost:8090/_/
2. Create a superuser account
3. Go to Settings > Import collections and import `pb_schema.json`

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
├── entrypoint.sh         # Docker entrypoint with auto-setup
└── pb_schema.json        # PocketBase collection schema
```

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

## Versioning

This project uses semantic versioning with automatic releases:
- `feat:` commits trigger a minor version bump
- `fix:` commits trigger a patch version bump
- `BREAKING CHANGE:` in commit body triggers a major version bump

Docker images are tagged with:
- `latest` - Most recent main branch build
- `vX.Y.Z` - Specific version
- `vX.Y` - Latest patch of major.minor
- `vX` - Latest of major version

## License

MIT
