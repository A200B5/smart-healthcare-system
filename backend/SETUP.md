# Backend Setup Guide

This document outlines the exact requirements and steps needed to configure and run the backend server for the Smart Healthcare System.

## SQL Server Requirements
- **Database Engine**: Microsoft SQL Server (2016+ recommended).
- **Authentication**: SQL Server Authentication must be enabled. The application expects the `sa` user by default, but any dedicated database user with `db_owner` permissions can be configured.
- **Networking**: TCP/IP must be enabled in the SQL Server Configuration Manager, running on port `1433`.

## Expected Database
- **Exact Database Name**: `depi`

## Environment Variables
The backend relies on the `.env` file for configuration. 

### Required Variables
The application will explicitly fail to start and exit if any of the following variables are missing:
- `JWT_SECRET`: Secret key used for cryptographic signing of JSON Web Tokens.
- `DB_PASSWORD`: Password for the SQL Server user.
- `DB_SERVER`: The hostname or IP address of the SQL Server.
- `DB_NAME`: The target database name (must be `depi`).

### Optional Variables (with Defaults)
The following variables will fallback to hardcoded defaults in the codebase if omitted:
- `PORT`: The port the Express server listens on. *(Default: `5000`)*
- `FRONTEND_URL`: Allowed CORS origin for the frontend application. *(Default: `http://localhost:5173`)*
- `DB_PORT`: SQL Server connection port. *(Default: `1433`)*
- `DB_USER`: SQL Server login user. *(Default: `sa`)*
- `DB_ENCRYPT`: Whether to encrypt the database connection. *(Default: `false`)*
- `DB_TRUST_CERT`: Whether to implicitly trust the server certificate. *(Default: `true`)*
- `JWT_EXPIRES_IN`: Duration until a generated JWT expires. *(Default: `7d`)*

## Setup Instructions
1. Navigate to the `backend/` directory.
2. Make a copy of the template configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your actual SQL Server credentials and a secure `JWT_SECRET`.
4. Install all required dependencies:
   ```bash
   npm install
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
6. You should see a success message indicating the server is running on the configured port and the database has connected.
