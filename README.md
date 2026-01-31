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
  -e PB_ADMIN_EMAIL=your@email.com \
  -e PB_ADMIN_PASSWORD=your_secure_password \
  --name gunlocker \
  ghcr.io/d4m13n-d3v/gunlocker:latest
```

Access the app at http://localhost:8090

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PB_ADMIN_EMAIL` | Admin email (first run only) | `admin@gunlocker.local` |
| `PB_ADMIN_PASSWORD` | Admin password (first run only) | `changeme123` |

### First Time Setup

On first run, the container will automatically create an admin account using the environment variables above. You'll need to manually import the database schema:

1. **Access the Admin Panel**
   - Navigate to http://localhost:8090/_/
   - Log in with your admin credentials (the email/password from env vars, or defaults if not set)

2. **Import the Schema**
   - Go to **Settings** (gear icon) → **Import collections**
   - Copy the schema from the container:
     ```bash
     docker cp gunlocker:/pb/pb_schema.json ./pb_schema.json
     ```
   - Or download it from this repository: [pb_schema.json](./pb_schema.json)
   - Click **Load from JSON file** and select the schema file
   - Review the collections and click **Confirm and import**

3. **Start Using the App**
   - Navigate to http://localhost:8090
   - Click **Register** to create a user account
   - Start adding your inventory!

### Changing Admin Credentials

If you need to change the admin credentials after initial setup:

1. Access the admin panel at http://localhost:8090/_/
2. Go to **Settings** → **Admins**
3. Edit or create admin accounts as needed

Or use the PocketBase CLI inside the container:
```bash
docker exec -it gunlocker ./pocketbase superuser upsert newemail@example.com newpassword
```

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

For local development, follow the same schema import steps above using the admin panel at http://localhost:8090/_/

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
├── entrypoint.sh         # Docker entrypoint
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
