import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './layout.css'
import App from './App'
import { FiltroProvider } from './context/FiltroContext'
import { SessionProvider } from './context/SessionContext'
import { ThemeProvider } from './context/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <FiltroProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </FiltroProvider>
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>,
)