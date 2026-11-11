import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Đăng ký service worker tối giản để app cài đặt được (PWA) — không cache gì cả nên không gây lỗi "bản cũ" sau khi deploy
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)