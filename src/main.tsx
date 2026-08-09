import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PequenaPage } from './components/PequenaPage.tsx'

// No router needed for a single public route — just check the path directly.
const isPequenaRoute = window.location.pathname.replace(/\/+$/, '') === '/pequena'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPequenaRoute ? <PequenaPage /> : <App />}</StrictMode>,
)
