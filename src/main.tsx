import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initScheduler } from './services/scheduler'
import { initializeApp } from './utils/init'
import { reportStorageError } from './services/sync'
import { registerSW } from 'virtual:pwa-register'

// Initialize PWA service worker
registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload()
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Initialize notification scheduler
initScheduler()

// Initialize app data (GCP curriculum)
initializeApp().catch(error => {
  console.error(error)
  reportStorageError(error)
})

// Handle beforeunload to persist scheduler state
window.addEventListener('beforeunload', () => {
  // The scheduler persists state automatically
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)