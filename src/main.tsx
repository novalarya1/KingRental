import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Tempel Client ID kamu di sini */}
    <GoogleOAuthProvider clientId="250922195552-jpmt0jnsl641ml5s2sn53go81orj4btg.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)