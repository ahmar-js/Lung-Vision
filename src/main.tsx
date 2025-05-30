import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient, queryConfig } from './lib/react-query'
import { validateEnv, envDebug } from './lib/env'
import './index.css'
import App from './App.tsx'

// Validate environment configuration on startup
const envValidation = validateEnv();
if (!envValidation.isValid) {
  console.warn('Environment validation failed:', envValidation.missing);
}

// Debug environment in development
envDebug();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {queryConfig.enableDevTools && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  </StrictMode>,
)
