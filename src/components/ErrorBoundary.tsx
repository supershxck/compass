import React, { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Compass ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0f1c',
          color: '#c8d1e0',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '700px',
            background: '#121a2e',
            border: '1px solid #2a3855',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <h1 style={{ color: '#f0e6d2', marginTop: 0 }}>Something went wrong</h1>
            
            <p style={{ color: '#8a96b0' }}>
              Compass failed to initialize. This is common when opening the standalone <code>compass.html</code> file directly in some browsers or environments.
            </p>

            <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#0a0f1c', borderRadius: '8px', fontSize: '0.9rem' }}>
              <strong>Quick things to try:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                <li>Open in <strong>Chrome or Edge</strong> (best support for large inlined WASM)</li>
                <li>Try serving the file instead of double-clicking: <code>npx serve dist</code> then open http://localhost:3000/compass.html</li>
                <li>Check the browser console (F12) for detailed errors</li>
              </ul>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#c5a26f' }}>Show technical error</summary>
                <pre style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  background: '#0a0f1c',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
