// Environment configuration utility
export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),

  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.VITE_NODE_ENV === 'production' || import.meta.env.PROD,

  // Feature Flags
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV,
  ENABLE_QUERY_DEVTOOLS: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true' || import.meta.env.DEV,

  // Storage Keys
  ACCESS_TOKEN_KEY: import.meta.env.VITE_ACCESS_TOKEN_KEY || 'access_token',
  REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',

  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Lung Vision',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const;

// Type-safe environment validation
export const validateEnv = () => {
  const requiredVars = ['VITE_API_BASE_URL'] as const;
  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    config: env,
  };
};

// Export for debugging
export const envDebug = () => {
  if (env.IS_DEVELOPMENT) {
    console.log('Environment Configuration:', env);
  }
}; 