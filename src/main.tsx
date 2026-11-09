import { hydrateRoot } from 'react-dom/client'
import { App } from './App'
import { AuthProvider } from './auth/AuthProvider'
import './styles.css'
import './ui-polish.css'
import './media-fallback.css'

hydrateRoot(document.getElementById('root')!,
  <AuthProvider><App initialPath={window.location.pathname} /></AuthProvider>,
)
