# EV Database India - Setup and Deployment Guide

## Project Overview

EV Database India is a comprehensive web application for tracking and comparing electric vehicles available in the Indian market. The application provides detailed information about EV specifications, features, and prices, and offers comparison capabilities for users to evaluate different models.

### Key Features
- Searchable and filterable database of 45 EV models and 135 vehicle variants
- Detailed vehicle specifications and performance metrics
- Vehicle comparison tool (up to 3 vehicles)
  - Intuitive comparison bar with fully clickable vehicle cards 
  - Contextual UI with comparison bar hidden on the compare page
  - Optimized layouts for both mobile and desktop views
- Admin panel for content management with secure authentication
- Responsive design for mobile and desktop
  - Enhanced filter section with visual indicators in desktop mode
  - Mobile-optimized manufacturer filter popup
- Dual storage support
  - Primary PostgreSQL database for full functionality
  - In-memory fallback storage for restricted environments (like Replit)

## Tech Stack

- **Frontend**: React (TypeScript), ShadCN UI Components, Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: 
  - **Primary**: PostgreSQL with Drizzle ORM
  - **Fallback**: In-memory storage with CSV data import
- **Authentication**: Session-based authentication with Passport
- **Image Storage**: Cloudinary

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ev-database-india.git
cd ev-database-india
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL=postgres://username:password@localhost:5432/evdatabase
PGUSER=username
PGPASSWORD=password
PGDATABASE=evdatabase
PGHOST=localhost
PGPORT=5432

# Session Secret
SESSION_SECRET=your_random_string_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Create the Database
```bash
createdb evdatabase
```

Or use a PostgreSQL client to create the database.

### 5. Push Schema to Database
```bash
npm run db:push
```

This command utilizes Drizzle to push the schema defined in `shared/schema.ts` to your database.

### 6. Seed Initial Data (Optional)
The application includes automatic seeding of default data in `server/routes.ts`. If you want to customize this initial data, modify the `seedDefaultData()` function.

### 7. Start Development Server
```bash
npm run dev
```

