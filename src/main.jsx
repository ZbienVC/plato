import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Redesigned modular app (switch back to './App.jsx' for legacy)
import App from './App-New.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
