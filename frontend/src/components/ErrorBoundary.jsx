import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[PRATHOMIX] Render error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        color: '#f9fafb',
        fontFamily: 'sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          border: '1px solid rgba(239,68,68,0.2)',
          background: 'rgba(239,68,68,0.05)',
          borderRadius: '1rem',
          padding: '2.5rem',
          maxWidth: '480px',
          width: '100%',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
            Check the browser console for details.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg,#0a9090,#4040b8)',
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
