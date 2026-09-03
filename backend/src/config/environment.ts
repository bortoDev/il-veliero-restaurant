import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvironmentConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientOrigin: string;
  mongodb: {
    uri: string;
    connectTimeoutMs: number;
    autoMemoryFallback: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  masterEmergencyKey: string;
  masterAdminEmails: string[];
  upload: {
    dir: string;
    maxFileSizeBytes: number;
  };
  autoSeedIfEmpty: boolean;
  adminDefaults: {
    email: string;
    password: string;
  };
  gestoreDefaults: {
    username: string;
    email: string;
    password: string;
  };
  clientDefaults: {
    email: string;
    password: string;
  };
}

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
const maxFileSizeMb = parseNumber(process.env.MAX_FILE_SIZE_MB, 5);

const defaultMasterAdminEmails = [
  'admin@ilveliero.it',
];

const parsedMasterAdminEmails = (process.env.MASTER_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const env: EnvironmentConfig = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ilveliero',
    connectTimeoutMs: parseNumber(process.env.MONGODB_CONNECT_TIMEOUT_MS, 2500),
    autoMemoryFallback: parseBoolean(process.env.MONGODB_AUTO_MEMORY_FALLBACK, true),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'il_veliero_secret_jwt_key_2026_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  masterEmergencyKey:
    process.env.MASTER_EMERGENCY_KEY ||
    process.env.EMERGENCY_RECOVERY_KEY ||
    'EMERGENCY_KEY_VELIERO_2026_MASTER_OVERRIDE_BASSANO',
  masterAdminEmails:
    parsedMasterAdminEmails.length > 0 ? parsedMasterAdminEmails : defaultMasterAdminEmails,
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
  },
  autoSeedIfEmpty: parseBoolean(process.env.AUTO_SEED_IF_EMPTY, true),
  adminDefaults: {
    email: process.env.ADMIN_DEFAULT_EMAIL || 'admin@ilveliero.it',
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPass123!',
  },
  gestoreDefaults: {
    username: process.env.GESTORE_DEFAULT_USERNAME || 'gestore_veliero',
    email: process.env.GESTORE_DEFAULT_EMAIL || 'gestore@ilveliero.it',
    password: process.env.GESTORE_DEFAULT_PASSWORD || 'GestorePass123!',
  },
  clientDefaults: {
    email: process.env.CLIENT_DEFAULT_EMAIL || 'cliente@ilveliero.it',
    password: process.env.CLIENT_DEFAULT_PASSWORD || 'ClientPass123!',
  },
};

export default env;
