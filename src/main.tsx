import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

declare global {
  interface Window {
    OneSignalDeferred: any[]
  }
}

window.OneSignalDeferred = window.OneSignalDeferred || []

window.OneSignalDeferred.push(async (OneSignal: any) => {
  try {
    await OneSignal.init({
      appId: 'bac9b3ee-f874-4e62-bce5-69334f88dda7',
    })

    console.log('OneSignal init thành công')
  } catch (error) {
    console.error('OneSignal init lỗi:', error)
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)