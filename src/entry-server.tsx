import { renderToString } from 'react-dom/server'
import { App } from './App'
import { AuthProvider } from './auth/AuthProvider'

export function render(pathname: string) {
  return renderToString(<AuthProvider><App initialPath={pathname} /></AuthProvider>)
}