The application should now be running on [http://localhost:5000](http://localhost:5000).

## Deployment

### Deploying to Production
1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Migrating to Heroku PostgreSQL

When migrating to Heroku's PostgreSQL service, consider the following:

1. **Connection String**: Heroku provides a `DATABASE_URL` environment variable. Use it directly or parse it to set individual PostgreSQL environment variables.

2. **SSL Requirement**: Heroku PostgreSQL requires SSL connections. Modify your database connection in `server/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Heroku PostgreSQL
  }
});

export const db = drizzle(pool, { schema });
```

3. **Connection Pooling**: Set appropriate pool sizes to avoid connection limit errors:

```typescript
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not established
});
```

4. **Database Migrations**: Run the schema push command during deployment:

```bash
# Add this to your Heroku Procfile or deployment script
node -e "require('./migrate.js').migrate()"
```

5. **Environment Variables**: Ensure all required environment variables are configured in Heroku's dashboard.

## Project Structure

```
├── attached_assets/     # CSV data files for in-memory storage
│   ├── manufacturers_final.csv  # Manufacturer data
│   ├── models_final.csv         # Car model data
│   └── vehicles_final.csv       # Vehicle variant data
├── client/              # Frontend React application
│   ├── src/             # Source files
│   │   ├── components/  # UI components
│   │   │   ├── admin/   # Admin dashboard components
│   │   │   └── ui/      # ShadCN UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   │   ├── queryClient.ts  # TanStack Query setup
│   │   │   └── filterHelpers.ts # Vehicle filtering utilities
│   │   ├── pages/       # Application pages
│   │   │   ├── home.tsx         # Homepage with filters
│   │   │   ├── vehicle-details.tsx # Vehicle details page
│   │   │   ├── compare.tsx      # Comparison page
│   │   │   ├── admin.tsx        # Admin dashboard
│   │   │   └── admin-login.tsx  # Admin login page
│   │   └── App.tsx      # Main application component
│   └── index.html       # HTML template
├── server/              # Backend Express application
│   ├── admin-routes.ts  # Admin API routes
│   ├── cloudinary.ts    # Image storage utilities
│   ├── db.ts            # Database connection and fallback
│   ├── index.ts         # Server entry point
│   ├── memory-storage.ts # In-memory storage implementation
│   ├── routes.ts        # Public API routes
│   ├── storage.ts       # PostgreSQL storage implementation
│   └── vite.ts          # Vite server configuration
├── shared/              # Shared code between frontend and backend
│   ├── schema.ts        # Database schema definition
│   └── types.ts         # Shared TypeScript types
├── DEVELOPMENT_NOTES.md # Developer documentation for dual storage
├── README.md            # Project documentation
├── drizzle.config.ts    # Drizzle ORM configuration
├── import-csv-data.ts   # Script to import CSV data
├── migrate.ts           # Database migration script
├── package.json         # Project configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Common Issues and Solutions

### Database Connection Issues

**Issue**: Unable to connect to the database
**Solution**: 
- Verify database credentials in environment variables
- Check if PostgreSQL service is running
- Ensure the database exists and is accessible

**Issue**: Database schema errors after updates
**Solution**:
- Run `npm run db:push` to update the database schema
- Check for schema conflicts in `shared/schema.ts`
- For data loss warnings, backup data before migration

### Image Upload Problems

**Issue**: Images not uploading or displaying
**Solution**:
- Verify Cloudinary credentials in environment variables
- Check if the image size is within limits (less than 10MB)
- Ensure your Cloudinary account has sufficient storage space

### Admin Access Issues

**Issue**: Unable to access admin panel
**Solution**:
- Default admin credentials are: username `ch8nya`, password `Solapurmh1`
- If forgotten, use the database to reset admin credentials:
```sql
UPDATE users SET password_hash = 'new_hashed_password' WHERE username = 'ch8nya';
```

### TypeScript and Build Errors

**Issue**: TypeScript compilation errors
**Solution**:
- Run `npx tsc --noEmit` to check for type errors
- Update type definitions in `shared/types.ts`
- Ensure component props match their interfaces

**Issue**: Build failures
**Solution**:
- Clear node modules and reinstall: `rm -rf node_modules && npm install`
- Check for outdated dependencies: `npm outdated`
- Verify compatibility of installed packages

### Mobile View Issues

**Issue**: UI elements not displaying correctly on mobile
**Solution**:
- Test with Chrome's device emulation mode
- Check responsive design with media queries
- Ensure the comparison bar doesn't obstruct content on small screens

### Comparison Feature Issues

**Issue**: Comparison bar showing on comparison page creates redundancy
**Solution**:
- The comparison bar is now automatically hidden when viewing the compare page
- Check if the `location` variable from `useLocation()` is correctly detecting the current route

**Issue**: Vehicle items in comparison bar not interactive enough
**Solution**:
- Vehicle cards in the comparison bar are now fully clickable
- Each card navigates to its respective vehicle details page
- The remove button uses `event.stopPropagation()` to prevent navigation when removing

### Filter UI Issues

**Issue**: "More Filters" button lacks visual indication of state
**Solution**:
- Added up/down arrow indicators that rotate based on the expanded/collapsed state
- Arrow transitions smoothly with CSS transform and transition properties
- Improves user experience by providing visual feedback on current state

### Storage System Issues

**Issue**: PostgreSQL connection fails in restricted environments (like Replit)
**Solution**:
- The application automatically falls back to in-memory storage when PostgreSQL connection fails
- The in-memory storage imports data from CSV files in the `attached_assets/` directory
- All API endpoints work the same way regardless of storage type

**Issue**: Data persistence when using in-memory storage
**Solution**:
- Data created in in-memory storage will be lost when the server restarts
- For persistent changes when using in-memory storage, update the CSV files directly
- For complete persistence, use PostgreSQL in an environment that supports it

## Special Considerations for AI Agents

1. **Database Schema Understanding**: The database schema is defined in `shared/schema.ts` using Drizzle ORM. When modifying database structure, always update the schema here rather than writing direct SQL queries.

2. **Dual Storage System**: 
   - `server/storage.ts` implements the PostgreSQL storage interface
   - `server/memory-storage.ts` implements the in-memory fallback storage
   - Both implement the same `IStorage` interface ensuring API compatibility
   - `server/db.ts` handles the automatic fallback mechanism

3. **API Structure**: 
   - Public API routes in `server/routes.ts`
   - Admin API routes in `server/admin-routes.ts`
   - Database access methods in `server/storage.ts` and `server/memory-storage.ts`

4. **Filter System Complexity**: The vehicle filtering system in `client/src/lib/filterHelpers.ts` handles multiple filter parameters and conversion between URL parameters and filter state.

5. **State Management**: The comparison feature uses React context for state management (`client/src/hooks/use-comparison.tsx`). Understand how selected vehicles are managed across components.

6. **Image Handling**: Vehicle images are stored in Cloudinary and referenced by URL in the database. The `server/cloudinary.ts` module handles image uploads and transformations.

7. **Authentication Flow**: Admin authentication uses Passport.js with a simple username/password strategy. Sessions are stored in the database.

8. **Type Inference**: The project leverages Drizzle's type inference capabilities. Look for `$inferSelect` types in `shared/schema.ts` to understand table types.

9. **UI Component System**: The project uses a mix of ShadCN UI components (in `client/src/components/ui`) and custom components. Understand the styling approach before making UI changes.

## Troubleshooting

If you encounter any issues not covered in the common issues section, try the following:

1. Check server logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure database schema is up-to-date with the latest changes
4. Check browser console for frontend errors
5. Verify API endpoint responses using a tool like Postman

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.