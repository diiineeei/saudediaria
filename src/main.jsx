import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registro do Service Worker do PWA
import { registerSW } from 'virtual:pwa-register'

// Registra o service worker com atualização automática
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nova versão disponível, atualizando...')
  },
  onOfflineReady() {
    console.log('App pronto para funcionar offline!')
  },
  immediate: true
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
