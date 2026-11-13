import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  mensaje?: string
}

interface State {
  hayError: boolean
}

// Captura las promesas rechazadas que use() lanza durante el render
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hayError: false }

  static getDerivedStateFromError(): State {
    return { hayError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hayError) {
      return <div className="alert alert-warning">{this.props.mensaje ?? 'Ocurrió un error inesperado.'}</div>
    }
    return this.props.children
  }
}
