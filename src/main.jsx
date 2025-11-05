// Import polyfills first
import './polyfills.js'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import StateProvider from './Utils/StateProvider.jsx'
import DashboardStateProvider from './Utils/DashboardStateProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateProvider>
    <DashboardStateProvider>
      <App />
      </DashboardStateProvider>
    </StateProvider>
  </React.StrictMode>,
)
