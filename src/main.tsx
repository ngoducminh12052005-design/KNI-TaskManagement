import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

declare global {
  interface Window { OneSignalDeferred: any[] }
}
window.OneSignalDeferred = window.OneSignalDeferred || []
window.OneSignalDeferred.push(async (OneSignal: any) => {
  await OneSignal.init({ appId: 'bac9b3ee-f874-4e62-bce5-69334f88dda7' })
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}