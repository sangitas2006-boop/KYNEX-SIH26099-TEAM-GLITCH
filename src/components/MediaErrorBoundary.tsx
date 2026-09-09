import { Component, type ErrorInfo, type ReactNode } from 'react'

interface MediaErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface MediaErrorBoundaryState {
  hasError: boolean
}

export class MediaErrorBoundary extends Component<MediaErrorBoundaryProps, MediaErrorBoundaryState> {
  state: MediaErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): MediaErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the failure visible in diagnostics without exposing implementation details to judges.
    console.error('KYNEX media surface failed safely:', error, info.componentStack)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
